import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifyDepositSource,
  isCompendiumDropData,
  isInventoryDropData,
  resolveCompendiumPackId,
  resolveCompendiumPackTitle,
} from "../src/party/stash-deposit-source.js";

const MOCK_PACKS = [
  { collection: "Compendium.dnd4e.items", title: "D&D 4e Items" },
  { collection: "Compendium.dnd4e.powers", title: "D&D 4e Powers" },
];

describe("isCompendiumDropData", () => {
  it("detects pack field", () => {
    assert.equal(isCompendiumDropData({ pack: "dnd4e.items" }), true);
  });

  it("detects Compendium UUID", () => {
    assert.equal(
      isCompendiumDropData({ uuid: "Compendium.dnd4e.items.fireball" }),
      true
    );
  });
});

describe("isInventoryDropData", () => {
  it("detects embedded actor item UUID", () => {
    assert.equal(
      isInventoryDropData({ uuid: "Actor.abc123.Item.def456" }),
      true
    );
  });

  it("rejects compendium UUID", () => {
    assert.equal(
      isInventoryDropData({ uuid: "Compendium.dnd4e.items.fireball" }),
      false
    );
  });
});

describe("resolveCompendiumPackId", () => {
  it("uses pack field when present", () => {
    assert.equal(resolveCompendiumPackId({ pack: "dnd4e.items" }), "dnd4e.items");
  });

  it("parses pack id from Compendium UUID", () => {
    assert.equal(
      resolveCompendiumPackId({ uuid: "Compendium.dnd4e.items.fireball" }),
      "Compendium.dnd4e.items"
    );
  });
});

describe("resolveCompendiumPackTitle", () => {
  it("resolves title from full Compendium collection id", () => {
    assert.equal(
      resolveCompendiumPackTitle("Compendium.dnd4e.items", MOCK_PACKS),
      "D&D 4e Items"
    );
  });

  it("resolves title from short pack id in drag data", () => {
    assert.equal(resolveCompendiumPackTitle("dnd4e.items", MOCK_PACKS), "D&D 4e Items");
  });

  it("returns null when pack is unknown", () => {
    assert.equal(resolveCompendiumPackTitle("unknown.pack", MOCK_PACKS), null);
  });
});

describe("classifyDepositSource", () => {
  it("classifies actor inventory drop", () => {
    assert.equal(
      classifyDepositSource(
        { uuid: "Actor.pc1.Item.item1" },
        { uuid: "Actor.pc1.Item.item1", actor: { id: "pc1" } }
      ),
      "inventory"
    );
  });

  it("classifies compendium drop by UUID", () => {
    assert.equal(
      classifyDepositSource(
        { uuid: "Compendium.dnd4e.items.fireball" },
        { uuid: "Compendium.dnd4e.items.fireball", actor: null }
      ),
      "compendium"
    );
  });

  it("classifies compendium drop by pack field", () => {
    assert.equal(
      classifyDepositSource(
        { pack: "dnd4e.items", type: "Item" },
        { uuid: "Compendium.dnd4e.items.fireball", actor: null }
      ),
      "compendium"
    );
  });

  it("classifies world items directory drop", () => {
    assert.equal(
      classifyDepositSource(
        { type: "Item", uuid: "Item.world123" },
        { uuid: "Item.world123", actor: null }
      ),
      "itemsDirectory"
    );
  });
});
