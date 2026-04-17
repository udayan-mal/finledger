import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { ok } from "../utils/response.js";
import { buildStockTradePayload } from "../services/stockService.js";

const tradeSchema = z.object({
  symbol: z.string().min(1),
  platform: z.enum(["Zerodha", "Groww", "Dhan"]).default("Zerodha"),
  totalChargesPaise: z.coerce.number().int().min(0).default(0),
  netPnlPaise: z.coerce.number().int().default(0),
  tradeType: z.enum(["BUY", "SELL", "DIVIDEND"]),
  syncTxId: z.string().uuid().optional(),
  date: z.string().datetime()
});

export const listStockTrades = async (req, res, next) => {
  try {
    const trades = await prisma.stockTrade.findMany({
      where: { userId: req.user.sub },
      orderBy: { date: "desc" }
    });

    const syncTxIds = trades
      .map((trade) => trade.syncTxId)
      .filter((syncTxId) => Boolean(syncTxId));

    const linkedTransactions = syncTxIds.length
      ? await prisma.transaction.findMany({
          where: {
            userId: req.user.sub,
            id: { in: syncTxIds }
          },
          select: {
            id: true,
            type: true
          }
        })
      : [];

    const txTypeById = new Map(linkedTransactions.map((tx) => [tx.id, tx.type]));

    const normalizedTrades = trades.map((trade) => {
      const linkedTxType = trade.syncTxId ? txTypeById.get(trade.syncTxId) : null;
      const shouldBeLoss = trade.tradeType === "SELL" && linkedTxType === "EXPENSE";

      if (shouldBeLoss && trade.netPnlPaise > 0) {
        return {
          ...trade,
          netPnlPaise: -Math.abs(trade.netPnlPaise)
        };
      }

      return trade;
    });

    return ok(res, normalizedTrades);
  } catch (error) {
    return next(error);
  }
};

export const createStockTrade = async (req, res, next) => {
  try {
    const body = tradeSchema.parse(req.body);
    const payload = buildStockTradePayload({ ...body, userId: req.user.sub });
    const trade = await prisma.stockTrade.create({ data: payload });
    return ok(res, trade, 201);
  } catch (error) {
    return next(error);
  }
};

export const updateStockTrade = async (req, res, next) => {
  try {
    const body = tradeSchema.parse(req.body);
    const payload = buildStockTradePayload({ ...body, userId: req.user.sub });
    const trade = await prisma.$transaction(async (tx) => {
      const updatedTrade = await tx.stockTrade.update({
        where: { id: req.params.id, userId: req.user.sub },
        data: payload
      });

      if (updatedTrade.syncTxId) {
        const isSell = updatedTrade.tradeType === "SELL";
        const isLoss = updatedTrade.netPnlPaise < 0;

        const transactionType = isSell ? (isLoss ? "EXPENSE" : "INCOME") : "INVESTMENT";
        const categoryName = isSell ? (isLoss ? "Realized Loss" : "Realized Gain") : "Stock Trade";
        const amountPaise = isSell
          ? Math.abs(updatedTrade.netPnlPaise || 0)
          : (updatedTrade.totalChargesPaise || 0);

        let category = await tx.category.findFirst({
          where: {
            userId: req.user.sub,
            name: categoryName,
            type: transactionType
          }
        });

        if (!category) {
          category = await tx.category.create({
            data: {
              userId: req.user.sub,
              name: categoryName,
              type: transactionType
            }
          });
        }

        const stockNote = `Symbol: ${updatedTrade.symbol} | Platform: ${updatedTrade.platform} | ${isSell ? (isLoss ? "Loss Net P&L" : "Profit Net P&L") : "Charges Paid"}`;

        await tx.transaction.updateMany({
          where: { id: updatedTrade.syncTxId, userId: req.user.sub },
          data: {
            type: transactionType,
            categoryId: category.id,
            amountPaise,
            description: updatedTrade.symbol,
            note: stockNote,
            date: updatedTrade.date
          }
        });
      }

      return updatedTrade;
    });

    return ok(res, trade);
  } catch (error) {
    return next(error);
  }
};

export const deleteStockTrade = async (req, res, next) => {
  try {
    const trade = await prisma.stockTrade.findUnique({
      where: { id: req.params.id, userId: req.user.sub }
    });
    
    if (!trade) throw new Error("Stock trade not found");

    if (trade.syncTxId) {
      await prisma.transaction.deleteMany({
        where: { id: trade.syncTxId, userId: req.user.sub }
      });
    }

    await prisma.stockTrade.delete({
      where: { id: req.params.id, userId: req.user.sub }
    });
    
    return ok(res, { deleted: true });
  } catch (error) {
    return next(error);
  }
};
