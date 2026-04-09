import { prisma } from "../config/prisma.js";
import { ok, fail } from "../utils/response.js";
import { parse } from "csv-parse/sync";

export const listTransactions = async (req, res, next) => {
  try {
    const items = await prisma.transaction.findMany({
      where: { userId: req.user.sub },
      include: { account: true, category: true, splits: true },
      orderBy: { date: "desc" },
      take: 100
    });
    return ok(res, items);
  } catch (error) {
    return next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const item = await prisma.transaction.create({
      data: {
        ...req.body,
        userId: req.user.sub,
        date: new Date(req.body.date),
        splits: req.body.splits?.length
          ? {
              create: req.body.splits.map((split) => ({ categoryId: split.categoryId, amountPaise: split.amountPaise }))
            }
          : undefined
      },
      include: { splits: true }
    });
    return ok(res, item, 201);
  } catch (error) {
    return next(error);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const item = await prisma.transaction.update({
      where: { id: req.params.id, userId: req.user.sub },
      data: { ...req.body, date: req.body.date ? new Date(req.body.date) : undefined }
    });
    return ok(res, item);
  } catch (error) {
    return next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    await prisma.transaction.delete({ where: { id: req.params.id, userId: req.user.sub } });
    return ok(res, { deleted: true });
  } catch (error) {
    return next(error);
  }
};

export const uploadTransactionsCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return fail(res, "No CSV file provided", 400);
    }

    // 1. Ensure user has a default account to attach uploaded transactions to
    let account = await prisma.account.findFirst({ where: { userId: req.user.sub } });
    if (!account) {
      account = await prisma.account.create({
        data: { userId: req.user.sub, name: "Primary Vault", type: "BANK" }
      });
    }

    // 2. Parse CSV
    const fileContent = req.file.buffer.toString('utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true
    });

    const transactionsToInsert = records.map((record) => {
      // Very loose heuristic parsing to support generic bank formats
      const rawDate = record.Date || record.date || record.DATE;
      const rawDesc = record.Description || record.description || record.Narration || record.Details || "Bank Sync Entry";
      const rawType = record.Type || record.type || "EXPENSE";
      const rawAmount = record.Amount || record.amount || record.Withdrawal || record.Deposit || "0";

      const type = rawType.toUpperCase().includes("INC") || rawType.toUpperCase().includes("DEP") ? "INCOME" : "EXPENSE";
      const amountPaise = Math.abs(Math.round(parseFloat(rawAmount.replace(/,/g, '')) * 100)) || 0;
      
      const parsedDate = new Date(rawDate);
      const safeDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

      return {
        userId: req.user.sub,
        accountId: account.id,
        type,
        amountPaise,
        description: rawDesc,
        date: safeDate
      };
    });

    if (transactionsToInsert.length === 0) {
      return fail(res, "No valid records found in CSV. Make sure headers contain Date, Description, Type, Amount.", 400);
    }

    // 3. Batch Insert
    const result = await prisma.transaction.createMany({
      data: transactionsToInsert
    });

    return ok(res, { message: `Successfully imported ${result.count} transactions.`, count: result.count });
  } catch (error) {
    console.error("CSV Upload Error:", error);
    return fail(res, "Failed to parse CSV format. Please use standard Date, Description, Type, Amount columns.", 500);
  }
};
