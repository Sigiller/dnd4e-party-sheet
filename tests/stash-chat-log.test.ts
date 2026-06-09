import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatCurrencySummary,
  formatItemLink,
} from "../src/party/stash-chat-log.js";

describe("formatCurrencySummary", () => {
  it("formats multiple currency types in display order", () => {
    const summary = formatCurrencySummary(
      { cp: 5, gp: 50, rs: 2 },
      (key) => key.toUpperCase()
    );
    assert.equal(summary, "5 CP, 50 GP, 2 RS");
  });

  it("skips zero and missing entries", () => {
    const summary = formatCurrencySummary({ sp: 3 }, (key) => key.toUpperCase());
    assert.equal(summary, "3 SP");
  });

  it("returns empty string for empty deltas", () => {
    assert.equal(formatCurrencySummary({}, (key) => key), "");
  });
});

describe("formatItemLink", () => {
  it("builds @UUID link for item with uuid", () => {
    assert.equal(
      formatItemLink({ uuid: "Actor.abc.Item.def", name: "Longsword" }),
      "@UUID[Actor.abc.Item.def]{Longsword}"
    );
  });

  it("appends quantity when greater than 1", () => {
    assert.equal(
      formatItemLink({ uuid: "Actor.abc.Item.def", name: "Arrows" }, 5),
      "@UUID[Actor.abc.Item.def]{Arrows} ×5"
    );
  });

  it("falls back to plain name without uuid", () => {
    assert.equal(formatItemLink({ name: "Torch" }), "Torch");
    assert.equal(formatItemLink({ name: "Torch" }, 3), "Torch ×3");
  });
});
