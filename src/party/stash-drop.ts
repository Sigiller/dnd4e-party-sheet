import type { Actor, Item } from "../foundry-globals.js";
import { transferItemOntoStash } from "./stash-transfer.js";

function getDropData(event: DragEvent): Record<string, unknown> | null {
  const TextEditor = foundry.applications.ux.TextEditor;
  const data =
    TextEditor.getDragEventData?.(event) ??
    TextEditor.implementation?.getDragEventData?.(event);
  return data && typeof data === "object" ? (data as Record<string, unknown>) : null;
}

function isItemDrop(data: Record<string, unknown>): boolean {
  return data.type === "Item" || data.documentName === "Item";
}

export async function handleStashDrop(
  event: DragEvent,
  stashActor: Actor
): Promise<boolean> {
  const data = getDropData(event);
  if (!data || !isItemDrop(data)) return false;

  const ItemClass = Item.implementation as typeof Item & {
    fromDropData: (data: object) => Promise<import("../foundry-globals.js").Item | null>;
  };
  const item = await ItemClass.fromDropData(data);
  if (!item) return false;

  return transferItemOntoStash(item, stashActor);
}
