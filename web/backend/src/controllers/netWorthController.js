import { prisma } from "../config/prisma.js";
import { ok } from "../utils/response.js";

export const getNetWorthHistory = async (req, res, next) => {
  try {
    const snapshots = await prisma.netWorthSnapshot.findMany({
      where: { userId: req.user.sub },
      orderBy: { date: "asc" },
      take: 365
    });
    return ok(res, snapshots);
  } catch (error) {
    return next(error);
  }
};
