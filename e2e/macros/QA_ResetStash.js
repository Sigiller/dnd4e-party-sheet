/**
 * GM-only: ensure party folder stash flag and stash actor exist (idempotent).
 */
if (!game.user?.isGM) return;

const moduleId = "dnd4e-party-sheet";
const folderName = game.settings.get(moduleId, "partyFolderName") || "Party";
const folder = game.folders.find(
  (f) => f.type === "Actor" && f.name.trim().toLowerCase() === folderName.trim().toLowerCase()
);
if (!folder) return;

const flags = folder.flags?.[moduleId] ?? {};
const stashId = flags.stashActorId;
if (stashId) {
  const stash = game.actors.get(stashId);
  if (stash) return;
}

await game.modules.get(moduleId)?.api?.openPartySheet?.();
