# SkillStreak 🔥

A Duolingo-style daily learning app for Senior SRE/Platform/Cloud Software Engineer interview preparation.

## Features

- 📚 **Structured Learning Path**: Units → Lessons → Challenges with progressive difficulty
- 🏆 **Gamification**: XP, hearts, streaks, and skill levels
- 📊 **Resume Score**: Track your interview readiness (starts at 85%, aim for 100%)
- 🎯 **Capstone Projects**: Real-world projects that become resume bullets
- 🔗 **Source Attribution**: All content linked to real GitHub learning resources
- 📱 **Mobile-First PWA**: Works great on iPhone home screen

## Curriculum

The curriculum covers:
- **Coding & DSA** - Based on [coding-interview-university](https://github.com/jwasham/coding-interview-university) and [NeetCode](https://github.com/neetcode-gh/leetcode)
- **System Design** - Based on [system-design-primer](https://github.com/donnemartin/system-design-primer)
- **Kubernetes & CKA** - Based on [kubernetes-the-hard-way](https://github.com/kelseyhightower/kubernetes-the-hard-way) and [CKA exercises](https://github.com/walidshaari/Kubernetes-Certified-Administrator)
- **AI Infrastructure** - Based on [vLLM](https://github.com/vllm-project/vllm) and [ml-engineering](https://github.com/stas00/ml-engineering)
- **Cloud & Infrastructure** - Based on [devops-exercises](https://github.com/bregman-arie/devops-exercises)
- **Behavioral** - STAR method practice tied to real resume experiences

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js with passphrase (single-user)
- **Deployment**: Kubernetes (GKE)

## Local Development

```bash
# Install dependencies
npm install

# Start Postgres
docker compose up postgres -d

# Create .env.local
cp .env.example .env.local
# Edit .env.local with your values

# Push schema and seed data
npm run db:push
npm run db:seed

# Start dev server
npm run dev
```

## Deployment

See [DEPLOY.md](./DEPLOY.md) for GKE deployment instructions.

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/     # Login page
│   ├── (main)/           # Protected routes
│   │   ├── learn/        # Learning path view
│   │   ├── lesson/       # Challenge flow
│   │   └── resume/       # Resume builder
│   └── api/              # API routes
├── components/           # React components
├── db/                   # Drizzle schema & queries
├── actions/              # Server actions
└── lib/                  # Utilities
k8s/
└── base/                 # Kubernetes manifests
```

## License

Private - built for Vivekaditya Thiruveedhi's interview prep.
