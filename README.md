# FinLedger

**Institutional-grade personal wealth management platform** built with modern full-stack architecture. A production-ready monorepo demonstrating strong engineering fundamentals across authentication, financial data modeling, and responsive UI/UX.

![Status](https://img.shields.io/badge/status-active-success?style=for-the-badge)
![Frontend](https://img.shields.io/badge/frontend-Next.js%2014-black?style=for-the-badge&logo=next.js)
![Backend](https://img.shields.io/badge/backend-Express%20API-339933?style=for-the-badge&logo=nodedotjs)
![Database](https://img.shields.io/badge/database-Prisma-2D3748?style=for-the-badge&logo=prisma)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

## Overview

FinLedger is a complete end-to-end financial application showcasing:

- **Full-stack architecture**: Decoupled frontend and REST API with clear separation of concerns
- **Secure authentication**: JWT-based flows with httpOnly refresh tokens and access token rotation
- **Financial precision**: Integer-based currency storage (paise/cents) eliminating floating-point errors
- **Dynamic analytics**: Real-time dashboard with net worth, cash flow trends, and category breakdowns
- **Modern UI/UX**: Custom design system built with Tailwind CSS and Framer Motion animations
- **AI integration**: Backend-driven Gemini API integration for contextual financial advice

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS, Framer Motion, Recharts, Zustand |
| **Backend** | Node.js, Express.js, Prisma ORM, JWT auth, Redis-ready |
| **Database** | SQLite (development), PostgreSQL (production) |
| **Architecture** | npm workspaces monorepo (`web/frontend`, `web/backend`, `shared`) |

## Key Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Real-time net worth, savings rate, monthly cash flow trends, and financial health metrics |
| **Transaction Management** | Add income/expenses, bulk CSV imports, automatic categorization |
| **Portfolio Tracking** | Monitor individual stock trades and mutual fund SIPs with P&L calculations |
| **Budget & Goals** | Set savings targets, monitor recurring expenses, track progress |
| **Reports** | Period-based analytics with category breakdowns and trends |
| **Secure Auth** | Register, login, profile management with token-based session handling |

## Getting Started

### Prerequisites

- Node.js 18+ ([download](https://nodejs.org/))
- Git
- A modern terminal (PowerShell/Bash/Zsh)

### Quick Start

**1. Clone and install:**

```bash
git clone https://github.com/udayan-mal/finledger.git
cd finledger
npm install
```

**2. Configure environment variables:**

Create `.env` files from examples (⚠️ **Security Note** — `.env` files are **never committed** to GitHub, they contain secrets):

```bash
# Backend
cp web/backend/.env.example web/backend/.env

# Frontend  
cp web/frontend/.env.example web/frontend/.env
```

Edit each `.env` file with your configuration (API keys, database URLs, etc.).

**3. Initialize database:**

```bash
cd web/backend
npx prisma generate
npx prisma db push
cd ../..
```

**4. Start development servers:**

```bash
npm run dev
```

**5. Access the application:**

- **Frontend**: http://localhost:3000
- **Backend Health**: http://localhost:4000/health

## For Your Resume / Portfolio

**Technical Highlights:**

- Designed and deployed a full-stack financial platform using modern JavaScript frameworks (Next.js, Express, React)
- Implemented secure JWT-based authentication with httpOnly cookies and token refresh flows
- Built complex financial data models using integer-based currency storage to ensure calculation precision
- Developed real-time dashboard with aggregated metrics across multiple asset classes (cash, stocks, mutual funds)
- Architected a decoupled REST API backend independent of the frontend, enabling future mobile app expansion

**Professional Summary (30 seconds):**

> "FinLedger is a production-ready wealth management platform demonstrating full-stack expertise. It showcases secure authentication flows, precise financial calculations, real-time analytics, and modern UI/UX patterns. Built with Next.js 14, Express, Prisma, and Tailwind CSS."

## Production Deployment

This section guides you through deploying FinLedger to production using Neon (PostgreSQL), Render (backend API), and Vercel (frontend).

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel                               │
│            (Frontend: Next.js 14 App)                   │
│              https://finledger.vercel.app               │
│                                                         │
│  NEXT_PUBLIC_API_URL → Render Backend URL              │
└─────────────┬───────────────────────────────────────────┘
              │ (HTTPS REST API calls)
              │
┌─────────────▼───────────────────────────────────────────┐
│                    Render                               │
│          (Backend: Express.js API Server)               │
│        https://<service>.onrender.com/api/v1            │
│                                                         │
│  DATABASE_URL → Neon PostgreSQL Connection             │
└─────────────┬───────────────────────────────────────────┘
              │ (SQL queries)
              │
┌─────────────▼───────────────────────────────────────────┐
│                    Neon                                 │
│         (Managed PostgreSQL Database)                   │
│       Automatic backups, SSL encryption                 │
└─────────────────────────────────────────────────────────┘
```

### Step-by-Step Deployment Guide

#### 1️⃣ Create PostgreSQL Database (Neon)

1. Visit [neon.tech](https://neon.tech)
2. Create a new project named "FinLedger"
3. Copy the connection string (format: `postgresql://user:pass@host/dbname?sslmode=require`)
4. Store it securely — you'll need it in the next steps

#### 2️⃣ Prepare Backend for Production

Update Prisma datasource to PostgreSQL:

**File: `web/backend/prisma/schema.prisma`**

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

Regenerate Prisma client locally:

```bash
cd web/backend
npx prisma generate
cd ../..
```

Commit this change:

```bash
git add web/backend/prisma/schema.prisma
git commit -m "chore: switch datasource to postgresql for production"
git push origin main
```

#### 3️⃣ Deploy Backend (Render)

1. **Create Web Service:**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository
   - Select branch: `main`

2. **Configure Service:**
   - **Name:** finledger-api
   - **Root Directory:** `web/backend`
   - **Build Command:** `npm install && npm run prisma:generate && npx prisma db push`
   - **Start Command:** `npm run start`

3. **Set Environment Variables:**

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required for secure defaults |
| `PORT` | `4000` | Backend port |
| `DATABASE_URL` | `postgresql://...` | From Neon (step 1) |
| `JWT_ACCESS_SECRET` | Random 32+ char string | Generate: https://random.org/ |
| `JWT_REFRESH_SECRET` | Random 32+ char string | Different from access secret |
| `ACCESS_TOKEN_TTL` | `15m` | Token expiry duration |
| `REFRESH_TOKEN_TTL` | `30d` | Refresh token expiry |
| `FRONTEND_URL` | (leave blank for now) | Update after Vercel deploy |
| `GEMINI_API_KEY` | (optional) | For AI features |

4. **Verify Backend:**

Once deployed, test health endpoint:

```bash
curl https://<your-service>.onrender.com/health
# Should return: {"success":true,"data":{"status":"ok"},"error":null,"code":200}
```

#### 4️⃣ Deploy Frontend (Vercel)

1. **Create Project:**
   - Go to [vercel.com](https://vercel.com)
   - Import from GitHub
   - Select the finledger repository

2. **Configure Project:**
   - **Root Directory:** `web/frontend`
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `next build` (auto)
   - **Start Command:** `next start` (auto)

3. **Set Environment Variable:**

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://<your-render-service>.onrender.com/api/v1` |

4. **Deploy and Test:**

   - Vercel auto-deploys
   - Visit your Vercel URL
   - Test Register → Login → Dashboard flow

#### 5️⃣ Final Cross-Origin Configuration

After Vercel deployment, update Render backend to know the frontend URL:

1. Go to Render dashboard
2. Edit finledger-api Web Service
3. Update `FRONTEND_URL` environment variable with your Vercel deployment URL
4. Redeploy service

### Production Checklist

- [ ] Neon database created and connection tested
- [ ] Backend environment variables configured
- [ ] Backend deployed and health endpoint responds (curl test)
- [ ] Frontend deployed with correct `NEXT_PUBLIC_API_URL`
- [ ] User registration flow works end-to-end
- [ ] Dashboard loads without CORS errors
- [ ] Login persists after page refresh
- [ ] Monitor logs for any runtime errors

## ⚠️ Security & Environment Variables

### Why `.env` Files Are Not Committed to GitHub

Your `.env` file contains **sensitive credentials** that must never be exposed:

- Database passwords
- JWT signing secrets
- API keys (Google Gemini, etc.)
- Private database URLs

**The `.gitignore` file already excludes `.env` files:**

```
.env
.env.*
!.env.example
```

This means:
- ✅ `.env.example` (template) IS committed — safe template for developers
- ✅ `.env` (actual secrets) is **NEVER** committed — GitHub keeps credentials safe
- ✅ On your local machine, fill `.env` with real values
- ✅ In production, secrets are set via hosting platform dashboards (Render, Vercel)

### How Production Secrets Are Managed

| Environment | Secret Source | Method |
|-------------|---------------|--------|
| **Local Dev** | `.env` file (not committed) | Manual JSON file |
| **Render Backend** | Environment Variables UI | Web dashboard |
| **Vercel Frontend** | Environment Variables UI | Web dashboard |

Never commit `.env` — this is a critical security best practice.

---

## Project Structure

```
finledger/
├── web/
│   ├── frontend/              # Next.js 14 application
│   │   ├── src/
│   │   │   ├── app/          # App Router pages and layouts
│   │   │   ├── components/   # Reusable React components
│   │   │   ├── context/      # AuthContext for global state
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── lib/          # API client and utilities
│   │   │   └── utils/        # Helper functions
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   └── backend/               # Express.js API server
│       ├── src/
│       │   ├── app.js        # Express app setup
│       │   ├── index.js      # Server entry point
│       │   ├── controllers/  # Route handlers
│       │   ├── routes/       # API route definitions
│       │   ├── services/     # Business logic
│       │   ├── middleware/   # Express middleware
│       │   ├── config/       # Configuration (env, DB, etc.)
│       │   └── utils/        # Helper functions
│       ├── prisma/
│       │   └── schema.prisma # Database schema
│       ├── package.json
│       └── seed-dashboard.js # Test data seeder
│
├── shared/                     # Shared code across workspaces
│   ├── constants/
│   ├── types/
│   └── utils/
│
├── README.md
├── package.json              # Root monorepo config
└── .gitignore               # Excludes .env and secrets
```

## Available Scripts

```bash
# Root level (monorepo)
npm run dev              # Start frontend + backend concurrently
npm run build            # Build both frontend and backend
npm run lint             # Lint all workspaces
npm run test             # Run backend tests

# Frontend only
cd web/frontend
npm run dev              # Start Next.js dev server (port 3000)
npm run build            # Build for production
npm run start            # Run production build
npm run lint             # ESLint check

# Backend only
cd web/backend
npm run dev              # Start Express server with nodemon (port 4000)
npm run start            # Start Express server
npm run prisma:generate  # Regenerate Prisma client
npm run prisma:studio    # Open Prisma Studio UI
npm run seed:dashboard   # Populate test data
npm run test             # Run Vitest unit tests
```

## Architecture Decisions

### Monorepo with npm Workspaces

Keeping frontend and backend in a single repository allows:
- Shared type definitions and constants
- Atomic commits across features
- Easier refactoring of shared logic
- Single CI/CD pipeline

### Integer-Based Currency Storage

All monetary values are stored as **paise** (integer cents), not floats:

```
Display: ₹12,345.67
Storage: 1234567 paise
Benefits: Perfect precision, no floating-point errors
```

### JWT with Refresh Tokens

- Short-lived access tokens (15 minutes) in memory
- Long-lived refresh tokens (30 days) in secure httpOnly cookies
- Automatic token refresh on every API call
- Seamless user experience with secure credentials

### Decoupled REST API

- Backend is API-first, independent of frontend framework
- Allows future mobile app, CLI, or third-party integrations
- Consistent response format: `{ success, data, error, code }`

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT — See [LICENSE](LICENSE) for details.

---

**Built by** [Udayan Mal](https://github.com/udayan-mal)  
**Repository:** [github.com/udayan-mal/finledger](https://github.com/udayan-mal/finledger)
