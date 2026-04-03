import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { ok } from "../utils/response.js";

const rangeSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
  type: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]).default("custom")
});

export const getRangeReport = async (req, res, next) => {
  try {
    const query = rangeSchema.parse(req.query);
    const [expenses, income] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId: req.user.sub,
          type: "EXPENSE",
          date: { gte: new Date(query.start), lte: new Date(query.end) }
        },
        _sum: { amountPaise: true }
      }),
      prisma.transaction.aggregate({
        where: {
          userId: req.user.sub,
          type: "INCOME",
          date: { gte: new Date(query.start), lte: new Date(query.end) }
        },
        _sum: { amountPaise: true }
      })
    ]);

    return ok(res, {
      range: query,
      totals: {
        expensePaise: expenses._sum.amountPaise || 0,
        incomePaise: income._sum.amountPaise || 0
      }
    });
  } catch (error) {
    return next(error);
  }
};
