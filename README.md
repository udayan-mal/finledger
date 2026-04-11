# FinLedger | Premium Wealth Management Platform

![FinLedger Hero](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-339933?style=for-the-badge&logo=nodedotjs)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

FinLedger is a **unified, institutional-grade private wealth tracker**. Designed with a luxurious and meticulously crafted user interface, it provides users with a comprehensive dashboard to monitor their net worth, track expenses and income, manage stock and mutual fund investments, and gain AI-powered financial insights.

---

## 👥 Who is this for?

### 👔 For Non-Technical Users (What does it do?)
Managing personal finances can often feel like dealing with scattered spreadsheets. FinLedger brings everything into one beautiful, secure "private vault."
- **Total Visibility:** See all your bank accounts, cash, stocks, and mutual funds in one place.
- **AI Financial Advisor:** Powered by Google's Gemini AI, FinLedger analyzes your spending patterns and answers your financial questions in real-time.
- **Smart Tracking:** Easily categorize every transaction, plan budgets, set savings goals, and track recurring subscriptions so you never miss a bill.
- **Stunning Design:** A clean, ad-free, dark-themed experience with elegant visualizations of your cash flow and net worth.

### 💼 For Recruiters & Hiring Managers (Why does this matter?)
FinLedger is not a standard tutorial project. It is a **fully decoupled, full-stack monorepo** built to production standards. 
- **Complex State & Data Management:** Handles complex financial calculations dynamically on the frontend and ensures data integrity on the backend using integer-based (Paise/Cents) currency storage to prevent floating-point errors.
- **Modern AI Integration:** Successfully implements secure, server-side prompt engineering with the Google Gemini API to analyze active user holding data.
- **Secure Authentication:** Implements JWT-based HTTP-only authentication flows mirroring enterprise security patterns.
- **UI/UX Excellence:** Features a fully custom, responsive design system built entirely with Vanilla CSS/Tailwind without relying on heavy UI libraries, demonstrating a deep understanding of CSS, animations, and user experience.

### 💻 For Developers (How is it built?)
FinLedger employs a robust **Monorepo architecture** (via NPM Workspaces), cleanly separating a modern SSR-capable frontend from a RESTful API backend.

#### Tech Stack
- **Frontend (`web/frontend`)**: Next.js 14 (App Router), React, Tailwind CSS, Recharts for visual data, Axios (with interceptors for silent token refreshes).
- **Backend (`web/backend`)**: Node.js, Express.js, Prisma ORM, JSON Web Tokens (JWT), Google GenAI SDK.
- **Database**: SQLite (Development) / Ready for PostgreSQL (Production).

#### Key Technical Highlights
- **Decoupled Architecture:** The backend acts as a pure REST API independent of the frontend, allowing for future mobile app expansion using the exact same endpoints.
- **Centralized Error Handling:** Global middleware guarantees structured, consistent API responses (`success: Boolean, data: Object, error: String`).
- **Dynamic Metric Engine:** Calculates rolling 6-month cash streams, live net-worth calculations across multiple asset classes (Stocks + MFs + Cash), and dynamic Financial Health scores algorithmically.
- **Data Integrity:** All monetary values are handled in the fundamental denominator (Paise/Cents) in the database and safely formatted for the UI, ensuring 100% computational accuracy.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- Local `.env` files created based on the `.env.example` templates. Ensure you have a valid `GEMINI_API_KEY`.

### Installation
1. Clone the repository and install dependencies at the root level:
   ```bash
   npm install
   ```
2. Initialize the database schema via Prisma:
   ```bash
   cd web/backend
   npx prisma generate
   npx prisma db push
   cd ../..
   ```
3. Start the entire application concurrently (Both Frontend & Backend):
   ```bash
   npm run dev
   ```
4. Access the application:
   - Frontend Server: `http://localhost:3000`
   - Backend API URL: `http://localhost:4000/api/v1`

---

## 📸 Core Features

- **The Dashboard:** A unified look at your `Net Worth`, `Savings Rate`, and `Cash Flow`, combined with a calculated `Financial Health` score.
- **Transaction Ledger:** Add expenses or income quickly. Supports bulk CSV uploads for lightning-fast bank statement imports.
- **Investment Vault:** Track specific Stock Trades and Mutual Fund SIPs in real time.
- **AI Advisor:** A chat interface that acts as your personal wealth manager, contextually aware of your account balances and transaction history.

---

*Designed and Developed by [Udayan Mal]*
