import type { Actor } from "../foundry-globals.js";
import { allowPlayerStashCurrency } from "../settings.js";

function isActivePlayerUser(user: User): boolean {
  return (
    user.active &&
    !user.isGM &&
    (user.role === CONST.USER_ROLES.PLAYER || user.role === CONST.USER_ROLES.TRUSTED)
  );
}

function stashOwnershipLevel(stashActor: Actor, user: User): number {
  const ownership = stashActor.ownership ?? {};
  if (user.id in ownership) return Number(ownership[user.id]);
  return Number(ownership.default ?? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE);
}

function hasStashPermission(stashActor: Actor, user: User, minLevel: number): boolean {
  if (user.isGM) return true;
  if (stashActor.testUserPermission(user, minLevel)) return true;
  return stashOwnershipLevel(stashActor, user) >= minLevel;
}

/** Edit stash items, drag-drop, item controls. */
export function canEditStash(stashActor: Actor): boolean {
  const user = game.user;
  if (!user) return false;
  return hasStashPermission(stashActor, user, CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED);
}

/** Add/subtract party stash currency. */
export function canEditStashCurrency(stashActor: Actor): boolean {
  const user = game.user;
  if (!user) return false;
  if (user.isGM) return true;
  if (!allowPlayerStashCurrency()) return false;
  if (!isActivePlayerUser(user)) return false;
  return hasStashPermission(stashActor, user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER);
}
