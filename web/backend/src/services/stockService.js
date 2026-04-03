import { calculateIndiaEquityCharges } from "@finledger/shared";

export const buildStockTradePayload = ({ symbol, qty, pricePaise, brokeragePaise = 0, tradeType, date, userId }) => {
  const turnoverPaise = Number(qty) * Number(pricePaise);
  const charges = calculateIndiaEquityCharges({ turnoverPaise, brokeragePaise, side: tradeType });

  return {
    userId,
    symbol: symbol.toUpperCase(),
    qty: Number(qty),
    pricePaise: Number(pricePaise),
    brokeragePaise: Number(brokeragePaise),
    sttPaise: charges.stt,
    exchangeFeePaise: charges.exchange,
    sebiChargePaise: charges.sebi,
    stampDutyPaise: charges.stampDuty,
    gstPaise: charges.gst,
    totalChargesPaise: charges.totalChargesPaise,
    tradeType,
    date: new Date(date)
  };
};
