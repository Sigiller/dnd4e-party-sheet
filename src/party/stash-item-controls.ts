import { formatMessage } from "../i18n.js";
import { getGameActors } from "../types/dnd4e.js";
import { logItemDeleted } from "./stash-chat-log.js";

export async function editStashItem(stashActorId: string, itemId: string): Promise<void> {
  const item = getGameActors()?.get(stashActorId)?.items.get(itemId);
  if (!item?.sheet) return;
  await item.sheet.render(true);
}

export async function deleteStashItem(stashActorId: string, itemId: string): Promise<boolean> {
  const item = getGameActors()?.get(stashActorId)?.items.get(itemId);
  if (!item) return false;

  let shouldDelete = true;
  if (game.settings?.get("dnd4e", "itemDeleteConfirmation")) {
    const confirmed = await foundry.applications.api.Dialog.confirm({
      window: {
        title: formatMessage("DND4E.DeleteConfirmTitle", { name: item.name }),
      },
      content: formatMessage("DND4E.DeleteConfirmContent", { name: item.name }),
      yes: { default: true },
    });
    shouldDelete = Boolean(confirmed);
  }

  if (!shouldDelete) return false;
  await logItemDeleted(item);
  await item.delete();
  return true;
}
