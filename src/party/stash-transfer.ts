import { MODULE_ID } from "../constants.js";
import type { Actor, Item } from "../foundry-globals.js";
import { isPartyMember } from "./party-members.js";
import { isStashActor } from "./stash-actor.js";
import { canEditStash } from "./stash-permissions.js";
import {
  logItemDepositedFromInventory,
  logItemWithdrawn,
  logItemAddedFromExternal,
} from "./stash-chat-log.js";
import type { StashDepositSource } from "./stash-deposit-source.js";
import {
  getItemStackQuantity,
  parseTransferQuantity,
  shouldPromptTransferQuantity,
} from "./stash-transfer-quantity.js";

type ItemImplementation = typeof Item & {
  implementation: typeof Item & {
    fromDropData: (data: object) => Promise<Item | null>;
    createWithContents?: (
      items: Item[],
      options?: { transformFirst?: (item: Item) => object }
    ) => Promise<object[]>;
    createDocuments: (
      data: object[],
      options?: { parent?: Actor; keepId?: boolean }
    ) => Promise<Item[]>;
  };
};

function getItemClass(): ItemImplementation["implementation"] {
  return (Item as ItemImplementation).implementation;
}

function setItemQuantity(itemData: object, quantity: number): object {
  const data = foundry.utils.deepClone(itemData) as Record<string, unknown>;
  const system = (data.system ?? {}) as Record<string, unknown>;
  system.quantity = quantity;
  data.system = system;
  return data;
}

export async function promptTransferQuantity(
  itemName: string,
  maxQuantity: number
): Promise<number | null> {
  if (!shouldPromptTransferQuantity(maxQuantity)) return maxQuantity;

  const prefix = `${MODULE_ID}.sheet.stash.transferQuantity`;
  const title = game.i18n.localize(`${prefix}.title`);
  const hint = game.i18n.format(`${prefix}.hint`, {
    name: itemName,
    max: maxQuantity,
  });
  const label = game.i18n.localize(`${prefix}.label`);
  const confirm = game.i18n.localize(`${prefix}.confirm`);
  const cancel = game.i18n.localize("Cancel");

  const result = await foundry.applications.api.DialogV2.input({
    window: { title },
    content: `<p>${foundry.utils.escapeHTML(hint)}</p>
      <div class="form-group">
        <label>${foundry.utils.escapeHTML(label)}</label>
        <input type="number" name="quantity" min="1" max="${maxQuantity}" step="1" value="${maxQuantity}" />
      </div>`,
    ok: { icon: "fas fa-check", label: confirm },
    cancel: { icon: "fas fa-times", label: cancel },
    rejectClose: false,
  });

  if (!result) return null;

  const qty = parseTransferQuantity(result.quantity, maxQuantity);
  if (qty === null) {
    ui.notifications?.warn(
      game.i18n.format(`${prefix}.invalid`, { max: maxQuantity }),
      { localize: false }
    );
  }
  return qty;
}

function itemToData(source: Item): object {
  return source.toObject();
}

async function removeItemFromActor(actor: Actor, itemId: string): Promise<void> {
  const doc = actor.items.get(itemId);
  if (!doc) return;

  const deleter = actor as Actor & {
    deleteEmbeddedDocuments?: (type: string, ids: string[], options?: object) => Promise<unknown>;
  };
  if (typeof deleter.deleteEmbeddedDocuments === "function") {
    await deleter.deleteEmbeddedDocuments("Item", [itemId]);
    return;
  }
  await doc.delete();
}

export async function transferItemToActor(
  item: Item,
  targetActor: Actor,
  quantity: number
): Promise<Item | null> {
  const sourceActor = item.actor;
  if (!sourceActor) return null;

  const ItemClass = getItemClass();
  const maxQty = getItemStackQuantity(item.system?.quantity);
  const qty = Math.min(Math.max(1, Math.floor(quantity)), maxQty);
  const fullStack = qty >= maxQty;
  const crossActor = sourceActor.id !== targetActor.id;
  const sourceItemId = item.id;

  const transformFirst = (source: Item) =>
    fullStack ? itemToData(source) : setItemQuantity(itemToData(source), qty);

  const toCreate =
    typeof ItemClass.createWithContents === "function"
      ? await ItemClass.createWithContents([item], {
          keepId: false,
          transformFirst,
        })
      : [transformFirst(item)];

  if (!toCreate?.length) return null;

  const created = await ItemClass.createDocuments(toCreate, {
    parent: targetActor,
    keepId: crossActor ? false : true,
  });

  if (fullStack) {
    await removeItemFromActor(sourceActor, sourceItemId);
  } else {
    const remaining = sourceActor.items.get(sourceItemId);
    if (remaining) {
      await remaining.update({ "system.quantity": maxQty - qty });
    }
  }

  return created[0] ?? null;
}

