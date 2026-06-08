export async function editStashItem(stashActorId: string, itemId: string): Promise<void> {
  const item = game.actors.get(stashActorId)?.items.get(itemId);
  if (!item?.sheet) return;
  await item.sheet.render(true);
}

export async function deleteStashItem(stashActorId: string, itemId: string): Promise<boolean> {
  const item = game.actors.get(stashActorId)?.items.get(itemId);
  if (!item) return false;

  let shouldDelete = true;
  if (game.settings.get("dnd4e", "itemDeleteConfirmation")) {
    shouldDelete = await foundry.applications.api.Dialog.confirm({
      window: {
        title: game.i18n.format("DND4E.DeleteConfirmTitle", { name: item.name }),
      },
      content: game.i18n.format("DND4E.DeleteConfirmContent", { name: item.name }),
      yes: { default: true },
    });
  }

  if (!shouldDelete) return false;
  await item.delete();
  return true;
}
