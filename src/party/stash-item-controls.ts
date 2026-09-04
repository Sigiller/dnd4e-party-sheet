import { formatMessage } from "../i18n.js";
import { getGameActors } from "../types/dnd4e.js";
import { logItemDeleted } from "./stash-chat-log.js";
import { canEditStash } from "./stash-permissions.js";

export async function editStashItem(stashActorId: string, itemId: string): Promise<void> {
  const item = getGameActors()?.get(stashActorId)?.items.get(itemId);
  if (!item?.sheet) return;
  await item.sheet.render(true);
}

export async function deleteStashItem(stashActorId: string, itemId: string): Promise<boolean> {
  const stashActor = getGameActors()?.get(stashActorId);
  const item = stashActor?.items.get(itemId);
  if (!stashActor || !item) return false;
  if (!canEditStash(stashActor)) return false;

  let shouldDelete = true;
  if (game.settings?.get("dnd4e", "itemDeleteConfirmation")) {
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: {
        title: formatMessage("DND4E.DeleteConfirmTitle", { name: item.name }),
      },
      content: formatMessage("DND4E.DeleteConfirmContent", { name: item.name }),
      yes: { default: true },
    });
    shouldDelete = Boolean(confirmed);
  }

  if (!shouldDelete) return false;

  const deleted = { uuid: item.uuid ?? undefined, name: item.name };
  await item.delete();
  await logItemDeleted(deleted);
  return true;
}
