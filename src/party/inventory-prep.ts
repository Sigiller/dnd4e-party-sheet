import { getDnd4eItemSystem, type Dnd4eItem } from "../types/dnd4e.js";
import { localize } from "../i18n.js";

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

type ItemWithChatData = Dnd4eItem & {
  getChatData?: (htmlOptions?: object) => Promise<{ description?: { value?: string } }>;
};

export async function prepareInventorySections(
  actor: Actor.Implementation
): Promise<InventorySection[]> {
  const inventoryTypes = CONFIG.DND4E.inventoryTypes;
  const sections: Record<string, InventorySection> = {};

  for (const [key, cfg] of Object.entries(inventoryTypes)) {
    sections[key] = {
      id: key,
      label: localize(cfg.label),
      css: key,
      items: [],
    };
  }

  const topLevel = actor.items.filter((item) => !getDnd4eItemSystem(item).container);

  const actorWithOwner = actor as Actor.Implementation & { isOwner?: boolean };
  const htmlOptions = { secrets: actorWithOwner.isOwner ?? false, relativeTo: actor };

  for (const item of topLevel) {
    const itemType = String(item.type);
    if (!Object.keys(inventoryTypes).includes(itemType)) continue;
    sections[itemType]?.items.push(await itemToRow(item, htmlOptions));
  }

  for (const section of Object.values(sections)) {
    section.items.sort((a, b) => a.name.localeCompare(b.name));
  }

  return Object.keys(inventoryTypes)
    .map((key) => sections[key])
    .filter((section): section is InventorySection => section != null);
}

async function itemToRow(
  item: Item.Implementation,
  htmlOptions: { secrets: boolean; relativeTo: Actor.Implementation }
): Promise<InventoryRow> {
  let descriptionHtml = "";
  const getChatData = (item as ItemWithChatData).getChatData;
  if (typeof getChatData === "function") {
    const chatData = await getChatData.call(item, htmlOptions);
    descriptionHtml = chatData?.description?.value ?? "";
  }

  const system = getDnd4eItemSystem(item);
  const dnd4eItem = item as Dnd4eItem;
  const qty = Number(system.quantity) || 0;
  const weight = Number(dnd4eItem.totalWeight ?? system.weight ?? 0);
  const uses = system.uses;
  const preparedMaxUses = Number(system.preparedMaxUses) || 0;
  const hasUses = Boolean(uses?.per && preparedMaxUses > 0);
  const usesValue = Number(uses?.value) || 0;
  const levelRaw = system.level;

  return {
    id: item.id ?? "",
    name: item.name,
    img: item.img || "icons/svg/item-bag.svg",
    type: String(item.type),
    quantity: qty,
    totalWeightLabel: (Math.round(weight * 100) / 100).toString(),
    hasUses,
    usesValue,
    preparedMaxUses,
    isStack: Number.isFinite(qty) && qty !== 1,
    isUnavailable: Boolean(system.notAvailable),
    isDepleted: hasUses && usesValue === 0,
    level: levelRaw != null && levelRaw !== "" ? Number(levelRaw) : null,
    price: system.price ?? null,
    slotLabel: formatItemSlot(item),
    descriptionHtml,
  };
}

function formatItemSlot(item: Item.Implementation): string {
  const itemType = String(item.type);
  if (itemType === "weapon") return formatWeaponHand(item);
  if (itemType === "equipment") return formatEquipmentSlot(item);
  return "";
}

function formatWeaponHand(item: Item.Implementation): string {
  const system = getDnd4eItemSystem(item);
  if (!system.equipped) return "";
  const hand = system.weaponHand;
  if (!hand) return "";
  const keys: Record<string, string> = {
    hMain: "Fox4e.Hand.Main",
    hOff: "Fox4e.Hand.Off",
    hTwo: "Fox4e.Hand.Both",
    hNone: "Fox4e.Hand.None",
  };
  const key = keys[hand];
  return key ? localize(key) : "";
}

function formatEquipmentSlot(item: Item.Implementation): string {
  const slotType = getDnd4eItemSystem(item).armour?.type;
  if (!slotType) return "";
  if (slotType === "other") return localize("Fox4e.Wondrous");
  return slotType;
}

export function computeStashLoad(actor: Actor.Implementation): number {
  let total = 0;
  for (const item of actor.items) {
    const system = getDnd4eItemSystem(item);
    const qty = Number(system.quantity) || 1;
    const w = Number(system.weight) || 0;
    total += w * qty;
  }
  return Math.round(total * 100) / 100;
}