function canTakeItem(item: Item): boolean {
  const user = game.user;
  if (!user) return false;
  return (
    user.isGM ||
    (item.actor != null &&
      item.actor.testUserPermission(user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER))
  );
}

/** Stash uses LIMITED ownership for players; removal must match stash edit rights. */
function canTransferItemFromActor(item: Item): boolean {
  if (!item.actor) return false;
  if (isStashActor(item.actor)) return canEditStash(item.actor);
  return canTakeItem(item);
}

export async function resolveTransferQuantity(item: Item): Promise<number | null> {
  const maxQty = getItemStackQuantity(item.system?.quantity);
  return promptTransferQuantity(item.name, maxQty);
}

/** PC (or other actor) → party stash. */
export async function transferItemOntoStash(
  item: Item,
  stashActor: Actor,
  quantity?: number
): Promise<boolean> {
  if (!canEditStash(stashActor)) return false;
  if (!canTakeItem(item)) {
    ui.notifications?.warn(game.i18n.localize("DND4E.WarnNoPermission"), { localize: false });
    return false;
  }
  if (item.actor?.id === stashActor.id) return true;

  const sourceActor = item.actor;
  if (!sourceActor) return false;

  let qty = quantity;
  if (qty == null) {
    const chosen = await resolveTransferQuantity(item);
    if (chosen === null) return false;
    qty = chosen;
  }

  const created = await transferItemToActor(item, stashActor, qty);
  if (created) {
    await logItemDepositedFromInventory(sourceActor, created, qty);
  }
  return true;
}

/** Compendium or Items Directory → party stash (copy, not move). */
export async function copyItemOntoStash(
  item: Item,
  stashActor: Actor,
  source: StashDepositSource,
  sourceLabel: string,
  quantity?: number
): Promise<boolean> {
  if (!canEditStash(stashActor)) return false;
  if (item.actor?.id === stashActor.id) return true;

  const ItemClass = getItemClass();
  const maxQty = getItemStackQuantity(item.system?.quantity);
  let qty = quantity;
  if (qty == null) {
    const chosen = await resolveTransferQuantity(item);
    if (chosen === null) return false;
    qty = chosen;
  }

  qty = Math.min(Math.max(1, Math.floor(qty)), maxQty);

  const transformFirst = (source: Item) => {
    const data = itemToData(source);
    if (qty < maxQty) return setItemQuantity(data, qty);
    return data;
  };

  const toCreate =
    typeof ItemClass.createWithContents === "function"
      ? await ItemClass.createWithContents([item], {
          keepId: false,
          transformFirst,
        })
      : [transformFirst(item)];

  if (!toCreate?.length) return false;

  const created = await ItemClass.createDocuments(toCreate, {
    parent: stashActor,
    keepId: false,
  });

  const createdItem = created[0] ?? null;
  if (createdItem) {
    await logItemAddedFromExternal(createdItem, qty, sourceLabel, source);
  }
  return true;
}

/** Party stash → party member actor sheet drop. */
export async function handleStashItemDropOnActor(
  targetActor: Actor,
  data: Record<string, unknown>
): Promise<boolean> {
  if (!isPartyMember(targetActor)) return false;

  const ItemClass = getItemClass();
  const item = await ItemClass.fromDropData(data);
  if (!item?.actor || !isStashActor(item.actor)) return false;
  if (!canEditStash(item.actor)) return false;
  if (!canTransferItemFromActor(item)) {
    ui.notifications?.warn(game.i18n.localize("DND4E.WarnNoPermission"), { localize: false });
    return true;
  }

  const chosen = await resolveTransferQuantity(item);
  if (chosen === null) return true;

  const created = await transferItemToActor(item, targetActor, chosen);
  if (created) {
    await logItemWithdrawn(targetActor, created, chosen);
  }
  return true;
}
