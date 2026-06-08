import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyAdd,
  applySubtractByGpSum,
  applySubtractExact,
  normalizeCurrencyRecord,
} from "../src/party/stash-currency.ts";

const conversion: Record<string, { gp: number }> = {
  cp: { gp: 0.01 },
  sp: { gp: 0.1 },
  gp: { gp: 1 },
  pp: { gp: 100 },
  ad: { gp: 10000 },
};

const getRate = (key: string) => conversion[key]?.gp ?? 0;

describe("applySubtractExact", () => {
  it("subtracts coin and residuum counts", () => {
    const result = applySubtractExact(
      { gp: 10, cp: 5 },
      { rs: 3 },
      { gp: 4, rs: 1 }
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.currency.gp, 6);
    assert.equal(result.currency.cp, 5);
    assert.equal(result.ritualcomp.rs, 2);
  });

  it("fails when insufficient", () => {
    const result = applySubtractExact({ gp: 2 }, { rs: 0 }, { gp: 5 });
    assert.equal(result.ok, false);
  });
});

describe("applySubtractByGpSum", () => {
  it("takes from cheapest coins first", () => {
    const result = applySubtractByGpSum(
      { cp: 100, sp: 0, gp: 0, pp: 0, ad: 0 },
      0.25,
      getRate
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.currency.cp, 75);
  });

  it("spends cp before gp", () => {
    const result = applySubtractByGpSum(
      { cp: 5, sp: 0, gp: 10, pp: 0, ad: 0 },
      1.04,
      getRate
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.currency.cp, 0);
    assert.equal(result.currency.gp, 9);
  });

  it("uses one gp coin when cp cannot cover remainder", () => {
    const result = applySubtractByGpSum(
      { cp: 0, sp: 0, gp: 3, pp: 0, ad: 0 },
      2,
      getRate
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.currency.gp, 1);
  });

  it("fails when total liquidity is insufficient", () => {
    const result = applySubtractByGpSum({ gp: 1 }, 500, getRate);
    assert.equal(result.ok, false);
  });
});

describe("applyAdd", () => {
  it("adds to currency and ritualcomp", () => {
    const { currency, ritualcomp } = applyAdd({ gp: 1 }, { rs: 2 }, { gp: 3, rs: 1 });
    assert.equal(currency.gp, 4);
    assert.equal(ritualcomp.rs, 3);
  });
});

describe("normalizeCurrencyRecord", () => {
  it("fills missing keys with zero", () => {
    const norm = normalizeCurrencyRecord({ gp: 2 });
    assert.equal(norm.ad, 0);
    assert.equal(norm.gp, 2);
  });
});
