import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { redis } from "../src/config/redis.js";

const runId = Date.now();
const testUser = {
  name: "E2E Tester",
  email: `e2e-smoke-${runId}@finledger.test`,
  password: "TestPassword123!",
  currencyPreference: "INR",
  timezone: "Asia/Kolkata"
};

const failures = [];
const checks = [];

const record = (ok, label, detail = "") => {
  checks.push({ ok, label, detail });
  if (!ok) failures.push({ label, detail });
};

const assert = (condition, label, detail = "") => {
  record(Boolean(condition), label, detail);
};

const nearlyEqual = (actual, expected, tolerance = 0.01) => Math.abs(actual - expected) <= tolerance;

const run = async () => {
  await prisma.$connect();
  await redis.connect().catch(() => {});

  const server = app.listen(0);
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;

  const request = async ({ method = "GET", path, token, body, query }) => {
    const qs = query ? `?${new URLSearchParams(query).toString()}` : "";
    const res = await fetch(`${baseUrl}${path}${qs}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
  };

  try {
    // Register + login
    const registerRes = await request({ method: "POST", path: "/auth/register", body: testUser });
    assert(registerRes.status === 201, "register returns 201", `status=${registerRes.status}`);
    assert(registerRes.json?.success === true, "register success=true");

    const loginRes = await request({
      method: "POST",
      path: "/auth/login",
      body: { email: testUser.email, password: testUser.password }
    });
    assert(loginRes.status === 200, "login returns 200", `status=${loginRes.status}`);
    const token = loginRes.json?.data?.accessToken;
    assert(Boolean(token), "login returns access token");

    const profileRes = await request({ method: "GET", path: "/auth/profile", token });
    assert(profileRes.status === 200, "profile fetch returns 200", `status=${profileRes.status}`);

    // Categories
    const categoryExpenseRes = await request({
      method: "POST",
      path: "/categories",
      token,
      body: { name: `Food-${runId}`, type: "EXPENSE", icon: "restaurant", color: "#f97316" }
    });
    const categoryIncomeRes = await request({
      method: "POST",
      path: "/categories",
      token,
      body: { name: `Salary-${runId}`, type: "INCOME", icon: "payments", color: "#22c55e" }
    });

    assert(categoryExpenseRes.status === 201 || categoryExpenseRes.status === 200, "expense category create works");
    assert(categoryIncomeRes.status === 201 || categoryIncomeRes.status === 200, "income category create works");

    const expenseCategoryId = categoryExpenseRes.json?.data?.id;
    const incomeCategoryId = categoryIncomeRes.json?.data?.id;

    const categoriesRes = await request({ method: "GET", path: "/categories", token });
    assert(categoriesRes.status === 200, "categories list returns 200");

    // Account
    const accountRes = await request({
      method: "POST",
      path: "/accounts",
      token,
      body: { type: "BANK", name: `E2E Bank ${runId}`, balancePaise: 5000000 }
    });
    assert(accountRes.status === 201, "account create returns 201", `status=${accountRes.status}`);
    const accountId = accountRes.json?.data?.id;
    assert(Boolean(accountId), "account id returned");

    const accountsRes = await request({ method: "GET", path: "/accounts", token });
    assert(accountsRes.status === 200, "accounts list returns 200");

    const nowIso = new Date().toISOString();

    // Transactions (income + expense)
    const incomeAmountPaise = 10000000;
    const expenseAmountPaise = 4000000;

    const incomeTxRes = await request({
      method: "POST",
      path: "/transactions",
      token,
      body: {
        accountId,
        categoryId: incomeCategoryId,
        type: "INCOME",
        amountPaise: incomeAmountPaise,
        date: nowIso,
        description: "E2E Salary"
      }
    });

    const expenseTxRes = await request({
      method: "POST",
      path: "/transactions",
      token,
      body: {
        accountId,
        categoryId: expenseCategoryId,
        type: "EXPENSE",
        amountPaise: expenseAmountPaise,
        date: nowIso,
        description: "E2E Groceries"
      }
    });

    assert(incomeTxRes.status === 201, "income transaction create returns 201", `status=${incomeTxRes.status}`);
    assert(expenseTxRes.status === 201, "expense transaction create returns 201", `status=${expenseTxRes.status}`);

    const txId = expenseTxRes.json?.data?.id;
    const txListRes = await request({ method: "GET", path: "/transactions", token });
    assert(txListRes.status === 200, "transactions list returns 200");

    const txPatchRes = await request({
      method: "PATCH",
      path: `/transactions/${txId}`,
      token,
      body: { description: "E2E Groceries Updated" }
    });
    assert(txPatchRes.status === 200, "transaction update returns 200", `status=${txPatchRes.status}`);

    // Stock trade CRUD
    const stockCreateRes = await request({
      method: "POST",
      path: "/stock-trades",
      token,
      body: {
        symbol: "TCS",
        platform: "Zerodha",
        totalChargesPaise: 2500,
        netPnlPaise: 50000,
        tradeType: "SELL",
        date: nowIso
      }
    });

    assert(stockCreateRes.status === 201, "stock trade create returns 201", `status=${stockCreateRes.status}`);
    const stockId = stockCreateRes.json?.data?.id;

    const stockListRes = await request({ method: "GET", path: "/stock-trades", token });
    assert(stockListRes.status === 200, "stock trade list returns 200");

    const stockPatchRes = await request({
      method: "PATCH",
      path: `/stock-trades/${stockId}`,
      token,
      body: {
        symbol: "TCS",
        platform: "Zerodha",
        totalChargesPaise: 2500,
        netPnlPaise: 45000,
        tradeType: "SELL",
        date: nowIso
      }
    });
    assert(stockPatchRes.status === 200, "stock trade update returns 200", `status=${stockPatchRes.status}`);

    // Mutual fund CRUD
    const mfCreateRes = await request({
      method: "POST",
      path: "/mutual-funds",
      token,
      body: {
        fundName: `E2E Fund ${runId}`,
        sipAmountPaise: 200000,
        type: "SIP",
        platform: "Groww",
        date: nowIso
      }
    });

    assert(mfCreateRes.status === 201, "mutual fund create returns 201", `status=${mfCreateRes.status}`);
    const mfId = mfCreateRes.json?.data?.id;

    const mfListRes = await request({ method: "GET", path: "/mutual-funds", token });
    assert(mfListRes.status === 200, "mutual fund list returns 200");

    const mfPatchRes = await request({
      method: "PATCH",
      path: `/mutual-funds/${mfId}`,
      token,
      body: {
        fundName: `E2E Fund ${runId} Updated`,
        sipAmountPaise: 210000,
        type: "SIP",
        platform: "Groww",
        date: nowIso
      }
    });
    assert(mfPatchRes.status === 200, "mutual fund update returns 200", `status=${mfPatchRes.status}`);

    // Budget + Goal + Recurring
    const budgetRes = await request({
      method: "POST",
      path: "/budgets",
      token,
      body: {
        categoryId: expenseCategoryId,
        period: "MONTHLY",
        amountPaise: 500000,
        rollover: false,
        startDate: nowIso
      }
    });
    assert(budgetRes.status === 201, "budget create returns 201", `status=${budgetRes.status}`);

    const goalRes = await request({
      method: "POST",
      path: "/goals",
      token,
      body: {
        name: `Emergency Fund ${runId}`,
        targetAmountPaise: 50000000,
        currentAmountPaise: 2500000,
        targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
    assert(goalRes.status === 201, "goal create returns 201", `status=${goalRes.status}`);

    const recurringRes = await request({
      method: "POST",
      path: "/recurring",
      token,
      body: {
        name: "Internet Bill",
        amountPaise: 150000,
        frequency: "MONTHLY",
        nextDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        active: true
      }
    });
    assert(recurringRes.status === 201, "recurring create returns 201", `status=${recurringRes.status}`);

    const recurringListRes = await request({ method: "GET", path: "/recurring", token });
    assert(recurringListRes.status === 200, "recurring list returns 200");

    // SIP plans + actions
    const sipCreateRes = await request({
      method: "POST",
      path: "/sip-plans",
      token,
      body: {
        fundName: `SIP Plan ${runId}`,
        amountPaise: 300000,
        frequency: "MONTHLY",
        dueDay: 5,
        accountId,
        platform: "Zerodha",
        type: "SIP",
        active: true
      }
    });
    assert(sipCreateRes.status === 201, "sip plan create returns 201", `status=${sipCreateRes.status}`);

    const sipId = sipCreateRes.json?.data?.id;

    const sipPaidRes = await request({
      method: "POST",
      path: `/sip-plans/${sipId}/mark-paid`,
      token,
      body: { note: "Paid in E2E test" }
    });
    assert(sipPaidRes.status === 200, "sip mark-paid returns 200", `status=${sipPaidRes.status}`);

    const sipSkipRes = await request({
      method: "POST",
      path: `/sip-plans/${sipId}/skip`,
      token,
      body: { note: "Skip in E2E test" }
    });
    assert(sipSkipRes.status === 200, "sip skip returns 200", `status=${sipSkipRes.status}`);

    const sipSnoozeRes = await request({
      method: "POST",
      path: `/sip-plans/${sipId}/snooze`,
      token,
      body: { note: "Snooze in E2E test", snoozeDays: 2 }
    });
    assert(sipSnoozeRes.status === 200, "sip snooze returns 200", `status=${sipSnoozeRes.status}`);

    const sipListRes = await request({ method: "GET", path: "/sip-plans", token });
    assert(sipListRes.status === 200, "sip plan list returns 200");

    // Reports + net worth + dashboard
    const start = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
    const end = new Date().toISOString();
    const reportRes = await request({
      method: "GET",
      path: "/reports/range",
      token,
      query: { start, end, type: "monthly" }
    });
    assert(reportRes.status === 200, "report range returns 200", `status=${reportRes.status}`);

    const netWorthRes = await request({ method: "GET", path: "/net-worth/history", token });
    assert(netWorthRes.status === 200, "net worth history returns 200", `status=${netWorthRes.status}`);

    const dashboardRes = await request({ method: "GET", path: "/dashboard/summary", token });
    assert(dashboardRes.status === 200, "dashboard summary returns 200", `status=${dashboardRes.status}`);

    const metrics = dashboardRes.json?.data?.metrics || {};
    const income = Number(metrics.monthlyIncomePaise || 0);
    const expense = Number(metrics.monthlyExpensePaise || 0);
    const reportedSavingsRate = Number(metrics.savingsRatePercent || 0);

    assert(income >= incomeAmountPaise, "dashboard monthly income includes created income", `income=${income}`);
    assert(expense >= expenseAmountPaise, "dashboard monthly expense includes created expense", `expense=${expense}`);

    const expectedSavingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
    assert(
      nearlyEqual(reportedSavingsRate, expectedSavingsRate, 0.2),
      "dashboard savings rate math is consistent",
      `reported=${reportedSavingsRate}, expected=${expectedSavingsRate.toFixed(2)}`
    );

    // Delete operations
    const txDeleteRes = await request({ method: "DELETE", path: `/transactions/${txId}`, token });
    assert(txDeleteRes.status === 200, "transaction delete returns 200", `status=${txDeleteRes.status}`);

    const stockDeleteRes = await request({ method: "DELETE", path: `/stock-trades/${stockId}`, token });
    assert(stockDeleteRes.status === 200, "stock trade delete returns 200", `status=${stockDeleteRes.status}`);

    const mfDeleteRes = await request({ method: "DELETE", path: `/mutual-funds/${mfId}`, token });
    assert(mfDeleteRes.status === 200, "mutual fund delete returns 200", `status=${mfDeleteRes.status}`);

    const sipDeleteRes = await request({ method: "DELETE", path: `/sip-plans/${sipId}`, token });
    assert(sipDeleteRes.status === 200, "sip plan delete returns 200", `status=${sipDeleteRes.status}`);

    const deletedTxListRes = await request({ method: "GET", path: "/transactions", token });
    assert(deletedTxListRes.status === 200, "final transactions list returns 200");
  } finally {
    await prisma.$disconnect().catch(() => {});
    await redis.disconnect();
    await new Promise((resolve) => server.close(resolve));
  }

  const passed = checks.filter((c) => c.ok).length;
  const total = checks.length;

  if (failures.length > 0) {
    console.error("\nE2E smoke test failed.");
    failures.forEach((f, i) => {
      console.error(`${i + 1}. ${f.label}${f.detail ? ` -> ${f.detail}` : ""}`);
    });
    console.error(`\nSummary: ${passed}/${total} checks passed.`);
    process.exit(1);
  }

  console.log(`\nE2E smoke test passed: ${passed}/${total} checks passed.`);
};

run().catch((error) => {
  console.error("E2E smoke test crashed:", error);
  process.exit(1);
});
