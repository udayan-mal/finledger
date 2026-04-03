import { prisma } from "../config/prisma.js";
import { ok } from "../utils/response.js";

export const getInsights = async (req, res, next) => {
  try {
    const items = await prisma.aiInsight.findMany({ where: { userId: req.user.sub }, orderBy: { generatedAt: "desc" }, take: 20 });
    return ok(res, items);
  } catch (error) {
    return next(error);
  }
};

export const chatAdvisor = async (req, res) => {
  const prompt = req.body?.prompt || "";
  return ok(res, {
    prompt,
    answer:
      "Advisor engine scaffolded. Connect Claude API in ai service and add finance-aware prompt templates for spending, budget, and investment insights."
  });
};
