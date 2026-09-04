import { useEffect, type RefObject } from "react";
import { handleStashDrop } from "../../../party/stash-drop.js";
import { isInventoryDropData } from "../../../party/stash-deposit-source.js";
import { getGameActors } from "../../../types/dnd4e.js";

export function useStashDragDrop(
  tabRef: RefObject<HTMLElement | null>,
  stashActorId: string,
  canEdit: boolean,
  onItemsChanged: () => void
): void {
  useEffect(() => {
    const el = tabRef.current;
    if (!el) return;

    const stashActor = getGameActors()?.get(stashActorId);
    if (!stashActor) return;

    const DragDrop = foundry.applications.ux.DragDrop.implementation;
    const dragDrop = new DragDrop({
      dragSelector: ".item-list.gear .item.gear",
      dropSelector: null,
      permissions: {
        dragstart: () => canEdit,
        drop: () => canEdit,
      },
      callbacks: {
        dragstart: (event: DragEvent) => {
          const li = (event.currentTarget as HTMLElement)?.closest("li.item.gear");
          const itemId =
            li instanceof HTMLElement ? li.dataset.itemId : undefined;
          const item = itemId ? stashActor.items.get(itemId) : null;
          if (!item) return;
          const dragData =
            typeof item.toDragData === "function"
              ? item.toDragData()
              : { type: "Item", uuid: item.uuid };
          event.dataTransfer?.setData("text/plain", JSON.stringify(dragData));
        },
        dragover: (event: DragEvent) => {
          const rawData =
            foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
          const data =
            rawData && typeof rawData === "object"
              ? (rawData as Record<string, unknown>)
              : null;
          if (data?.type === "Item") {
            event.preventDefault();
            if (event.dataTransfer) {
              event.dataTransfer.dropEffect = isInventoryDropData(
                data as Record<string, unknown>
              )
                ? "move"
                : "copy";
            }
          }
        },
        drop: async (event: DragEvent) => {
          event.preventDefault();
          event.stopPropagation();
          const ok = await handleStashDrop(event, stashActor);
          if (ok) onItemsChanged();
        },
      },
    });

    // Re-binding with the current permissions is also how handlers get cleared:
    // DragDrop.bind nulls every handler and unsets draggable when canEdit is false.
    dragDrop.bind(el);
  }, [tabRef, stashActorId, canEdit, onItemsChanged]);
}
