import Decimal from "decimal.js";

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

export const toPaise = (amount) => {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    throw new Error("Invalid amount");
  }
  return new Decimal(amount).mul(100).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();
};

export const fromPaise = (paise) => new Decimal(paise).div(100).toFixed(2);

export const addPaise = (...values) => values.reduce((sum, value) => sum + Number(value || 0), 0);

export const percentOfPaise = (valuePaise, percent) =>
  new Decimal(valuePaise).mul(percent).div(100).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();

export const safeDivide = (value, divisor) => {
  if (!divisor) {
    return 0;
  }
  return new Decimal(value).div(divisor).toNumber();
};
