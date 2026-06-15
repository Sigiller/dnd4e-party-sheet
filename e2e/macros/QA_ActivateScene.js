/**
 * Activates the first scene with tokens, or the currently active scene.
 */
const scenes = game.scenes.contents;
let scene =
  scenes.find((s) => s.active) ??
  scenes.find((s) => s.tokens.size > 0) ??
  scenes[0];
if (!scene) {
  ui.notifications?.error("QA_ActivateScene: no scenes in world");
} else if (!scene.active) {
  await scene.activate();
  ui.notifications?.info(`QA_ActivateScene: activated "${scene.name}"`);
} else {
  ui.notifications?.info(`QA_ActivateScene: already on "${scene.name}"`);
}
