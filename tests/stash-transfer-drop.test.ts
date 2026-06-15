import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { MODULE_ID } from "../src/constants.js";
import { handleStashItemDropOnActor } from "../src/party/stash-transfer.js";
import { mockActor } from "./helpers/mock-actor.js";

function installGameFolders(partyFolderId: string): void {
  (globalThis as unknown as { game: Record<string, unknown> }).game = {
    folders: {
      find: (fn: (f: { type: string; name: string }) => boolean) => {
        const folders = [
          { id: partyFolderId, type: "Actor", name: "Party", flags: {} },
        ];
        return folders.find(fn);
      },
    },
    settings: {
      get: (_scope: string, key: string) => (key === "partyFolderName" ? "Party" : undefined),
    },
    actors: { contents: [] },
    users: { contents: [] },
  };
}

describe("handleStashItemDropOnActor", () => {
  beforeEach(() => {
    installGameFolders("party-folder");
  });

  afterEach(() => {
    delete (globalThis as { game?: unknown }).game;
  });

  it("returns false for non-party member so default dnd4e drop runs", async () => {
    const outsider = mockActor({
      id: "npc-1",
      type: "character",
      folder: "other-folder",
      flags: { [MODULE_ID]: {} },
    });

    const handled = await handleStashItemDropOnActor(outsider, { type: "Item", uuid: "Item.x" });
    assert.equal(handled, false);
  });

  it("returns false when target is not a player character", async () => {
    const npc = mockActor({
      id: "npc-2",
      type: "npc",
      folder: "party-folder",
    });

    const handled = await handleStashItemDropOnActor(npc, { type: "Item", uuid: "Item.y" });
    assert.equal(handled, false);
  });
});
