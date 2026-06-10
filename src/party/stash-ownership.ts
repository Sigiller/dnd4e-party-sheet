import { updateActorData } from "../types/dnd4e.js";

function isGmClient(): boolean {
  return Boolean(game.user?.isGM);
}

function isPlayerOrTrustedUser(user: User.Implementation): boolean {
  return (
    !user.isGM &&
    (user.role === CONST.USER_ROLES.PLAYER || user.role === CONST.USER_ROLES.TRUSTED)
  );
}

/** All PLAYER/TRUSTED world users get Owner on the stash (not only currently active). */
export function buildStashOwnership(): Record<string, number> {
  const ownership: Record<string, number> = {
    default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE,
  };

  for (const user of game.users?.contents ?? []) {
    if (user.isGM) {
      ownership[user.id] = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
    } else if (isPlayerOrTrustedUser(user)) {
      ownership[user.id] = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
    }
  }

  return ownership;
}

function ownershipDiffers(
  current: Record<string, number>,
  target: Record<string, number>
): boolean {
  const keys = new Set([...Object.keys(current), ...Object.keys(target)]);
  for (const key of keys) {
    if (Number(current[key] ?? -1) !== Number(target[key] ?? -1)) return true;
  }
  return false;
}

export async function syncStashActorOwnership(actor: Actor.Implementation): Promise<void> {
  if (!isGmClient()) return;

  const ownership = buildStashOwnership();
  if (!ownershipDiffers(actor.ownership ?? {}, ownership)) return;

  await updateActorData(actor, { ownership });
}
