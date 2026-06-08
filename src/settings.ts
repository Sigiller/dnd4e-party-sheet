import { MODULE_ID } from "./constants.js";

export const SETTING_PARTY_FOLDER = "partyFolderName";
export const SETTING_STASH_OWNERSHIP = "stashActorOwnership";

export type StashOwnershipSetting = "LIMITED" | "OWNER";

export function registerSettings(): void {
  game.settings.register(MODULE_ID, SETTING_PARTY_FOLDER, {
    name: game.i18n.localize(`${MODULE_ID}.settings.partyFolderName.name`),
    hint: game.i18n.localize(`${MODULE_ID}.settings.partyFolderName.hint`),
    scope: "world",
    config: true,
    type: String,
    default: "Party",
  });

  game.settings.register(MODULE_ID, SETTING_STASH_OWNERSHIP, {
    name: game.i18n.localize(`${MODULE_ID}.settings.stashActorOwnership.name`),
    hint: game.i18n.localize(`${MODULE_ID}.settings.stashActorOwnership.hint`),
    scope: "world",
    config: true,
    type: String,
    choices: {
      LIMITED: game.i18n.localize(`${MODULE_ID}.settings.stashActorOwnership.limited`),
      OWNER: game.i18n.localize(`${MODULE_ID}.settings.stashActorOwnership.owner`),
    },
    default: "LIMITED",
  });
}

export function getPartyFolderName(): string {
  return String(game.settings.get(MODULE_ID, SETTING_PARTY_FOLDER) ?? "Party");
}

export function getStashOwnershipLevel(): number {
  const key = game.settings.get(MODULE_ID, SETTING_STASH_OWNERSHIP) as StashOwnershipSetting;
  return key === "OWNER"
    ? CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
    : CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED;
}
