import { prisma } from "../config/prisma.js";
import { ok } from "../utils/response.js";

export const listCategories = async (req, res, next) => {
  try {
    const items = await prisma.category.findMany({
      where: { userId: req.user.sub },
      orderBy: { name: "asc" }
    });
    return ok(res, items);
  } catch (error) {
    return next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, type, icon, color } = req.body;
    
    // Check if category already exists for user
    const existing = await prisma.category.findFirst({
      where: { userId: req.user.sub, name, type }
    });
    
    if (existing) {
      return ok(res, existing);
    }
    
    const item = await prisma.category.create({
      data: {
        userId: req.user.sub,
        name,
        type,
        icon,
        color
      }
    });
    return ok(res, item, 201);
  } catch (error) {
    return next(error);
  }
};
