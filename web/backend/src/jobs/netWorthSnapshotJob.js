import { prisma } from "../config/prisma.js";

export const createNetWorthSnapshot = async (userId) => {
  const [accountAgg, stockAgg, mfAgg] = await Promise.all([
    prisma.account.aggregate({ where: { userId }, _sum: { balancePaise: true } }),
    prisma.stockTrade.aggregate({ where: { userId }, _sum: { pricePaise: true } }),
    prisma.mutualFund.aggregate({ where: { userId }, _sum: { navAtBuyPaise: true } })
  ]);

  const assets = (accountAgg._sum.balancePaise || 0) + (stockAgg._sum.pricePaise || 0) + (mfAgg._sum.navAtBuyPaise || 0);

  return prisma.netWorthSnapshot.create({
    data: {
      userId,
      totalAssetsPaise: assets,
      totalLiabilitiesPaise: 0,
      date: new Date()
    }
  });
};
