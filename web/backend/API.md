# FinLedger API (Web Backend)

Base URL: /api/v1

## Auth
- POST /auth/register
- POST /auth/login
- POST /auth/refresh

## Dashboard
- GET /dashboard/summary

## Transactions
- GET /transactions
- POST /transactions
- PATCH /transactions/:id
- DELETE /transactions/:id

## Stocks
- GET /stock-trades
- POST /stock-trades

## Mutual Funds
- GET /mutual-funds
- POST /mutual-funds

## Budgets
- GET /budgets
- POST /budgets

## Goals
- GET /goals
- POST /goals

## Reports
- GET /reports/range?start=<iso>&end=<iso>&type=daily|weekly|monthly|quarterly|yearly|custom

## Net Worth
- GET /net-worth/history

## AI
- POST /ai/chat
- GET /ai/insights

## Upload
- POST /upload/receipt

All responses follow:
{
  "success": true,
  "data": {},
  "error": null,
  "code": 200
}
