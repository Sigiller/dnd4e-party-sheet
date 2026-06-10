import { allowPlayerStashCurrency } from "../settings.js";

function isActivePlayerUser(user: User.Implementation): boolean {
  return (
    user.active &&
    !user.isGM &&
    (user.role === CONST.USER_ROLES.PLAYER || user.role === CONST.USER_ROLES.TRUSTED)
  );
}

function stashOwnershipLevel(
  stashActor: Actor.Implementation,
  user: User.Implementation
): number {
  const ownership = stashActor.ownership;
  const userId = user.id ?? "";
  if (userId && userId in ownership) return Number(ownership[userId]);
  return Number(ownership.default ?? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE);
}

function hasStashPermission(
  stashActor: Actor.Implementation,
  user: User.Implementation,
  minLevel: number
): boolean {
  if (user.isGM) return true;
  if (
    stashActor.testUserPermission(
      user,
      minLevel as Parameters<typeof stashActor.testUserPermission>[1]
    )
  ) {
    return true;
  }
  return stashOwnershipLevel(stashActor, user) >= minLevel;
}

/** Edit stash items, drag-drop, item controls. */
export function canEditStash(stashActor: Actor.Implementation): boolean {
  const user = game.user;
  if (!user) return false;
  return hasStashPermission(stashActor, user, CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED);
}

/** Add/subtract party stash currency. */
export function canEditStashCurrency(stashActor: Actor.Implementation): boolean {
  const user = game.user;
  if (!user) return false;
  if (user.isGM) return true;
  if (!allowPlayerStashCurrency()) return false;
  if (!isActivePlayerUser(user)) return false;
  return hasStashPermission(stashActor, user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER);
}
