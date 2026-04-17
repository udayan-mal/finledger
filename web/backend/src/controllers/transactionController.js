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

    const transactionIds = items.map((item) => item.id);

    if (transactionIds.length === 0) {
      return ok(res, items);
    }

    const [linkedStockTrades, linkedMutualFunds] = await Promise.all([
      prisma.stockTrade.findMany({
        where: {
          userId: req.user.sub,
          syncTxId: { in: transactionIds }
        },
        select: {
          syncTxId: true,
          symbol: true,
          platform: true,
          tradeType: true,
          netPnlPaise: true,
          totalChargesPaise: true
        }
      }),
      prisma.mutualFund.findMany({
        where: {
          userId: req.user.sub,
          syncTxId: { in: transactionIds }
        },
        select: {
          syncTxId: true,
          fundName: true,
          platform: true,
          type: true,
          sipAmountPaise: true
        }
      })
    ]);

    const legacyStockTrades = await prisma.stockTrade.findMany({
      where: {
        userId: req.user.sub,
        tradeType: "SELL",
        OR: [
          { syncTxId: null },
          { syncTxId: { notIn: transactionIds } }
        ]
      },
      select: {
        id: true,
        syncTxId: true,
        symbol: true,
        platform: true,
        tradeType: true,
        netPnlPaise: true,
        totalChargesPaise: true,
        date: true
      }
    });

    const stockTradeByTxId = new Map(
      linkedStockTrades
        .filter((trade) => Boolean(trade.syncTxId))
        .map((trade) => [trade.syncTxId, trade])
    );

    const mutualFundByTxId = new Map(
      linkedMutualFunds
        .filter((fund) => Boolean(fund.syncTxId))
        .map((fund) => [fund.syncTxId, fund])
    );

    const toDateKey = (value) => new Date(value).toISOString().slice(0, 10);

    const legacyCandidatesByKey = new Map();
    legacyStockTrades.forEach((trade) => {
      const key = `${toDateKey(trade.date)}|${Math.abs(trade.netPnlPaise || 0)}|${(trade.platform || "").trim().toLowerCase()}`;
      const list = legacyCandidatesByKey.get(key) || [];
      list.push(trade);
      legacyCandidatesByKey.set(key, list);
    });

    const consumedLegacyTradeIds = new Set();

    const enrichedItems = items.map((item) => {
      let linkedStockTrade = stockTradeByTxId.get(item.id) || null;

      if (!linkedStockTrade) {
        const categoryName = (item.category?.name || "").toLowerCase();
        const note = (item.note || "").toLowerCase();
        const looksLikeStockPnl = categoryName.includes("realized") || note.includes("net p&l");

        if (looksLikeStockPnl && ["INCOME", "EXPENSE"].includes(item.type)) {
          const platformMatch = note.match(/platform:\s*([^|]+)/i);
          const platform = (platformMatch?.[1] || "").trim().toLowerCase();
          const key = `${toDateKey(item.date)}|${Math.abs(item.amountPaise || 0)}|${platform}`;
          const candidates = legacyCandidatesByKey.get(key) || [];
          const candidate = candidates.find((trade) => !consumedLegacyTradeIds.has(trade.id));

          if (candidate) {
            linkedStockTrade = candidate;
            consumedLegacyTradeIds.add(candidate.id);
          }
        }
      }

      return {
        ...item,
        linkedStockTrade,
        linkedMutualFund: mutualFundByTxId.get(item.id) || null
      };
    });

    return ok(res, enrichedItems);
  } catch (error) {
    return next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const { accountId, categoryId, type, amountPaise, date, description, note, receiptUrl, tags, splits } = req.body;

    const item = await prisma.transaction.create({
      data: {
        userId: req.user.sub,
        accountId,
        categoryId: categoryId || null,
        type: type || "EXPENSE",
        amountPaise,
        date: new Date(date),
        description: description || null,
        note: note || null,
        receiptUrl: receiptUrl || null,
        tags: typeof tags === "string" ? tags : JSON.stringify(tags || []),
        splits: splits?.length
          ? {
              create: splits.map((s) => ({ categoryId: s.categoryId, amountPaise: s.amountPaise }))
            }
          : undefined
      },
      include: { splits: true, category: true, account: true }
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
    await prisma.$transaction([
      prisma.stockTrade.deleteMany({
        where: { syncTxId: req.params.id, userId: req.user.sub }
      }),
      prisma.mutualFund.deleteMany({
        where: { syncTxId: req.params.id, userId: req.user.sub }
      }),
      prisma.transaction.delete({ where: { id: req.params.id, userId: req.user.sub } })
    ]);

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
