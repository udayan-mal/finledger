import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { ok } from "../utils/response.js";

const mfSchema = z.object({
  fundName: z.string().min(2),
  folio: z.string().optional(),
  units: z.coerce.number().positive(),
  navAtBuyPaise: z.coerce.number().int().positive(),
  sipAmountPaise: z.coerce.number().int().positive().optional(),
  sipDate: z.coerce.number().int().min(1).max(31).optional(),
  type: z.enum(["SIP", "LUMPSUM"]),
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
