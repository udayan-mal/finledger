export const buildStockTradePayload = ({ symbol, tradeType, platform, totalChargesPaise = 0, netPnlPaise = 0, syncTxId, date, userId }) => {
  return {
    userId,
    symbol: symbol.toUpperCase(),
    tradeType,
    platform,
    totalChargesPaise: Number(totalChargesPaise),
    netPnlPaise: Number(netPnlPaise),
    syncTxId,
    date: new Date(date)
  };
};
