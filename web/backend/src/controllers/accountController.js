import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { ok } from "../utils/response.js";

const accountSchema = z.object({
  type: z.enum(["BANK", "CASH", "WALLET", "INVESTMENT", "LIABILITY"]),
  name: z.string().min(2),
  balancePaise: z.coerce.number().int().default(0)
});

export const listAccounts = async (req, res, next) => {
  try {
    const accounts = await prisma.account.findMany({ where: { userId: req.user.sub }, orderBy: { createdAt: "desc" } });
    return ok(res, accounts);
  } catch (error) {
    return next(error);
  }
};

export const createAccount = async (req, res, next) => {
  try {
    const body = accountSchema.parse(req.body);
    const account = await prisma.account.create({ data: { ...body, userId: req.user.sub } });
    return ok(res, account, 201);
  } catch (error) {
    return next(error);
  }
};
