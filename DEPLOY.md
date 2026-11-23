# SkillStreak Deployment Guide

Deploy SkillStreak to GKE cluster `im-sbox-gke-dev`.

## Prerequisites

- `gcloud` CLI authenticated
- `kubectl` configured
- Access to GKE cluster `im-sbox-gke-dev` in project `im-sbox-dev`

## 1. Configure kubectl

```bash
gcloud container clusters get-credentials im-sbox-gke-dev \
  --region us-central1 \
  --project im-sbox-dev
```

## 2. Update Secrets

Edit `k8s/base/secrets.yaml` with your values:

```yaml
stringData:
  AUTH_PASSPHRASE: "your-secure-passphrase"
  NEXTAUTH_SECRET: "random-32-char-string"
```

Generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## 3. Deploy to Kubernetes

```bash
# Apply all resources
kubectl apply -k k8s/base/

# Watch deployment rollout
kubectl -n skillstreak rollout status deployment/skillstreak

# Check pod status
kubectl -n skillstreak get pods

# Get the LoadBalancer external IP
kubectl -n skillstreak get svc skillstreak
```

The app will be available at `http://<EXTERNAL-IP>:3000`.

## 4. Update Image Tag (after CI builds)

After GitHub Actions builds a new image:

```bash
# Update to specific SHA tag
kubectl -n skillstreak set image deployment/skillstreak \
  skillstreak=ghcr.io/vthiruveedhi/skillstreak:<sha> \
  init-db=ghcr.io/vthiruveedhi/skillstreak:<sha>

# Or with kustomize
cd k8s/base
kustomize edit set image ghcr.io/vthiruveedhi/skillstreak:TAG=<sha>
kubectl apply -k .
```

## Architecture

- **Database**: SQLite stored on a PersistentVolumeClaim (1Gi)
- **Replicas**: 1 (required for RWO volume)
- **Strategy**: Recreate (ensures clean volume handoff)
- **Init Container**: Runs database migrations and seeding on startup

## Backup & Restore

### Backup the SQLite database

```bash
# Find the pod name
POD=$(kubectl -n skillstreak get pods -l app=skillstreak -o jsonpath='{.items[0].metadata.name}')

# Copy the database file to local machine
kubectl cp skillstreak/$POD:/app/data/skillstreak.db ./skillstreak-backup-$(date +%Y%m%d).db

# Optional: also backup the WAL file if it exists
kubectl cp skillstreak/$POD:/app/data/skillstreak.db-wal ./skillstreak-backup-$(date +%Y%m%d).db-wal 2>/dev/null || true
```

### Restore from backup

```bash
# Scale down the deployment first
kubectl -n skillstreak scale deployment/skillstreak --replicas=0

# Wait for pod to terminate
kubectl -n skillstreak wait --for=delete pod -l app=skillstreak --timeout=60s

# Start a temporary pod to access the PVC
kubectl -n skillstreak run restore-pod --image=alpine --restart=Never \
  --overrides='{"spec":{"containers":[{"name":"restore","image":"alpine","command":["sleep","3600"],"volumeMounts":[{"name":"data","mountPath":"/data"}]}],"volumes":[{"name":"data","persistentVolumeClaim":{"claimName":"skillstreak-data"}}]}}'

# Wait for pod to be ready
kubectl -n skillstreak wait --for=condition=Ready pod/restore-pod --timeout=60s

# Copy backup to the PVC
kubectl cp ./skillstreak-backup.db skillstreak/restore-pod:/data/skillstreak.db

# Clean up restore pod
kubectl -n skillstreak delete pod restore-pod

# Scale back up
kubectl -n skillstreak scale deployment/skillstreak --replicas=1
```

## Logs & Debugging

```bash
# View app logs
kubectl -n skillstreak logs -l app=skillstreak -f

# View init container logs
kubectl -n skillstreak logs -l app=skillstreak -c init-db

# Exec into the pod
kubectl -n skillstreak exec -it deployment/skillstreak -- sh

# Check database file
kubectl -n skillstreak exec deployment/skillstreak -- ls -la /app/data/
```

## Troubleshooting

### Pod stuck in Init:CrashLoopBackOff
Check init container logs:
```bash
kubectl -n skillstreak logs -l app=skillstreak -c init-db
```

### Database locked errors
Ensure only one replica is running (Recreate strategy should handle this).

### PVC not binding
Check storage class availability:
```bash
kubectl get sc
kubectl -n skillstreak describe pvc skillstreak-data
```

## Optional: GKE Ingress with HTTPS

Create `k8s/overlays/production/ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: skillstreak
  namespace: skillstreak
  annotations:
    kubernetes.io/ingress.class: "gce"
    networking.gke.io/managed-certificates: "skillstreak-cert"
spec:
  rules:
    - host: skillstreak.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: skillstreak
                port:
                  number: 3000
---
apiVersion: networking.gke.io/v1
kind: ManagedCertificate
metadata:
  name: skillstreak-cert
  namespace: skillstreak
spec:
  domains:
    - skillstreak.example.com
```

Then update `NEXTAUTH_URL` in the deployment to match your domain.

## Clean Up

```bash
kubectl delete -k k8s/base/
```

Note: This will delete the PVC and all data. Take a backup first!
