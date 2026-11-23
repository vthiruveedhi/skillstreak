# SkillStreak Deployment Guide

## Prerequisites

- `kubectl` installed and configured
- Access to GKE cluster `im-sbox-gke-dev`
- Docker image built and pushed to GHCR (happens automatically on push to main)

## Quick Start

### 1. Connect to your GKE cluster

```bash
gcloud container clusters get-credentials im-sbox-gke-dev --region us-central1 --project im-sbox-dev
```

### 2. Update the secrets

Before deploying, edit `k8s/base/secrets.yaml` to set your actual values:

```bash
# Generate a secure password and auth secret
export DB_PASSWORD=$(openssl rand -base64 24)
export AUTH_SECRET=$(openssl rand -base64 32)
export AUTH_PASSPHRASE="your-secure-passphrase"

# Update the secrets file
sed -i "s/CHANGE_ME_TO_A_SECURE_PASSWORD/$DB_PASSWORD/g" k8s/base/secrets.yaml
sed -i "s/CHANGE_ME_TO_A_RANDOM_32_CHAR_STRING/$AUTH_SECRET/g" k8s/base/secrets.yaml
sed -i "s/CHANGE_ME_TO_YOUR_PASSPHRASE/$AUTH_PASSPHRASE/g" k8s/base/secrets.yaml
```

Or manually edit `k8s/base/secrets.yaml` with your preferred values.

### 3. Deploy the application

```bash
# Apply all resources
kubectl apply -k k8s/base/

# Wait for Postgres to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n skillstreak --timeout=120s

# Run the seed job to initialize the database
kubectl apply -f k8s/base/seed-job.yaml

# Check seed job status
kubectl logs -f job/skillstreak-seed -n skillstreak

# Wait for the app deployment to be ready
kubectl wait --for=condition=available deployment/skillstreak -n skillstreak --timeout=120s
```

### 4. Get the external IP

```bash
kubectl get svc skillstreak -n skillstreak -w
```

Wait for the `EXTERNAL-IP` to be assigned (may take 1-2 minutes on GKE).

### 5. Access the app

Open `http://<EXTERNAL-IP>` in your browser. Use the passphrase you set in step 2 to log in.

## Image Pull Configuration

The image is public on GHCR. If you need to use an imagePullSecret for private images:

```bash
# Create imagePullSecret
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_PAT \
  -n skillstreak

# Then add to deployment.yaml under spec.template.spec:
# imagePullSecrets:
#   - name: ghcr-secret
```

## Update the App URL (for HTTPS)

After deployment, update the `NEXTAUTH_URL` environment variable in the deployment:

```bash
kubectl set env deployment/skillstreak NEXTAUTH_URL=http://<EXTERNAL-IP> -n skillstreak
```

For HTTPS with a custom domain, see the optional Gateway/Ingress section below.

## Optional: HTTPS with GKE Managed Certificate

If you have a domain pointing to the LoadBalancer IP, create a ManagedCertificate:

```yaml
# k8s/base/certificate.yaml
apiVersion: networking.gke.io/v1
kind: ManagedCertificate
metadata:
  name: skillstreak-cert
  namespace: skillstreak
spec:
  domains:
    - skillstreak.yourdomain.com
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: skillstreak-ingress
  namespace: skillstreak
  annotations:
    networking.gke.io/managed-certificates: skillstreak-cert
    kubernetes.io/ingress.class: "gce"
spec:
  rules:
    - host: skillstreak.yourdomain.com
      http:
        paths:
          - path: /*
            pathType: ImplementationSpecific
            backend:
              service:
                name: skillstreak
                port:
                  number: 80
```

## Troubleshooting

### Check pod logs
```bash
kubectl logs -f deployment/skillstreak -n skillstreak
```

### Check pod status
```bash
kubectl describe pod -l app=skillstreak -n skillstreak
```

### Restart deployment
```bash
kubectl rollout restart deployment/skillstreak -n skillstreak
```

### Re-run seed job
```bash
kubectl delete job skillstreak-seed -n skillstreak
kubectl apply -f k8s/base/seed-job.yaml
```

### Connect to Postgres
```bash
kubectl exec -it postgres-0 -n skillstreak -- psql -U skillstreak -d skillstreak
```

## Clean Up

```bash
kubectl delete -k k8s/base/
```
