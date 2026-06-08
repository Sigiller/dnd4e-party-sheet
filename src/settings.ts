import { MODULE_ID } from "./constants.js";

export const SETTING_PARTY_FOLDER = "partyFolderName";
export const SETTING_ALLOW_PLAYER_STASH_CURRENCY = "allowPlayerStashCurrency";

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
}

export function getPartyFolderName(): string {
  return String(game.settings.get(MODULE_ID, SETTING_PARTY_FOLDER) ?? "Party");
}

export function allowPlayerStashCurrency(): boolean {
  return Boolean(game.settings.get(MODULE_ID, SETTING_ALLOW_PLAYER_STASH_CURRENCY));
}
