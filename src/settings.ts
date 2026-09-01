import { MODULE_ID } from "./constants.js";
import { localize } from "./i18n.js";

export const SETTING_PARTY_FOLDER = "partyFolderName";
export const SETTING_ALLOW_PLAYER_STASH_CURRENCY = "allowPlayerStashCurrency";
export const SETTING_STASH_CHAT_LOG = "stashChatLog";
export const SETTING_OVERVIEW_COLLAPSED = "overviewCollapsed";

export function registerSettings(): void {
  if (!game.settings) return;
  game.settings.register(MODULE_ID, SETTING_PARTY_FOLDER, {
    name: localize(`${MODULE_ID}.settings.partyFolderName.name`),
    hint: localize(`${MODULE_ID}.settings.partyFolderName.hint`),
    scope: "world",
    config: true,
    type: String,
    default: "Party",
  });

  game.settings.register(MODULE_ID, SETTING_ALLOW_PLAYER_STASH_CURRENCY, {
    name: localize(`${MODULE_ID}.settings.allowPlayerStashCurrency.name`),
    hint: localize(`${MODULE_ID}.settings.allowPlayerStashCurrency.hint`),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register(MODULE_ID, SETTING_STASH_CHAT_LOG, {
    name: localize(`${MODULE_ID}.settings.stashChatLog.name`),
    hint: localize(`${MODULE_ID}.settings.stashChatLog.hint`),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  // Per-user UI state: which party folders have the overview skills/languages
  // section collapsed. Hidden from the settings sheet.
  game.settings.register(MODULE_ID, SETTING_OVERVIEW_COLLAPSED, {
    name: "Overview section collapsed",
    scope: "client",
    config: false,
    type: Object,
    default: {},
  });
}

export function isOverviewCollapsed(folderId: string): boolean {
  const state = game.settings?.get(MODULE_ID, SETTING_OVERVIEW_COLLAPSED);
  return Boolean((state as Record<string, boolean> | undefined)?.[folderId]);
}

export function setOverviewCollapsed(folderId: string, collapsed: boolean): void {
  const state = {
    ...((game.settings?.get(MODULE_ID, SETTING_OVERVIEW_COLLAPSED) ?? {}) as Record<
      string,
      boolean
    >),
    [folderId]: collapsed,
  };
  void game.settings?.set(MODULE_ID, SETTING_OVERVIEW_COLLAPSED, state);
}

export function getPartyFolderName(): string {
  return String(game.settings?.get(MODULE_ID, SETTING_PARTY_FOLDER) ?? "Party");
}

export function allowPlayerStashCurrency(): boolean {
  return Boolean(game.settings?.get(MODULE_ID, SETTING_ALLOW_PLAYER_STASH_CURRENCY));
}

export function isStashChatEnabled(): boolean {
  return Boolean(game.settings?.get(MODULE_ID, SETTING_STASH_CHAT_LOG));
}
