export async function openActorSheet(actorId: string): Promise<void> {
  const actor = game.actors.get(actorId);
  if (!actor?.sheet) return;

  if (actor.sheet.rendered && actor.sheet.bringToFront) {
    actor.sheet.bringToFront();
  }

  await actor.sheet.render(true);
}
