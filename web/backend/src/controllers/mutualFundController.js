import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { ok } from "../utils/response.js";

const mfSchema = z.object({
  fundName: z.string().min(2),
  folio: z.string().optional(),
  sipAmountPaise: z.coerce.number().int().positive(),
  type: z.enum(["SIP", "LUMPSUM"]),
  platform: z.enum(["Zerodha", "Groww", "Dhan"]).default("Zerodha"),
  syncTxId: z.string().uuid().optional(),
  date: z.string().datetime()
});

export const listMutualFunds = async (req, res, next) => {
  try {
    const funds = await prisma.mutualFund.findMany({ where: { userId: req.user.sub }, orderBy: { date: "desc" } });
    return ok(res, funds);
  } catch (error) {
    return next(error);
  }
};

export const createMutualFund = async (req, res, next) => {
  try {
    const body = mfSchema.parse(req.body);
    const fund = await prisma.mutualFund.create({
      data: {
        ...body,
        userId: req.user.sub,
        date: new Date(body.date)
      }
    });
    return ok(res, fund, 201);
  } catch (error) {
    return next(error);
  }
};

export const updateMutualFund = async (req, res, next) => {
  try {
    const body = mfSchema.parse(req.body);
    const fund = await prisma.mutualFund.update({
      where: { id: req.params.id, userId: req.user.sub },
      data: {
        ...body,
        date: new Date(body.date)
      }
    });
    return ok(res, fund);
  } catch (error) {
    return next(error);
  }
};

export const deleteMutualFund = async (req, res, next) => {
  try {
    const fund = await prisma.mutualFund.findUnique({
      where: { id: req.params.id, userId: req.user.sub }
    });
    
    if (!fund) throw new Error("Mutual fund not found");

    if (fund.syncTxId) {
      await prisma.transaction.deleteMany({
        where: { id: fund.syncTxId, userId: req.user.sub }
      });
    }

    await prisma.mutualFund.delete({
      where: { id: req.params.id, userId: req.user.sub }
    });
    
    return ok(res, { deleted: true });
  } catch (error) {
    return next(error);
  }
};
