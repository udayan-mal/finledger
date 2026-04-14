# FinLedger

Institutional-style personal finance tracker built as a production-ready full-stack monorepo.

![Status](https://img.shields.io/badge/status-active-success?style=for-the-badge)
![Frontend](https://img.shields.io/badge/frontend-Next.js%2014-black?style=for-the-badge&logo=next.js)
![Backend](https://img.shields.io/badge/backend-Express%20API-339933?style=for-the-badge&logo=nodedotjs)
![Database](https://img.shields.io/badge/database-Prisma-2D3748?style=for-the-badge&logo=prisma)

## Why This Project Stands Out

FinLedger demonstrates strong end-to-end engineering across product design, backend architecture, and financial-domain correctness.

- Full-stack monorepo with clear frontend/backend boundaries.
- Authentication with JWT access tokens and refresh-cookie flow.
- Financial calculations stored in integer paise to avoid float precision bugs.
- Real dashboard aggregation for net worth, cash flow, and category analytics.
- Responsive, polished UI with custom design language.
- AI advisor integration capability (Gemini) through backend services.

## Tech Stack

- Frontend: Next.js 14 App Router, React 18, Tailwind CSS, Framer Motion, Recharts
- Backend: Node.js, Express, Prisma ORM, Redis-ready middleware, JWT auth
- Database: SQLite for local development, PostgreSQL for production
- Workspace: npm workspaces monorepo (`web/frontend`, `web/backend`, `shared`)

## Core Features

- Dashboard with net worth, income/expense trends, savings rate, and portfolio metrics
- Accounts, transactions, budgets, goals, recurring expenses
- Stocks and mutual fund tracking
- Report views and financial summaries
- Secure login/register/profile flows

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment files:

- `web/backend/.env` from `web/backend/.env.example`
- `web/frontend/.env` from `web/frontend/.env.example`

3. Initialize database and Prisma client:

```bash
cd web/backend
npx prisma generate
npx prisma db push
cd ../..
```

4. Run frontend and backend together:

```bash
npm run dev
```

5. Open app:

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:4000/health`

## Portfolio / Resume Summary (Copy Ready)

- Built a production-style wealth management platform using Next.js 14, Express, Prisma, and JWT auth.
- Implemented robust financial data modeling using integer-based currency storage for precision-safe calculations.
- Designed and shipped an analytics dashboard with live metrics, trend charts, and category-level breakdowns.
- Architected a decoupled REST API backend and integrated secure frontend token workflows.

## Deployment Guide (Neon + Render + Vercel)

### 1. Prepare Production Database (Neon)

1. Create a Neon project and copy the connection string.
2. Use SSL-enabled URL format:

```text
postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
```

### 2. Switch Prisma to PostgreSQL Before Deploy

In `web/backend/prisma/schema.prisma`, set:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run locally once:

```bash
cd web/backend
npx prisma generate
```

### 3. Deploy Backend on Render

1. Create a new Render Web Service from this GitHub repo.
2. Root directory: `web/backend`
3. Build command:

```bash
npm install && npm run prisma:generate && npx prisma db push
```

4. Start command:

```bash
npm run start
```

5. Add environment variables in Render:

- `NODE_ENV=production`
- `PORT=4000`
- `DATABASE_URL=<your_neon_url>`
- `JWT_ACCESS_SECRET=<strong_random_secret>`
- `JWT_REFRESH_SECRET=<strong_random_secret>`
- `ACCESS_TOKEN_TTL=15m`
- `REFRESH_TOKEN_TTL=30d`
- `FRONTEND_URL=<your_vercel_url_after_frontend_deploy>`
- `GEMINI_API_KEY=<optional>`

6. Verify backend:

```text
https://<render-service>.onrender.com/health
```

### 4. Deploy Frontend on Vercel

1. Import this repo into Vercel.
2. Root directory: `web/frontend`
3. Add env var:

```text
NEXT_PUBLIC_API_URL=https://<render-service>.onrender.com/api/v1
```

4. Deploy and test login/dashboard flows.

### 5. Final Cross-Origin Sync

Update Render `FRONTEND_URL` with your final Vercel URL and redeploy backend.

## GitHub Update Commands

Run these from repository root:

```bash
git add README.md .gitignore
git commit -m "docs: portfolio-ready README and deployment guide"
git push origin main
```

If you also want to include your latest app code changes:

```bash
git add .
git commit -m "feat: finledger app updates and docs refresh"
git push origin main
```

## License

MIT

---

Built by Udayan Mal.
