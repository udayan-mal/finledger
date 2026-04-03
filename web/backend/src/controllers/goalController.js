import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { ok } from "../utils/response.js";

const goalSchema = z.object({
  name: z.string().min(2),
  targetAmountPaise: z.coerce.number().int().positive(),
  currentAmountPaise: z.coerce.number().int().min(0).default(0),
  targetDate: z.string().datetime()
});

export const listGoals = async (req, res, next) => {
  try {
    const goals = await prisma.goal.findMany({ where: { userId: req.user.sub }, orderBy: { targetDate: "asc" } });
    return ok(res, goals);
  } catch (error) {
    return next(error);
  }
};

export const createGoal = async (req, res, next) => {
  try {
    const body = goalSchema.parse(req.body);
    const goal = await prisma.goal.create({ data: { ...body, userId: req.user.sub, targetDate: new Date(body.targetDate) } });
    return ok(res, goal, 201);
  } catch (error) {
    return next(error);
  }
};
