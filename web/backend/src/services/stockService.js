export const buildStockTradePayload = ({ symbol, tradeType, platform, totalChargesPaise = 0, netPnlPaise = 0, date, userId }) => {
  return {
    userId,
    symbol: symbol.toUpperCase(),
    tradeType,
    platform,
    totalChargesPaise: Number(totalChargesPaise),
    netPnlPaise: Number(netPnlPaise),
    date: new Date(date)
  };
};
