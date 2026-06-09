import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  activateActorSheetTab,
  clearActorSheetTab,
  DND4E_ACTOR_INVENTORY_TAB,
  isActorSheetTabActive,
  openActorInventorySheet,
  openActorSheet,
  resolveInventoryTabGroup,
} from "../src/party/open-actor-sheet.js";

type MockSheet = {
  rendered: boolean;
  document?: { id: string };
  element?: { querySelector: (selector: string) => { classList: { contains: (name: string) => boolean } } | null };
  render: (options?: boolean | { force?: boolean; tab?: Record<string, string> }) => Promise<void>;
  bringToFront?: () => void;
  changeTab?: (tab: string, group: string, options?: { force?: boolean }) => void;
  tabGroups?: Record<string, string>;
};

function installMockActor(actorId: string, sheet: MockSheet): void {
  (globalThis as { game: { actors: { get: (id: string) => { sheet: MockSheet } | undefined } } }).game =
    {
      actors: {
        get: (id: string) => (id === actorId ? { sheet } : undefined),
      },
    };
}

describe("openActorSheet", () => {
  it("opens unrendered sheet on inventory tab via render option and pending tab", async () => {
    const calls: unknown[] = [];
    const sheet: MockSheet = {
      rendered: false,
      document: { id: "actor-1" },
      tabGroups: { sheet: "powers" },
      render: async (options) => {
        calls.push(["render", options]);
      },
      changeTab: (tab, group, options) => {
        calls.push(["changeTab", tab, group, options]);
      },
    };
    installMockActor("actor-1", sheet);

    await openActorSheet("actor-1", DND4E_ACTOR_INVENTORY_TAB);
    await new Promise((resolve) => setTimeout(resolve, 10));

    assert.equal(sheet.tabGroups?.sheet, "inventory");
    assert.deepEqual(calls[0], [
      "render",
      { force: true, tab: { sheet: "inventory" } },
    ]);
    assert.ok(calls.some((call) => Array.isArray(call) && call[0] === "changeTab"));
    clearActorSheetTab("actor-1");
  });

  it("switches tab on already rendered sheet without re-render", async () => {
    const calls: unknown[] = [];
    const activePanel = {
      classList: {
        contains: (name: string) => name === "active",
      },
    };
    const sheet: MockSheet = {
      rendered: true,
      document: { id: "actor-2" },
      tabGroups: { sheet: "powers" },
      element: {
        querySelector: (selector: string) =>
          selector.includes('data-tab="inventory"') ? activePanel : null,
      },
      render: async (options) => {
        calls.push(["render", options]);
      },
      bringToFront: () => {
        calls.push(["bringToFront"]);
      },
      changeTab: (tab, group, options) => {
        calls.push(["changeTab", tab, group, options]);
        sheet.tabGroups = { sheet: tab };
      },
    };
    installMockActor("actor-2", sheet);

    await openActorInventorySheet("actor-2");
    await new Promise((resolve) => setTimeout(resolve, 10));

    assert.deepEqual(calls, [["bringToFront"], ["changeTab", "inventory", "sheet", { force: true }]]);
    assert.equal(isActorSheetTabActive(sheet, "inventory", "sheet"), true);
    clearActorSheetTab("actor-2");
  });

  it("activates inventory tab via changeTab", () => {
    const calls: unknown[] = [];
    const sheet: MockSheet = {
      rendered: true,
      tabGroups: { sheet: "powers" },
      render: async () => {},
      changeTab: (tab, group, options) => {
        calls.push(["changeTab", tab, group, options]);
        sheet.tabGroups = { sheet: tab };
      },
    };

    activateActorSheetTab(sheet, "inventory", "sheet");

    assert.deepEqual(calls, [["changeTab", "inventory", "sheet", { force: true }]]);
    assert.equal(sheet.tabGroups?.sheet, "inventory");
  });

  it("resolves fox4e inventory tab group as primary", () => {
    const sheet = {
      constructor: {
        name: "Fox4eSheet",
        TABS: {
          primary: { tabs: [{ id: "inventory" }, { id: "powers" }] },
        },
      },
    };
    assert.equal(resolveInventoryTabGroup(sheet as never), "primary");
  });

  it("falls back to sheet group for base dnd4e actor sheet", () => {
    const sheet = {
      constructor: {
        name: "ActorSheet4e",
        TABS: {
          sheet: { tabs: [{ id: "inventory" }, { id: "powers" }] },
        },
      },
    };
    assert.equal(resolveInventoryTabGroup(sheet as never), "sheet");
  });

  it("ignores missing actor", async () => {
    installMockActor("actor-4", { rendered: false, render: async () => {} });
    await assert.doesNotReject(openActorSheet("missing"));
  });
});
