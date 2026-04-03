import { describe, expect, it } from "vitest";
import { calculateIndiaEquityCharges, xirr } from "@finledger/shared";

describe("financial calculations", () => {
  it("calculates stock charges in paise", () => {
    const result = calculateIndiaEquityCharges({ turnoverPaise: 10000000, brokeragePaise: 2000, side: "BUY" });
    expect(result.totalChargesPaise).toBeGreaterThan(0);
    expect(result.stampDuty).toBeGreaterThan(0);
  });

  it("computes xirr with newton raphson", () => {
    const result = xirr([
      { amount: -50000, date: "2024-01-01" },
      { amount: -50000, date: "2024-07-01" },
      { amount: 120000, date: "2025-01-01" }
    ]);
    expect(result).toBeGreaterThan(0);
  });
});
