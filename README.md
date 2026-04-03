# FinLedger (Web)

Production-grade web monorepo scaffold for luxury personal finance tracking.

## Workspaces
- web/frontend: Next.js 14 + Tailwind (JavaScript)
- web/backend: Node.js + Express + Prisma + PostgreSQL + Redis
- shared: Reusable constants, schemas, and financial utilities

## Quick Start
1. Copy environment files:
   - web/backend/.env.example -> web/backend/.env
   - web/frontend/.env.example -> web/frontend/.env.local
2. Install dependencies:
   - npm install
3. Start infrastructure:
   - docker compose -f web/backend/docker-compose.yml up -d
4. Run Prisma migration:
   - npm run prisma:migrate --workspace web/backend
5. Start apps:
   - npm run dev:backend
   - npm run dev:frontend

## Delivered Scope
- Monorepo structure for web-only delivery
- Auth with JWT access + refresh strategy
- Core finance APIs (transactions, stocks, mutual funds, dashboard, reports)
- Luxury dashboard-ready Next.js UI shell based on provided design
- Financial calculations using decimal.js with paise-safe handling
- Docker and CI bootstrap

## Next Steps
- Connect frontend forms to backend APIs end-to-end
- Add S3 receipt uploads and live market/NAV adapters
- Expand tests and API docs
