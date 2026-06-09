import { MODULE_ID } from "./constants.js";

export const SETTING_PARTY_FOLDER = "partyFolderName";
export const SETTING_ALLOW_PLAYER_STASH_CURRENCY = "allowPlayerStashCurrency";
export const SETTING_STASH_CHAT_LOG = "stashChatLog";

export function registerSettings(): void {
  game.settings.register(MODULE_ID, SETTING_PARTY_FOLDER, {
    name: game.i18n.localize(`${MODULE_ID}.settings.partyFolderName.name`),
    hint: game.i18n.localize(`${MODULE_ID}.settings.partyFolderName.hint`),
    scope: "world",
    config: true,
    type: String,
    default: "Party",
  });

  game.settings.register(MODULE_ID, SETTING_ALLOW_PLAYER_STASH_CURRENCY, {
    name: game.i18n.localize(`${MODULE_ID}.settings.allowPlayerStashCurrency.name`),
    hint: game.i18n.localize(`${MODULE_ID}.settings.allowPlayerStashCurrency.hint`),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register(MODULE_ID, SETTING_STASH_CHAT_LOG, {
    name: game.i18n.localize(`${MODULE_ID}.settings.stashChatLog.name`),
    hint: game.i18n.localize(`${MODULE_ID}.settings.stashChatLog.hint`),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });
}

export function getPartyFolderName(): string {
  return String(game.settings.get(MODULE_ID, SETTING_PARTY_FOLDER) ?? "Party");
}

export function allowPlayerStashCurrency(): boolean {
  return Boolean(game.settings.get(MODULE_ID, SETTING_ALLOW_PLAYER_STASH_CURRENCY));
}

export function isStashChatEnabled(): boolean {
  return Boolean(game.settings.get(MODULE_ID, SETTING_STASH_CHAT_LOG));
}
