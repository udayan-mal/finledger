import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { ok } from "../utils/response.js";

const recurringSchema = z.object({
  name: z.string().min(2),
  amountPaise: z.coerce.number().int().positive(),
  frequency: z.string().min(2),
  nextDue: z.string().datetime(),
  active: z.boolean().default(true)
});

export const listRecurring = async (req, res, next) => {
  try {
    const items = await prisma.recurringExpense.findMany({
      where: { userId: req.user.sub },
      orderBy: { nextDue: "asc" }
    });
    return ok(res, items);
  } catch (error) {
    return next(error);
  }
};

export const createRecurring = async (req, res, next) => {
  try {
    const body = recurringSchema.parse(req.body);
    const item = await prisma.recurringExpense.create({
      data: { ...body, userId: req.user.sub, nextDue: new Date(body.nextDue) }
    });
    return ok(res, item, 201);
  } catch (error) {
    return next(error);
  }
};
