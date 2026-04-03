# FinLedger Web Architecture

## 1) Monorepo Structure (Web Only)
- web/frontend: Next.js 14 App Router, Tailwind, Zustand, Recharts
- web/backend: Express API, Prisma ORM, PostgreSQL, Redis cache/rate-limit
- shared: common constants, Zod schemas, money + XIRR + stock charge utilities

## 2) Database Schema
Defined in web/backend/prisma/schema.prisma with entities:
- users, accounts, transactions, transaction_splits, categories
- stock_trades, mutual_funds, budgets, goals, recurring_expenses
- net_worth_snapshots, ai_insights

Money is integer paise for accuracy. No float currency storage.

## 3) Backend API Routes (/api/v1)
- auth: register/login/refresh
- dashboard: summary
- transactions: CRUD
- accounts: list/create
- stock-trades: list/create with Indian charges
- mutual-funds: list/create
- budgets: list/create
- goals: list/create
- reports: range
- net-worth: history
- ai: chat + insights
- upload: receipt pre-signed URL scaffold

## 4) Frontend Pages
- /dashboard
- /transactions
- /stocks
- /mutual-funds
- /reports
- /budgets
- /net-worth

Shared shell:
- Desktop sidebar + mobile bottom nav
- luxury dark palette and gold accent
- glass panels, hover/focus micro-interactions

## 5) State Management Plan
- Zustand UI store for global UX state (theme, quick-add modal)
- Server state via API client module with future SWR/React Query integration
- Optimistic updates pattern for transactions and budgets

## 6) Authentication Flow
1. Register/Login returns short-lived access token
2. Refresh token in httpOnly cookie
3. Frontend sends Authorization: Bearer <access>
4. On 401, frontend calls refresh endpoint and retries request

## 7) Deployment Plan
- Frontend: Vercel
- Backend: Render/Railway Docker deploy
- Database: managed PostgreSQL (TimescaleDB extension enabled)
- Redis: managed Redis
- CI: GitHub Actions (install, prisma generate, test, build)

## 8) Premium Palette (60/30/10)
- 60% Primary: #0D0D1A
- 30% Secondary: #1C1F3A
- 10% Accent: #C9A84C
- Text primary: #F1F0EC, muted: #8E8EA0

## 9) Feature Roadmap
Phase 1 (done scaffold): auth, accounts, transactions, stocks, MF, dashboard shell.
Phase 2: real Yahoo/AMFI live adapters, CSV import, PDF/CSV exports, OCR receipts.
Phase 3: AI insights service, anomaly detection, budget coach, portfolio chatbot.
Phase 4: websocket live prices, PWA/offline sync, observability and hardening.

## 10) Suggested Extra Features
- Family role-based sharing (owner/member/viewer)
- Tax-loss harvesting hints
- Emergency fund health score
- December year-in-review animated story
- Rule engine for auto-categorization and spending limits
