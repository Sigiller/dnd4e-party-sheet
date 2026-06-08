import {
  FLAG_SCOPE,
  MODULE_ID,
  STASH_ACTOR_NAME,
  type PartyFolderFlags,
  type StashActorFlags,
} from "../constants.js";
import { getPartyFolderName } from "../settings.js";
import { ensureStashActorUnfoldered } from "./stash-actor.js";
import { buildStashOwnership, syncStashActorOwnership } from "./stash-ownership.js";
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

export async function ensureStashActor(folder: Folder): Promise<Actor | null> {
  const flags = getPartyFlags(folder);
  if (flags.stashActorId) {
    const existing = game.actors.get(flags.stashActorId);
    if (existing) {
      if (isGmUser()) {
        await syncStashActorOwnership(existing);
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

export async function syncPartyStashOwnership(): Promise<void> {
  if (!game.user?.isGM) return;

  const folder = getPartyFolder();
  if (!folder) return;

  const stash = getStashActor(folder);
  if (stash) await syncStashActorOwnership(stash);
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
