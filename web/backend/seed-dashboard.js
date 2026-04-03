#!/usr/bin/env node

/**
 * Dashboard Test Data Seeder
 * 
 * Creates test user with accounts, transactions, and holdings
 * for dashboard testing purposes
 * 
 * Usage: node seed-dashboard.js
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TEST_USER_ID = "test-user-dashboard-001";
const TEST_USER_EMAIL = "dashboard-test@finledger.com";
const TEST_USER_PASSWORD = "TestPassword123!";

async function seedDashboardData() {
  console.log("🌱 Seeding dashboard test data...\n");

  try {
    // 1. Check if user exists, create if not
    let user = await prisma.user.findUnique({
      where: { email: TEST_USER_EMAIL }
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(TEST_USER_PASSWORD, 10);
      user = await prisma.user.create({
        data: {
          id: TEST_USER_ID,
          name: "Dashboard Tester",
          email: TEST_USER_EMAIL,
          passwordHash: hashedPassword,
          currencyPreference: "INR",
          timezone: "Asia/Kolkata"
        }
      });
      console.log("✅ Created test user:", TEST_USER_EMAIL);
      console.log("   Password:", TEST_USER_PASSWORD, "\n");
    } else {
      console.log("ℹ️  User already exists:", TEST_USER_EMAIL, "\n");
    }

    // 2. Create accounts
    const accounts = await prisma.account.createMany({
      data: [
        {
          userId: user.id,
          type: "BANK",
          name: "HDFC Bank",
          balancePaise: 500000000 // ₹50,00,000
        },
        {
          userId: user.id,
          type: "CASH",
          name: "Wallet",
          balancePaise: 250000 // ₹2,500
        },
        {
          userId: user.id,
          type: "INVESTMENT",
          name: "Demat Account",
          balancePaise: 300000000 // ₹30,00,000
        }
      ],
      skipDuplicates: true
    });
    console.log("✅ Created accounts");

    // Get accounts for transactions
    const createdAccounts = await prisma.account.findMany({
      where: { userId: user.id }
    });
    const bankAccount = createdAccounts.find(a => a.type === "BANK");
    const cashAccount = createdAccounts.find(a => a.type === "CASH");

    // 3. Create categories
    const categories = await prisma.category.createMany({
      data: [
        {
          userId: user.id,
          name: "Salary",
          type: "INCOME",
          color: "#45B7D1"
        },
        {
          userId: user.id,
          name: "Freelance",
          type: "INCOME",
          color: "#5DADE2"
        },
        {
          userId: user.id,
          name: "Food & Dining",
          type: "EXPENSE",
          color: "#FF6B6B"
        },
        {
          userId: user.id,
          name: "Transportation",
          type: "EXPENSE",
          color: "#4ECDC4"
        },
        {
          userId: user.id,
          name: "Shopping",
          type: "EXPENSE",
          color: "#FFD93D"
        },
        {
          userId: user.id,
          name: "Entertainment",
          type: "EXPENSE",
          color: "#A8D8EA"
        },
        {
          userId: user.id,
          name: "Utilities",
          type: "EXPENSE",
          color: "#AA96DA"
        }
      ],
      skipDuplicates: true
    });
    console.log("✅ Created categories");

    const createdCategories = await prisma.category.findMany({
      where: { userId: user.id }
    });

    // 4. Create transactions for last 6 months
    const today = new Date();
    const transactionData = [];

    // Income transactions (monthly)
    for (let month = 5; month >= 0; month--) {
      const date = new Date();
      date.setMonth(date.getMonth() - month);
      date.setDate(1);

      transactionData.push({
        userId: user.id,
        accountId: bankAccount.id,
        type: "INCOME",
        amountPaise: 300000000, // ₹30,00,000
        categoryId: createdCategories.find(c => c.name === "Salary")?.id,
        note: "Monthly salary",
        date,
        tags: ["salary", "regular"]
      });

      // Add 1-2 freelance payments
      if (month % 2 === 0) {
        const freelanceDate = new Date(date);
        freelanceDate.setDate(15);
        transactionData.push({
          userId: user.id,
          accountId: bankAccount.id,
          type: "INCOME",
          amountPaise: 50000000, // ₹5,00,000
          categoryId: createdCategories.find(c => c.name === "Freelance")?.id,
          note: "Freelance project",
          date: freelanceDate,
          tags: ["freelance"]
        });
      }
    }

    // Expense transactions (random throughout months)
    const expenseCategories = ["Food & Dining", "Transportation", "Shopping", "Entertainment", "Utilities"];
    for (let month = 5; month >= 0; month--) {
      for (let day = 1; day <= 28; day += 3) {
        const date = new Date();
        date.setMonth(date.getMonth() - month);
        date.setDate(day);

        const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
        const amounts = [500000, 1000000, 1500000, 2000000, 2500000]; // ₹5k-25k
        const amount = amounts[Math.floor(Math.random() * amounts.length)];

        transactionData.push({
          userId: user.id,
          accountId: cashAccount.id,
          type: "EXPENSE",
          amountPaise: amount,
          categoryId: createdCategories.find(c => c.name === category)?.id,
          note: `${category} expense`,
          date,
          tags: [category.toLowerCase()]
        });
      }
    }

    await prisma.transaction.createMany({
      data: transactionData
    });
    console.log(`✅ Created ${transactionData.length} transactions`);

    // 5. Create mutual funds
    const mutualFunds = await prisma.mutualFund.createMany({
      data: [
        {
          userId: user.id,
          fundName: "Vanguard Bluechip Direct Growth",
          units: 5000000, // 50 units (stored as integers)
          navAtBuyPaise: 2410500, // ₹2,410.50
          investedAmountPaise: 1205000000, // ₹12,05,000
          type: "LUMPSUM"
        },
        {
          userId: user.id,
          fundName: "Mirae Asset Emerging Bluechip Fund",
          units: 3000000, // 30 units
          navAtBuyPaise: 3350000, // ₹3,350.00
          investedAmountPaise: 1005000000, // ₹10,05,000
          type: "LUMPSUM"
        },
        {
          userId: user.id,
          fundName: "HDFC Top 100 Fund Direct Growth",
          units: 2500000, // 25 units
          navAtBuyPaise: 1695000, // ₹1,695.00
          investedAmountPaise: 423750000, // ₹4,23,750
          type: "SIP"
        }
      ],
      skipDuplicates: true
    });
    console.log("✅ Created mutual fund holdings\n");

    // Summary
    console.log("📊 Seeding Complete!\n");
    console.log("Test User Details:");
    console.log("  Email:    dashboard-test@finledger.com");
    console.log("  Password: TestPassword123!");
    console.log("\nAccounts Created:");
    console.log("  • HDFC Bank (₹50,00,000)");
    console.log("  • Wallet (₹2,500)");
    console.log("  • Demat Account (₹30,00,000)");
    console.log("\nTransactions Created:");
    console.log("  • 6 monthly salary deposits (₹30,00,000 each)");
    console.log("  • 3 freelance payments (₹5,00,000 each)");
    console.log("  • 100+ expense transactions across categories");
    console.log("\nMutual Funds Created:");
    console.log("  • Vanguard Bluechip Direct Growth (₹12,05,000)");
    console.log("  • Mirae Asset Emerging Bluechip Fund (₹10,05,000)");
    console.log("  • HDFC Top 100 Fund Direct Growth (₹4,23,750)");
    console.log("\n🚀 Login to dashboard and view live data!");
    console.log("   URL: http://localhost:3000/login\n");

  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDashboardData()
  .then(() => {
    console.log("✨ Dashboard seeding finished successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
