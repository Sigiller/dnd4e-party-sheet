import { MODULE_ID } from "../constants.js";
import { isStashChatEnabled } from "../settings.js";
import { CURRENCY_DISPLAY_ORDER, RITUALCOMP_RS_KEY } from "./currency-display.js";
import type { Actor, Item } from "../foundry-globals.js";
import { getCurrencyLabel, type CurrencyDeltas } from "./stash-currency.js";

const CHAT_PREFIX = `${MODULE_ID}.sheet.stash.chatLog`;

export interface ActingContext {
  playerName: string;
  characterName?: string;
}

export function getActingContext(characterActor?: Actor | null): ActingContext {
  const playerName = game.user?.name ?? "Unknown";
  const characterName = characterActor?.name ?? game.user?.character?.name;
  return {
    playerName,
    characterName: characterName || undefined,
  };
}

export function formatCurrencySummary(
  deltas: CurrencyDeltas,
  getLabel: (key: string) => string = getCurrencyLabel
): string {
  const parts: string[] = [];
  const order = [...CURRENCY_DISPLAY_ORDER, RITUALCOMP_RS_KEY];
  for (const key of order) {
    const amount = deltas[key];
    if (amount && amount > 0) {
      parts.push(`${amount} ${getLabel(key)}`);
    }
  }
  return parts.join(", ");
}

export function formatItemLink(item: { uuid?: string; name: string }, qty = 1): string {
  const name = item.name;
  if (!item.uuid) {
    return qty > 1 ? `${name} ×${qty}` : name;
  }
  const link = `@UUID[${item.uuid}]{${name}}`;
  return qty > 1 ? `${link} ×${qty}` : link;
}

function chatKey(base: string, ctx: ActingContext): string {
  return ctx.characterName ? `${CHAT_PREFIX}.${base}` : `${CHAT_PREFIX}.${base}NoCharacter`;
}

async function enrichChatHtml(html: string): Promise<string> {
  const TextEditor = foundry.applications.ux.TextEditor as {
    enrichHTML?: (content: string, options?: object) => Promise<string>;
    implementation?: { enrichHTML?: (content: string, options?: object) => Promise<string> };
  };
  const enrich = TextEditor.implementation?.enrichHTML ?? TextEditor.enrichHTML;
  if (typeof enrich === "function") {
    return enrich(html, { async: true, secrets: false });
  }
  return html;
}

async function postStashChatMessage(html: string, characterActor?: Actor | null): Promise<void> {
  if (!isStashChatEnabled()) return;
  const user = game.user;
  if (!user) return;

  const content = await enrichChatHtml(html);
  await ChatMessage.create({
    user: user.id,
    speaker: ChatMessage.getSpeaker({ actor: characterActor ?? undefined }),
    content,
  });
}

export async function logCurrencyAdded(
  characterActor: Actor | null | undefined,
  deltas: CurrencyDeltas
): Promise<void> {
  const details = formatCurrencySummary(deltas);
  if (!details) return;

  const ctx = getActingContext(characterActor);
  const html = game.i18n.format(chatKey("currencyAdded", ctx), {
    player: ctx.playerName,
    character: ctx.characterName ?? "",
    details,
  });
  await postStashChatMessage(html, characterActor ?? game.user?.character ?? undefined);
}

export async function logCurrencyRemoved(
  characterActor: Actor | null | undefined,
  deltas: CurrencyDeltas
): Promise<void> {
  const details = formatCurrencySummary(deltas);
  if (!details) return;

  const ctx = getActingContext(characterActor);
  const html = game.i18n.format(chatKey("currencyRemoved", ctx), {
    player: ctx.playerName,
    character: ctx.characterName ?? "",
    details,
  });
  await postStashChatMessage(html, characterActor ?? game.user?.character ?? undefined);
}

export async function logCurrencyRemovedByGp(
  characterActor: Actor | null | undefined,
  gpTotal: number
): Promise<void> {
  if (gpTotal <= 0) return;

  const ctx = getActingContext(characterActor);
  const html = game.i18n.format(chatKey("currencyRemovedByGp", ctx), {
    player: ctx.playerName,
    character: ctx.characterName ?? "",
    gp: gpTotal,
  });
  await postStashChatMessage(html, characterActor ?? game.user?.character ?? undefined);
}

export async function logItemDepositedFromInventory(
  sourceActor: Actor,
  item: Item,
  qty: number
): Promise<void> {
  const ctx = getActingContext(sourceActor);
  const html = game.i18n.format(`${CHAT_PREFIX}.itemDepositedFromInventory`, {
    player: ctx.playerName,
    character: sourceActor.name,
    item: formatItemLink(item, qty),
  });
  await postStashChatMessage(html, sourceActor);
}

/** @deprecated Use logItemDepositedFromInventory */
export async function logItemDeposited(
  sourceActor: Actor,
  item: Item,
  qty: number
): Promise<void> {
  return logItemDepositedFromInventory(sourceActor, item, qty);
}

export async function logItemAddedFromExternal(
  item: Item,
  qty: number,
  sourceLabel: string,
  source: "compendium" | "itemsDirectory"
): Promise<void> {
  const characterActor = game.user?.character ?? null;
  const ctx = getActingContext(characterActor);

  const baseKey =
    source === "compendium" ? "itemAddedFromCompendium" : "itemAddedFromItemsDirectory";
  const html = game.i18n.format(chatKey(baseKey, ctx), {
    player: ctx.playerName,
    character: ctx.characterName ?? "",
    item: formatItemLink(item, qty),
    source: sourceLabel,
  });
  await postStashChatMessage(html, characterActor ?? undefined);
}

export async function logItemWithdrawn(
  targetActor: Actor,
  item: Item,
  qty: number
): Promise<void> {
  const ctx = getActingContext(targetActor);
  const html = game.i18n.format(`${CHAT_PREFIX}.itemWithdrawn`, {
    player: ctx.playerName,
    character: targetActor.name,
    item: formatItemLink(item, qty),
  });
  await postStashChatMessage(html, targetActor);
}

export async function logItemDeleted(item: Item): Promise<void> {
  const characterActor = game.user?.character ?? null;
  const ctx = getActingContext(characterActor);
  const html = game.i18n.format(chatKey("itemDeleted", ctx), {
    player: ctx.playerName,
    character: ctx.characterName ?? "",
    item: formatItemLink(item),
  });
  await postStashChatMessage(html, characterActor ?? undefined);
}
