import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { ok } from "../utils/response.js";

const budgetSchema = z.object({
  categoryId: z.string().uuid(),
  period: z.string().min(3),
  amountPaise: z.coerce.number().int().positive(),
  rollover: z.boolean().default(false),
  startDate: z.string().datetime()
});

export const listBudgets = async (req, res, next) => {
  try {
    const budgets = await prisma.budget.findMany({ where: { userId: req.user.sub }, include: { category: true } });
    return ok(res, budgets);
  } catch (error) {
    return next(error);
  }
};

export const createBudget = async (req, res, next) => {
  try {
    const body = budgetSchema.parse(req.body);
    const budget = await prisma.budget.create({ data: { ...body, userId: req.user.sub, startDate: new Date(body.startDate) } });
    return ok(res, budget, 201);
  } catch (error) {
    return next(error);
  }
};
