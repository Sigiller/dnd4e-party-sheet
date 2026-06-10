import { MODULE_ID } from "./constants.js";
import { registerSettings } from "./settings.js";
import { registerPartyFolderHooks, openPartySheetFromApi } from "./folder/party-folder.js";
import { schedulePartySheetRefresh } from "./app/PartySheetApp.js";
import { isPartyMember } from "./party/party-members.js";
import { getPartyFolder, ensureStashActor, syncPartyStashOwnership } from "./party/party-store.js";
import { isStashActor, registerStashActorHooks, relocateAllStashActors } from "./party/stash-actor.js";
import { registerStashActorSheetDropHook } from "./party/stash-sheet-drop-hook.js";
import { registerActorSheetTabHook } from "./party/open-actor-sheet.js";
import { registerActorInventoryRowClickHook } from "./party/actor-inventory-row-click.js";

Hooks.once("init", () => {
  registerSettings();
  registerPartyFolderHooks();
  registerStashActorHooks();
  registerActorSheetTabHook();
  registerActorInventoryRowClickHook();
});

Hooks.once("ready", async () => {
  if (game.system?.id !== "dnd4e") {
    console.warn(
      `${MODULE_ID} | active only for the dnd4e system (current: ${game.system?.id ?? "none"})`
    );
    return;
  }
  const mod = game.modules?.get(MODULE_ID);
  if (mod) {
    mod.api = {
      openPartySheet: openPartySheetFromApi,
      getPartyFolder,
    };
  }
  if (game.user?.isGM) {
    await relocateAllStashActors();
    const folder = getPartyFolder();
    if (folder) await ensureStashActor(folder);
  }
  await registerStashActorSheetDropHook();
  console.log(`${MODULE_ID} | ready`);
});

function scheduleStashOwnershipSync(): void {
  if (!game.user?.isGM) return;
  void syncPartyStashOwnership();
}

Hooks.on("userConnected", () => {
  scheduleStashOwnershipSync();
});

Hooks.on("updateUser", (_user: User.Implementation, changes: object) => {
  if (!game.user?.isGM) return;
  if ("active" in changes || "role" in changes) {
    scheduleStashOwnershipSync();
  }
});

function shouldRefreshPartySheet(doc: Actor.Implementation | Item.Implementation): boolean {
  if (doc.documentName === "Actor") {
    return isPartyMember(doc) || isStashActor(doc);
  }
  if (doc.documentName === "Item") {
    const actor = doc.actor ?? undefined;
    return !!actor && (isPartyMember(actor) || isStashActor(actor));
  }
  return false;
}

Hooks.on("updateActor", (doc: Actor.Implementation) => {
  if (shouldRefreshPartySheet(doc)) schedulePartySheetRefresh();
});

Hooks.on("updateItem", (doc: Item.Implementation) => {
  if (shouldRefreshPartySheet(doc)) schedulePartySheetRefresh();
});

Hooks.on("deleteItem", (doc: Item.Implementation) => {
  if (shouldRefreshPartySheet(doc)) schedulePartySheetRefresh();
});
