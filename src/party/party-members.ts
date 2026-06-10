import { getPartyFolder } from "./party-store.js";
import { isStashActor } from "./stash-actor.js";
import { isPlayerCharacter } from "../types/dnd4e.js";

function isPlayerOrTrustedUser(user: User.Implementation): boolean {
  if (!user.active || user.isGM) return false;
  return user.role === CONST.USER_ROLES.PLAYER || user.role === CONST.USER_ROLES.TRUSTED;
}

/** Foundry v13 may expose folder as id string or Folder document. */
export function getActorFolderId(actor: Actor.Implementation): string | null {
  const folder = actor.folder;
  if (!folder) return null;
  if (typeof folder === "string") return folder;
  return folder.id ?? null;
}

/** True if actor is a direct child of the Party folder (not nested subfolders). */
export function isDirectChildOfPartyFolder(
  actor: Actor.Implementation,
  partyFolderId: string
): boolean {
  return getActorFolderId(actor) === partyFolderId;
}

function permissionForUser(
  actor: Actor.Implementation,
  user: User.Implementation
): number {
  const ownership = actor.ownership;
  const userId = user.id ?? "";
  if (userId && userId in ownership) {
    return ownership[userId] ?? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE;
  }
  return ownership.default ?? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE;
}

/**
 * At least one active PLAYER/TRUSTED user has OWNER on this actor (supports multiple owners).
 */
export function hasPlayerOrTrustedOwner(actor: Actor.Implementation): boolean {
  const users = game.users?.contents ?? [];
  for (const user of users) {
    if (!isPlayerOrTrustedUser(user)) continue;

    if (user.character?.id === actor.id) return true;

    const level = permissionForUser(actor, user);
    if (level >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) return true;

    if (actor.testUserPermission(user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)) {
      return true;
    }
  }

  const def = actor.ownership.default ?? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE;
  if (def >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER && (game.users?.some(isPlayerOrTrustedUser) ?? false)) {
    return true;
  }

  return false;
}

export function isPartyMember(
  actor: Actor.Implementation,
  partyFolderId?: string | null
): boolean {
  if (!isPlayerCharacter(actor)) return false;
  if (isStashActor(actor)) return false;

  const folderId = partyFolderId ?? getPartyFolder()?.id ?? null;
  if (folderId) {
    return isDirectChildOfPartyFolder(actor, folderId);
  }

  return hasPlayerOrTrustedOwner(actor);
}

/**
 * Party members for a given Party folder (opened sheet) or world setting fallback.
 */
export function getPartyMembers(partyFolderId?: string): Actor.Implementation[] {
  const folderId = partyFolderId ?? getPartyFolder()?.id;
  const seen = new Map<string, Actor.Implementation>();

  const actors = (game.actors as { contents?: Actor.Implementation[] } | undefined)?.contents ?? [];
  for (const actor of actors) {
    if (!isPartyMember(actor, folderId)) continue;
    if (!actor.id) continue;
    seen.set(actor.id, actor);
  }

  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Active PLAYER/TRUSTED owners on an actor (for tooltips / future use). */
export function getPartyMemberOwners(actor: Actor.Implementation): User.Implementation[] {
  const owners: User.Implementation[] = [];
  for (const user of game.users?.contents ?? []) {
    if (!isPlayerOrTrustedUser(user)) continue;
    if (user.character?.id === actor.id) {
      owners.push(user);
      continue;
    }
    if (permissionForUser(actor, user) >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
      owners.push(user);
    }
  }
  return owners;
}
