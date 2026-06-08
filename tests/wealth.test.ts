import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Inline copy for node tests without Foundry CONFIG
function currencyToGp(
  currency: Record<string, number>,
  conversion: Record<string, { gp: number }>
): number {
  let goldSum = 0;
  for (const [type, value] of Object.entries(currency ?? {})) {
    goldSum += (Number(value) || 0) * (conversion[type]?.gp ?? 0);
  }
  return Math.round(goldSum * 100) / 100;
}

const conversion = {
  cp: { gp: 0.01 },
  sp: { gp: 0.1 },
  gp: { gp: 1 },
  pp: { gp: 10 },
  ad: { gp: 100 },
};

describe("currencyToGp", () => {
  it("sums denominations", () => {
    assert.equal(currencyToGp({ gp: 5, sp: 10, cp: 50 }, conversion), 6.5);
  });

  it("handles empty", () => {
    assert.equal(currencyToGp({}, conversion), 0);
  });
});
