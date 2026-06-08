import { getPartyFolder } from "./party-store.js";
import { isStashActor } from "./stash-actor.js";
import type { Actor, User } from "../foundry-globals.js";

const PC_TYPE = "Player Character";

function isPlayerOrTrustedUser(user: User | undefined): user is User {
  if (!user?.active || user.isGM) return false;
  return user.role === CONST.USER_ROLES.PLAYER || user.role === CONST.USER_ROLES.TRUSTED;
}

function isPlayerCharacter(actor: Actor): boolean {
  return actor.type === PC_TYPE;
}

/** Foundry v13 may expose folder as id string or Folder document. */
export function getActorFolderId(actor: Actor): string | null {
  const folder = actor.folder as string | { id?: string } | null | undefined;
  if (!folder) return null;
  if (typeof folder === "string") return folder;
  return folder.id ?? null;
}

/** True if actor is a direct child of the Party folder (not nested subfolders). */
export function isDirectChildOfPartyFolder(actor: Actor, partyFolderId: string): boolean {
  return getActorFolderId(actor) === partyFolderId;
}

function permissionForUser(actor: Actor, user: User): number {
  const ownership = actor.ownership ?? {};
  if (user.id in ownership) return ownership[user.id]!;
  return ownership.default ?? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE;
}

/**
 * At least one active PLAYER/TRUSTED user has OWNER on this actor (supports multiple owners).
 */
export function hasPlayerOrTrustedOwner(actor: Actor): boolean {
  for (const user of game.users) {
    if (!isPlayerOrTrustedUser(user)) continue;

    if (user.character?.id === actor.id) return true;

    const level = permissionForUser(actor, user);
    if (level >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) return true;

    if (actor.testUserPermission(user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)) {
      return true;
    }
  }

  const def = actor.ownership?.default ?? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE;
  if (def >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER && game.users.some(isPlayerOrTrustedUser)) {
    return true;
  }

  return false;
}

export function isPartyMember(actor: Actor, partyFolderId?: string | null): boolean {
  if (!isPlayerCharacter(actor)) return false;
  if (isStashActor(actor)) return false;

  const folderId = partyFolderId ?? getPartyFolder()?.id ?? null;
  if (folderId) {
    return isDirectChildOfPartyFolder(actor, folderId);
  }

  return hasPlayerOrTrustedOwner(actor);
}

function iterateActors(): Actor[] {
  const collection = game.actors;
  if (collection?.contents) return [...collection.contents];
  if (typeof collection?.filter === "function") return collection.filter(() => true);
  return [];
}

/**
 * Party members for a given Party folder (opened sheet) or world setting fallback.
 */
export function getPartyMembers(partyFolderId?: string): Actor[] {
  const folderId = partyFolderId ?? getPartyFolder()?.id;
  const seen = new Map<string, Actor>();

  for (const actor of iterateActors()) {
    if (!isPartyMember(actor, folderId)) continue;
    seen.set(actor.id, actor);
  }

  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Active PLAYER/TRUSTED owners on an actor (for tooltips / future use). */
export function getPartyMemberOwners(actor: Actor): User[] {
  const owners: User[] = [];
  for (const user of game.users) {
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
