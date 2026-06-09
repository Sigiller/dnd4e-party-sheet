import type { Actor, Item } from "../foundry-globals.js";

export interface InventorySection {
  id: string;
  label: string;
  css: string;
  items: InventoryRow[];
}

export interface InventoryRow {
  id: string;
  name: string;
  img: string;
  type: string;
  quantity: number;
  totalWeightLabel: string;
  hasUses: boolean;
  usesValue: number;
  preparedMaxUses: number;
  isStack: boolean;
  isUnavailable: boolean;
  isDepleted: boolean;
  level: number | null;
  price: number | string | null;
  slotLabel: string;
  descriptionHtml: string;
}

type ItemWithChatData = Item & {
  getChatData?: (htmlOptions?: object) => Promise<{ description?: { value?: string } }>;
};

export async function prepareInventorySections(actor: Actor): Promise<InventorySection[]> {
  const inventoryTypes = CONFIG.DND4E.inventoryTypes;
  const sections: Record<string, InventorySection> = {};

  for (const [key, cfg] of Object.entries(inventoryTypes)) {
    sections[key] = {
      id: key,
      label: game.i18n.localize(cfg.label),
      css: key,
      items: [],
    };
  }

  const topLevel = actor.items.filter((item) => !item.system?.container);

  const actorWithOwner = actor as Actor & { isOwner?: boolean };
  const htmlOptions = { secrets: actorWithOwner.isOwner ?? false, relativeTo: actor };

  for (const item of topLevel) {
    if (!Object.keys(inventoryTypes).includes(item.type)) continue;
    sections[item.type]?.items.push(await itemToRow(item, htmlOptions));
  }

  for (const section of Object.values(sections)) {
    section.items.sort((a, b) => a.name.localeCompare(b.name));
  }

  return Object.keys(inventoryTypes).map((key) => sections[key]!);
}

async function itemToRow(
  item: Item,
  htmlOptions: { secrets: boolean; relativeTo: Actor }
): Promise<InventoryRow> {
  let descriptionHtml = "";
  const getChatData = (item as ItemWithChatData).getChatData;
  if (typeof getChatData === "function") {
    const chatData = await getChatData.call(item, htmlOptions);
    descriptionHtml = chatData?.description?.value ?? "";
  }

  const qty = Number(item.system?.quantity) || 0;
  const weight = Number(item.totalWeight ?? item.system?.weight ?? 0);
  const uses = item.system?.uses as { value?: number; per?: string } | undefined;
  const preparedMaxUses = Number(item.system.preparedMaxUses) || 0;
  const hasUses = Boolean(uses?.per && preparedMaxUses > 0);
  const usesValue = Number(uses?.value) || 0;
  const levelRaw = item.system?.level;

  return {
    id: item.id,
    name: item.name,
    img: item.img || "icons/svg/item-bag.svg",
    type: item.type,
    quantity: qty,
    totalWeightLabel: (Math.round(weight * 100) / 100).toString(),
    hasUses,
    usesValue,
    preparedMaxUses,
    isStack: Number.isFinite(qty) && qty !== 1,
    isUnavailable: Boolean(item.system?.notAvailable),
    isDepleted: hasUses && usesValue === 0,
    level: levelRaw != null && levelRaw !== "" ? Number(levelRaw) : null,
    price: item.system?.price ?? null,
    slotLabel: formatItemSlot(item),
    descriptionHtml,
  };
}

function formatItemSlot(item: Item): string {
  if (item.type === "weapon") return formatWeaponHand(item);
  if (item.type === "equipment") return formatEquipmentSlot(item);
  return "";
}

function formatWeaponHand(item: Item): string {
  if (!item.system?.equipped) return "";
  const hand = item.system?.weaponHand as string | undefined;
  if (!hand) return "";
  const keys: Record<string, string> = {
    hMain: "Fox4e.Hand.Main",
    hOff: "Fox4e.Hand.Off",
    hTwo: "Fox4e.Hand.Both",
    hNone: "Fox4e.Hand.None",
  };
  const key = keys[hand];
  return key ? game.i18n.localize(key) : "";
}

function formatEquipmentSlot(item: Item): string {
  const armour = item.system?.armour as { type?: string } | undefined;
  const slotType = armour?.type;
  if (!slotType) return "";
  if (slotType === "other") return game.i18n.localize("Fox4e.Wondrous");
  return slotType;
}

export function computeStashLoad(actor: Actor): number {
  let total = 0;
  for (const item of actor.items) {
    const qty = Number(item.system?.quantity) || 1;
    const w = Number(item.system?.weight) || 0;
    total += w * qty;
  }
  return Math.round(total * 100) / 100;
}
