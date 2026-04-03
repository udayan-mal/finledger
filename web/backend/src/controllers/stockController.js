import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { ok } from "../utils/response.js";
import { buildStockTradePayload } from "../services/stockService.js";

const tradeSchema = z.object({
  symbol: z.string().min(1),
  qty: z.coerce.number().int().positive(),
  pricePaise: z.coerce.number().int().positive(),
  brokeragePaise: z.coerce.number().int().min(0).default(0),
  tradeType: z.enum(["BUY", "SELL", "DIVIDEND"]),
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
