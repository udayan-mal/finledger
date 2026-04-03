import Decimal from "decimal.js";

const RATE = {
  sttBuy: 0.1,
  sttSell: 0.1,
  exchange: 0.00335,
  sebiPerCrore: 10,
  stampDutyBuy: 0.015,
  gstOnBrokerage: 18
};

const percent = (amountPaise, ratePercent) =>
  new Decimal(amountPaise).mul(ratePercent).div(100).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();

export const calculateIndiaEquityCharges = ({ turnoverPaise, brokeragePaise = 0, side }) => {
  const stt = side === "BUY" ? percent(turnoverPaise, RATE.sttBuy) : percent(turnoverPaise, RATE.sttSell);
  const exchange = percent(turnoverPaise, RATE.exchange);
  const sebi = new Decimal(turnoverPaise)
    .div(100)
    .div(10000000)
    .mul(RATE.sebiPerCrore)
    .mul(100)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .toNumber();
  const stampDuty = side === "BUY" ? percent(turnoverPaise, RATE.stampDutyBuy) : 0;
  const gst = percent(brokeragePaise, RATE.gstOnBrokerage);
  const total = stt + exchange + sebi + stampDuty + gst + Number(brokeragePaise || 0);

  return { stt, exchange, sebi, stampDuty, gst, brokeragePaise, totalChargesPaise: total };
};

export const calculateTradePnL = ({ buyValuePaise, sellValuePaise, buyChargesPaise, sellChargesPaise }) =>
  new Decimal(sellValuePaise)
    .minus(buyValuePaise)
    .minus(buyChargesPaise)
    .minus(sellChargesPaise)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .toNumber();
