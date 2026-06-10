import {
  classifyDepositSource,
  getExternalSourceLabel,
} from "./stash-deposit-source.js";
import { copyItemOntoStash, transferItemOntoStash } from "./stash-transfer.js";

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
  stashActor: Actor.Implementation
): Promise<boolean> {
  const data = getDropData(event);
  if (!data || !isItemDrop(data)) return false;

  const item = await Item.implementation.fromDropData(data);
  if (!item) return false;

  const source = classifyDepositSource(data, item);
  if (source === "inventory") {
    return transferItemOntoStash(item, stashActor);
  }

  const sourceLabel = getExternalSourceLabel(data, item);
  return copyItemOntoStash(item, stashActor, source, sourceLabel);
}
