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
    return ok(res, trades);
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
    const trade = await prisma.stockTrade.update({ 
      where: { id: req.params.id, userId: req.user.sub },
      data: payload 
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
