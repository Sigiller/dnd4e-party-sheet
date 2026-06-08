import {
  FLAG_SCOPE,
  MODULE_ID,
  STASH_ACTOR_NAME,
  type PartyFolderFlags,
  type StashActorFlags,
} from "../constants.js";
import { getPartyFolderName } from "../settings.js";
import { ensureStashActorUnfoldered } from "./stash-actor.js";
import type { Actor, Folder } from "../foundry-globals.js";

function isGmUser(): boolean {
  return Boolean(game.user?.isGM);
}

export function getPartyFolder(): Folder | undefined {
  const name = getPartyFolderName().trim().toLowerCase();
  if (!name) return undefined;
  return game.folders.find(
    (f) => f.type === "Actor" && f.name.trim().toLowerCase() === name
  );
}

export function getPartyFlags(folder: Folder): PartyFolderFlags {
  return (folder.flags[FLAG_SCOPE] ?? {}) as PartyFolderFlags;
}

export async function updatePartyFlags(
  folder: Folder,
  patch: Partial<PartyFolderFlags>
): Promise<PartyFolderFlags> {
  const current = getPartyFlags(folder);
  const next = { ...current, ...patch };
  await folder.update({ [`flags.${FLAG_SCOPE}`]: next });
  return next;
}

function buildStashOwnership(): Record<string, number> {
  const ownership: Record<string, number> = {
    default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE,
  };
  const playerLevel = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
  for (const user of game.users.contents) {
    if (user.isGM) {
      ownership[user.id] = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
    } else if (user.active && (user.role === CONST.USER_ROLES.PLAYER || user.role === CONST.USER_ROLES.TRUSTED)) {
      ownership[user.id] = playerLevel;
    }
  }
  return ownership;
}

async function syncStashOwnership(actor: Actor): Promise<void> {
  if (!isGmUser()) return;
  const target = buildStashOwnership();
  const current = { ...(actor.ownership ?? {}) };
  let changed = false;

  for (const [userId, level] of Object.entries(target)) {
    if (current[userId] !== level) {
      current[userId] = level;
      changed = true;
    }
  }

  if (changed) {
    await actor.update({ ownership: current }, { render: false });
  }
}

export async function ensureStashActor(folder: Folder): Promise<Actor | null> {
  const flags = getPartyFlags(folder);
  if (flags.stashActorId) {
    const existing = game.actors.get(flags.stashActorId);
    if (existing) {
      if (isGmUser()) {
        await syncStashOwnership(existing);
        await repairStashActorData(existing);
        await ensureStashActorUnfoldered(existing);
      }
      return existing;
    }
    if (!isGmUser()) {
      ui.notifications?.warn(
        game.i18n.localize(`${MODULE_ID}.sheet.stash.notInitialized`),
        { localize: false }
      );
      return null;
    }
  } else if (!isGmUser()) {
    ui.notifications?.warn(
      game.i18n.localize(`${MODULE_ID}.sheet.stash.notInitialized`),
      { localize: false }
    );
    return null;
  }

  const stashFlags: StashActorFlags = { isStash: true, partyFolderId: folder.id };
  const [actor] = await Actor.createDocuments(
    [
      {
        name: STASH_ACTOR_NAME,
        type: "NPC",
        folder: null,
        img: "icons/svg/chest.svg",
        ownership: buildStashOwnership(),
        flags: { [FLAG_SCOPE]: stashFlags },
        prototypeToken: { actorLink: true },
        system: {
          details: { level: 1 },
          actionpoints: {
            value: 1,
            encounteruse: false,
            effects: "",
            notes: "",
            custom: "",
          },
        },
      },
    ],
    { parent: null }
  ) as Actor[];

  await updatePartyFlags(folder, { stashActorId: actor.id });
  return actor;
}

/** Fix invalid system fields so dnd4e DataModel validation passes (e.g. actionpoints.value must be int). */
async function repairStashActorData(actor: Actor): Promise<void> {
  if (!isGmUser()) return;
  const ap = (actor.system as { actionpoints?: { value?: unknown } })?.actionpoints;
  const raw = ap?.value;
  if (raw === undefined || raw === null) return;
  if (Number.isInteger(raw)) return;
  const fixed = Math.max(0, Math.floor(Number(raw) || 0));
  await actor.update({ "system.actionpoints.value": fixed });
}

export function getStashActor(folder: Folder): Actor | undefined {
  const id = getPartyFlags(folder).stashActorId;
  return id ? game.actors.get(id) : undefined;
}

export async function resolvePartyContext(folderId?: string): Promise<{
  folder: Folder;
  flags: PartyFolderFlags;
  stashActor: Actor;
} | null> {
  const folder = folderId ? game.folders.get(folderId) : getPartyFolder();
  if (!folder || folder.type !== "Actor") return null;

  const stashActor = await ensureStashActor(folder);
  if (!stashActor) return null;

  const flags = getPartyFlags(folder);
  return { folder, flags, stashActor };
}
