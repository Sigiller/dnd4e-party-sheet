import { useEffect, type RefObject } from "react";
import { handleStashDrop } from "../../../party/stash-drop.js";
import { isInventoryDropData } from "../../../party/stash-deposit-source.js";

export function useStashDragDrop(
  tabRef: RefObject<HTMLElement | null>,
  stashActorId: string,
  canEdit: boolean,
  onItemsChanged: () => void
): void {
  useEffect(() => {
    const el = tabRef.current;
    if (!el || !canEdit) return;

    const stashActor = game.actors.get(stashActorId);
    if (!stashActor) return;

    const dragDrop = new foundry.applications.ux.DragDrop({
      dragSelector: ".item-list.gear .item.gear",
      dropSelector: null,
      permissions: {
        dragstart: () => canEdit,
        drop: () => canEdit,
      },
      callbacks: {
        dragstart: (event: DragEvent) => {
          const li = (event.currentTarget as HTMLElement)?.closest("li.item.gear");
          const itemId = li?.dataset.itemId;
          const item = itemId ? stashActor.items.get(itemId) : null;
          if (!item) return;
          const dragData =
            typeof item.toDragData === "function"
              ? item.toDragData()
              : { type: "Item", uuid: item.uuid };
          event.dataTransfer?.setData("text/plain", JSON.stringify(dragData));
        },
        dragover: (event: DragEvent) => {
          const TextEditor = foundry.applications.ux.TextEditor;
          const data =
            TextEditor.getDragEventData?.(event) ??
            TextEditor.implementation?.getDragEventData?.(event);
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

    dragDrop.bind(el);
    return () => {
      /* DragDrop has no unbind in all versions; re-render replaces DOM */
    };
  }, [tabRef, stashActorId, canEdit, onItemsChanged]);
}
