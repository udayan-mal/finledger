import { prisma } from "../config/prisma.js";
import { ok } from "../utils/response.js";

export const listTransactions = async (req, res, next) => {
  try {
    const items = await prisma.transaction.findMany({
      where: { userId: req.user.sub },
      include: { account: true, category: true, splits: true },
      orderBy: { date: "desc" },
      take: 100
    });
    return ok(res, items);
  } catch (error) {
    return next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const item = await prisma.transaction.create({
      data: {
        ...req.body,
        userId: req.user.sub,
        date: new Date(req.body.date),
        splits: req.body.splits?.length
          ? {
              create: req.body.splits.map((split) => ({ categoryId: split.categoryId, amountPaise: split.amountPaise }))
            }
          : undefined
      },
      include: { splits: true }
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
    await prisma.transaction.delete({ where: { id: req.params.id, userId: req.user.sub } });
    return ok(res, { deleted: true });
  } catch (error) {
    return next(error);
  }
};
