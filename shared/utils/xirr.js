import Decimal from "decimal.js";

const daysBetween = (startDate, endDate) =>
  new Decimal(new Date(endDate).getTime() - new Date(startDate).getTime()).div(1000 * 60 * 60 * 24).toNumber();

export const xirr = (cashflows, guess = 0.1) => {
  if (!cashflows?.length || cashflows.length < 2) {
    return 0;
  }

  let rate = new Decimal(guess);
  const maxIterations = 100;
  const precision = new Decimal("0.0000001");
  const minRate = new Decimal("-0.9999999");

  const baseDate = cashflows[0].date;

  for (let i = 0; i < maxIterations; i += 1) {
    let npv = new Decimal(0);
    let derivative = new Decimal(0);

    for (const flow of cashflows) {
      const t = new Decimal(daysBetween(baseDate, flow.date)).div(365);
      const amount = new Decimal(flow.amount);
      const denominator = Decimal.pow(new Decimal(1).plus(rate), t);
      npv = npv.plus(amount.div(denominator));
      derivative = derivative.minus(t.mul(amount).div(Decimal.pow(new Decimal(1).plus(rate), t.plus(1))));
    }

    if (derivative.abs().lt(precision)) {
      break;
    }

    const nextRate = rate.minus(npv.div(derivative));
    if (nextRate.minus(rate).abs().lt(precision)) {
      return nextRate.mul(100).toDecimalPlaces(4).toNumber();
    }

    rate = Decimal.max(nextRate, minRate);
  }

  return rate.mul(100).toDecimalPlaces(4).toNumber();
};
