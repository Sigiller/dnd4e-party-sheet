import { MODULE_ID } from "./constants.js";
import { registerSettings } from "./settings.js";
import { registerPartyFolderHooks, openPartySheetFromApi } from "./folder/party-folder.js";
import { schedulePartySheetRefresh } from "./app/PartySheetApp.js";
import { isPartyMember } from "./party/party-members.js";
import { getPartyFolder, ensureStashActor, syncPartyStashOwnership } from "./party/party-store.js";
import { isStashActor, registerStashActorHooks, relocateAllStashActors } from "./party/stash-actor.js";
import { registerStashActorSheetDropHook } from "./party/stash-sheet-drop-hook.js";
import { registerActorSheetTabHook } from "./party/open-actor-sheet.js";

Hooks.once("init", () => {
  registerSettings();
  registerPartyFolderHooks();
  registerStashActorHooks();
  registerActorSheetTabHook();
});

Hooks.once("ready", async () => {
  if (game.system?.id !== "dnd4e") {
    console.warn(
      `${MODULE_ID} | active only for the dnd4e system (current: ${game.system?.id ?? "none"})`
    );
    return;
  }
  const mod = game.modules.get(MODULE_ID);
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

Hooks.on("updateUser", (_user, changes) => {
  if (!game.user?.isGM) return;
  if ("active" in changes || "role" in changes) {
    scheduleStashOwnershipSync();
  }
});

function shouldRefreshPartySheet(doc: Actor | Item): boolean {
  const docName = (doc as { documentName?: string }).documentName;
  if (docName === "Actor") {
    const actor = doc as Actor;
    return isPartyMember(actor) || isStashActor(actor);
  }
  if (docName === "Item") {
    const actor = (doc as Item).actor ?? undefined;
    return !!actor && (isPartyMember(actor) || isStashActor(actor));
  }
  return false;
}

Hooks.on("updateActor", (doc: Actor) => {
  if (shouldRefreshPartySheet(doc)) schedulePartySheetRefresh();
});

Hooks.on("updateItem", (doc: Item) => {
  if (shouldRefreshPartySheet(doc)) schedulePartySheetRefresh();
});

Hooks.on("deleteItem", (doc: Item) => {
  if (shouldRefreshPartySheet(doc)) schedulePartySheetRefresh();
});
