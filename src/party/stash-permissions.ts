import type { Actor } from "../foundry-globals.js";
import { allowPlayerStashCurrency } from "../settings.js";

function isActivePlayerUser(user: User): boolean {
  return (
    user.active &&
    !user.isGM &&
    (user.role === CONST.USER_ROLES.PLAYER || user.role === CONST.USER_ROLES.TRUSTED)
  );
}

/** Edit stash items, drag-drop, item controls. */
export function canEditStash(stashActor: Actor): boolean {
  const user = game.user;
  if (!user) return false;
  return (
    user.isGM ||
    stashActor.testUserPermission(user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) ||
    stashActor.testUserPermission(user, CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED)
  );
}

/** Add/subtract party stash currency. */
export function canEditStashCurrency(stashActor: Actor): boolean {
  const user = game.user;
  if (!user) return false;
  if (user.isGM) return true;
  if (!allowPlayerStashCurrency()) return false;
  if (!isActivePlayerUser(user)) return false;
  return stashActor.testUserPermission(user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER);
}
