import { MODULE_ID } from "../constants.js";
import { localize } from "../i18n.js";
import { isStashActor } from "./stash-actor.js";

export type StashDepositSource = "inventory" | "compendium" | "itemsDirectory";

export type DropData = Record<string, unknown>;

type ItemLike = Pick<Item.Implementation, "uuid"> & {
  actor?: Actor.Implementation | null;
};

function readDropString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  return "";
}

function dropUuid(data: DropData, item: ItemLike): string {
  return readDropString(data.uuid) || item.uuid || "";
}

export function isCompendiumDropData(data: DropData, item?: ItemLike): boolean {
  if (data.pack) return true;
  const uuid = item ? dropUuid(data, item) : readDropString(data.uuid);
  return uuid.startsWith("Compendium.");
}

export function isInventoryDropData(data: DropData): boolean {
  const uuid = readDropString(data.uuid);
  return /^Actor\.[^.]+\.Item\./.test(uuid);
}

/** Compendium pack collection id, e.g. Compendium.dnd4e.items */
export function resolveCompendiumPackId(data: DropData, item?: ItemLike): string | null {
  if (data.pack) return readDropString(data.pack);
  const uuid = item ? dropUuid(data, item) : readDropString(data.uuid);
  if (!uuid.startsWith("Compendium.")) return null;
  const rest = uuid.slice("Compendium.".length);
  const parts = rest.split(".");
  if (parts.length >= 2) {
    return `Compendium.${parts[0]}.${parts[1]}`;
  }
  return `Compendium.${rest}`;
}

export interface CompendiumPackLike { collection: string; title: string }

/** Resolve human-readable compendium name from pack/collection id. */
export function resolveCompendiumPackTitle(
  packId: string,
  packs: CompendiumPackLike[] | null | undefined
): string | null {
  if (!packs?.length) return null;

  const byCollection = new Map(packs.map((p) => [p.collection, p.title]));
  const candidates = [packId];
  if (packId.startsWith("Compendium.")) {
    candidates.push(packId.slice("Compendium.".length));
  } else {
    candidates.push(`Compendium.${packId}`);
  }

  for (const id of candidates) {
    const title = byCollection.get(id);
    if (title) return title;
  }

  for (const pack of packs) {
    const col = pack.collection;
    if (
      col === packId ||
      col.endsWith(`.${packId}`) ||
      packId.endsWith(col.replace(/^Compendium\./, ""))
    ) {
      return pack.title;
    }
  }

  return null;
}

export function classifyDepositSource(data: DropData, item: ItemLike): StashDepositSource {
  if (isCompendiumDropData(data, item)) {
    return "compendium";
  }

  const actor = item.actor;
  if (actor?.id && !isStashActor(actor)) {
    return "inventory";
  }

  if (!actor) {
    return "itemsDirectory";
  }

  return "inventory";
}

export function getExternalSourceLabel(data: DropData, item?: ItemLike): string {
  const packId = resolveCompendiumPackId(data, item);
  if (packId) {
    const packs = game.packs?.contents as CompendiumPackLike[] | undefined;
    const title = resolveCompendiumPackTitle(packId, packs);
    if (title) return title;
    return packId.startsWith("Compendium.") ? packId.slice("Compendium.".length) : packId;
  }
  return localize(`${MODULE_ID}.sheet.stash.chatLog.itemsDirectory`);
}
