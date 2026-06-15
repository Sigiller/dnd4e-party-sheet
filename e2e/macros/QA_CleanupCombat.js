/**
 * Ends active combat and clears token selection (GM cleanup between E2E runs).
 */
if (game.combat) {
  await game.combat.delete();
}
for (const token of canvas.tokens?.controlled ?? []) {
  token.release();
}
ui.notifications?.info("QA_CleanupCombat: combat cleared");
