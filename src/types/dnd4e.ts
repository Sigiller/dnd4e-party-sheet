export interface Dnd4eConfigLabelEntry {
  label?: string;
}

export interface Dnd4eActorDetails {
  level?: number;
  race?: string;
  class?: string;
  paragon?: string;
  epic?: string;
  surges?: { value?: number; max?: number };
}

export interface Dnd4eActorSkill {
  label?: string;
  total?: number;
  training?: number;
}

export interface Dnd4eActorSystem {
  details?: Dnd4eActorDetails;
  currency?: Record<string, number>;
  ritualcomp?: Record<string, number>;
  attributes?: { hp?: { value?: number; max?: number } };
  defences?: Record<string, { value?: number }>;
  encumbrance?: { value?: number; max?: number };
  skills?: Record<string, Dnd4eActorSkill>;
  senses?: {
    special?: { value?: string[] | string; custom?: string };
  };
  languages?: Record<
    string,
    {
      value?: Iterable<string> | string[] | string;
      custom?: string;
    }
  >;
}

export type CurrencyRecord = Record<string, number>;

const PC_TYPE = "Player Character";

/** Single documented cast point for dnd4e actor system data. */
export function getDnd4eSystem(actor: Actor.Implementation): Dnd4eActorSystem {
  return actor.system as Dnd4eActorSystem;
}

export function isPlayerCharacter(actor: Actor.Implementation): boolean {
  return String(actor.type) === PC_TYPE;
}

export function readActorLevel(actor: Actor.Implementation): number {
  const level = getDnd4eSystem(actor).details?.level;
  return Number(level) || 1;
}

export function readStashCurrency(actor: Actor.Implementation): CurrencyRecord {
  return getDnd4eSystem(actor).currency ?? {};
}

export function readRitualcomp(actor: Actor.Implementation): CurrencyRecord {
  return getDnd4eSystem(actor).ritualcomp ?? {};
}

export function localizeDnd4eConfigLabel(
  config: Record<string, Dnd4eConfigLabelEntry> | undefined,
  key: string | undefined
): string {
  if (!key || !config?.[key]?.label) return "";
  return game.i18n?.localize(config[key].label) ?? config[key].label;
}

export function requireActorId(actor: Actor.Implementation): string {
  if (!actor.id) throw new Error(`Actor "${actor.name}" is missing an id`);
  return actor.id;
}

export interface Dnd4eItemSystem {
  container?: unknown;
  quantity?: number;
  weight?: number;
  uses?: { value?: number; per?: string };
  preparedMaxUses?: number;
  level?: number | string;
  notAvailable?: boolean;
  price?: number | string | null;
  equipped?: boolean;
  weaponHand?: string;
  armour?: { type?: string };
}

/** Single documented cast point for dnd4e item system data. */
export function getDnd4eItemSystem(item: Item.Implementation): Dnd4eItemSystem {
  return item.system as Dnd4eItemSystem;
}

export type Dnd4eItem = Item.Implementation & {
  totalWeight?: number;
  toDragData?: () => object;
};

interface ActorCollection {
  get: (id: string) => Actor.Implementation | undefined;
  contents: Actor.Implementation[];
}

/** Single cast point for game.actors when fvtt-types narrows to never. */
export function getGameActors(): ActorCollection | undefined {
  return game.actors as ActorCollection | undefined;
}

/** Single cast point for dnd4e dot-path actor updates. */
export async function updateActorData(
  actor: Actor.Implementation,
  data: Record<string, unknown>
): Promise<void> {
  await actor.update(data as Parameters<Actor.Implementation["update"]>[0]);
}

/** Single cast point for dnd4e dot-path item updates. */
export async function updateItemData(
  item: Item.Implementation,
  data: Record<string, unknown>
): Promise<void> {
  await item.update(data as Parameters<Item.Implementation["update"]>[0]);
}

/** Single cast point for Actor.createDocuments with dnd4e stash data. */
export function createActorDocuments(
  data: object[],
  options?: { parent?: null }
): Promise<Actor.Implementation[]> {
  return Actor.createDocuments(
    data as Parameters<typeof Actor.createDocuments>[0],
    options as Parameters<typeof Actor.createDocuments>[1]
  );
}

/** Single cast point for Item.createDocuments with prepared data objects. */
export function createItemDocuments(
  data: object[],
  options?: { parent?: Actor.Implementation; keepId?: boolean }
): Promise<Item.Implementation[]> {
  return Item.implementation.createDocuments(
    data as Parameters<typeof Item.implementation.createDocuments>[0],
    options as Parameters<typeof Item.implementation.createDocuments>[1]
  );
}

export type ActorWithLegacyEffects = Actor.Implementation & {
  allApplicableEffects?: () => Promise<{ name: string; img: string }[]>;
  getActiveEffects?: () => { name: string; img: string }[];
};
