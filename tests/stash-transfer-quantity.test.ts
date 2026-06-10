import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getItemStackQuantity,
  parseTransferQuantity,
  shouldPromptTransferQuantity,
} from "../src/party/stash-transfer-quantity.js";

describe("getItemStackQuantity", () => {
  it("treats missing or zero as 1", () => {
    assert.equal(getItemStackQuantity(undefined), 1);
    assert.equal(getItemStackQuantity(0), 1);
    assert.equal(getItemStackQuantity(""), 1);
  });

  it("floors positive quantities", () => {
    assert.equal(getItemStackQuantity(5), 5);
    assert.equal(getItemStackQuantity(3.9), 3);
  });
});

describe("shouldPromptTransferQuantity", () => {
  it("prompts only above 1", () => {
    assert.equal(shouldPromptTransferQuantity(1), false);
    assert.equal(shouldPromptTransferQuantity(2), true);
  });
});

describe("parseTransferQuantity", () => {
  it("accepts valid integers in range", () => {
    assert.equal(parseTransferQuantity(3, 10), 3);
    assert.equal(parseTransferQuantity("7", 7), 7);
  });

  it("rejects out of range or non-integers", () => {
    assert.equal(parseTransferQuantity(0, 5), null);
    assert.equal(parseTransferQuantity(6, 5), null);
    assert.equal(parseTransferQuantity(2.5, 5), null);
    assert.equal(parseTransferQuantity("x", 5), null);
  });
});
