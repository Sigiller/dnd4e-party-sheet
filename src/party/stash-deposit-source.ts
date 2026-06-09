import { MODULE_ID } from "../constants.js";
import type { Actor, Item } from "../foundry-globals.js";
import { isStashActor } from "./stash-actor.js";

export type StashDepositSource = "inventory" | "compendium" | "itemsDirectory";

export type DropData = Record<string, unknown>;

type ItemLike = Pick<Item, "uuid"> & { actor?: { id: string } | null };

function dropUuid(data: DropData, item: ItemLike): string {
  return String(data.uuid ?? item.uuid ?? "");
}

export function isCompendiumDropData(data: DropData, item?: ItemLike): boolean {
  if (data.pack) return true;
  const uuid = item ? dropUuid(data, item) : String(data.uuid ?? "");
  return uuid.startsWith("Compendium.");
}

export function isInventoryDropData(data: DropData): boolean {
  const uuid = String(data.uuid ?? "");
  return /^Actor\.[^.]+\.Item\./.test(uuid);
}

/** Compendium pack collection id, e.g. Compendium.dnd4e.items */
export function resolveCompendiumPackId(data: DropData, item?: ItemLike): string | null {
  if (data.pack) return String(data.pack);
  const uuid = item ? dropUuid(data, item) : String(data.uuid ?? "");
  if (!uuid.startsWith("Compendium.")) return null;
  const rest = uuid.slice("Compendium.".length);
  const parts = rest.split(".");
  if (parts.length >= 2) {
    return `Compendium.${parts[0]}.${parts[1]}`;
  }
  return `Compendium.${rest}`;
}

export type CompendiumPackLike = { collection: string; title: string };

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

  const actor = item.actor as Actor | null | undefined;
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
    // Last resort: strip Compendium. prefix for readability
    return packId.startsWith("Compendium.") ? packId.slice("Compendium.".length) : packId;
  }
  return game.i18n.localize(`${MODULE_ID}.sheet.stash.chatLog.itemsDirectory`);
}
