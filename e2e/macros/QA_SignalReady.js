/**
 * Runs on Hook Macros → ready. Sets window.__qa for Playwright synchronization.
 */
const moduleId = "dnd4e-party-sheet";
const mod = game.modules.get(moduleId);
window.__qa = {
  ready: true,
  moduleVersion: mod?.version ?? null,
  userName: game.user?.name ?? null,
  userRole: game.user?.role ?? null,
  isGM: Boolean(game.user?.isGM),
};
