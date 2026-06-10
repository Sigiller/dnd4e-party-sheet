import {
  FLAG_SCOPE,
  MODULE_ID,
  STASH_ACTOR_NAME,
  type PartyFolderFlags,
  type StashActorFlags,
} from "../constants.js";
import { localize } from "../i18n.js";
import {
  createActorDocuments,
  getGameActors,
  updateActorData,
} from "../types/dnd4e.js";
import { getPartyFolderName } from "../settings.js";
import { ensureStashActorUnfoldered } from "./stash-actor.js";
import { buildStashOwnership, syncStashActorOwnership } from "./stash-ownership.js";

function isGmUser(): boolean {
  return Boolean(game.user?.isGM);
}

export function getPartyFolder(): Folder.Implementation | undefined {
  const name = getPartyFolderName().trim().toLowerCase();
  if (!name) return undefined;
  return game.folders?.find(
    (f) => f.type === "Actor" && f.name.trim().toLowerCase() === name
  );
}

export function getPartyFlags(folder: Folder.Implementation): PartyFolderFlags {
  return (folder.flags[FLAG_SCOPE] ?? {}) as PartyFolderFlags;
}

export async function updatePartyFlags(
  folder: Folder.Implementation,
  patch: Partial<PartyFolderFlags>
): Promise<PartyFolderFlags> {
  const current = getPartyFlags(folder);
  const next = { ...current, ...patch };
  await folder.update({
    [`flags.${FLAG_SCOPE}`]: next,
  } as Parameters<Folder.Implementation["update"]>[0]);
  return next;
}

export async function ensureStashActor(
  folder: Folder.Implementation
): Promise<Actor.Implementation | null> {
  const flags = getPartyFlags(folder);
  if (flags.stashActorId) {
    const existing = getGameActors()?.get(flags.stashActorId);
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
        localize(`${MODULE_ID}.sheet.stash.notInitialized`),
        { localize: false }
      );
      return null;
    }
  } else if (!isGmUser()) {
    ui.notifications?.warn(
      localize(`${MODULE_ID}.sheet.stash.notInitialized`),
      { localize: false }
    );
    return null;
  }

  const stashFlags: StashActorFlags = { isStash: true, partyFolderId: folder.id ?? undefined };
  const created = await createActorDocuments(
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
  );

  const actor = created[0];
  if (!actor) return null;

  await updatePartyFlags(folder, { stashActorId: actor.id ?? undefined });
  return actor;
}

/** Fix invalid system fields so dnd4e DataModel validation passes (e.g. actionpoints.value must be int). */
async function repairStashActorData(actor: Actor.Implementation): Promise<void> {
  if (!isGmUser()) return;
  const ap = (actor.system as { actionpoints?: { value?: unknown } })?.actionpoints;
  const raw = ap?.value;
  if (raw === undefined || raw === null) return;
  if (Number.isInteger(raw)) return;
  const fixed = Math.max(0, Math.floor(Number(raw) || 0));
  await updateActorData(actor, { "system.actionpoints.value": fixed });
}

export function getStashActor(
  folder: Folder.Implementation
): Actor.Implementation | undefined {
  const id = getPartyFlags(folder).stashActorId;
  return id ? getGameActors()?.get(id) : undefined;
}

export async function syncPartyStashOwnership(): Promise<void> {
  if (!game.user?.isGM) return;

  const folder = getPartyFolder();
  if (!folder) return;

  const stash = getStashActor(folder);
  if (stash) await syncStashActorOwnership(stash);
}

export async function resolvePartyContext(folderId?: string): Promise<{
  folder: Folder.Implementation;
  flags: PartyFolderFlags;
  stashActor: Actor.Implementation;
} | null> {
  const folder = folderId ? game.folders?.get(folderId) : getPartyFolder();
  if (folder?.type !== "Actor") return null;

  const stashActor = await ensureStashActor(folder);
  if (!stashActor) return null;

  const flags = getPartyFlags(folder);
  return { folder, flags, stashActor };
}
