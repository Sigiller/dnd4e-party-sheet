import { FLAG_SCOPE, type PartyFolderFlags, type StashActorFlags } from "../constants.js";
import { getActorFolderId } from "./party-members.js";
import type { Actor } from "../foundry-globals.js";

export function isStashActor(actor: Actor): boolean {
  return Boolean((actor.flags?.[FLAG_SCOPE] as StashActorFlags | undefined)?.isStash);
}

/** All stash actor document ids (flags + folder metadata). */
export function getStashActorIds(): string[] {
  const ids = new Set<string>();
  for (const actor of game.actors.contents) {
    if (isStashActor(actor)) ids.add(actor.id);
  }
  for (const folder of game.folders.filter((f) => f.type === "Actor")) {
    const stashId = (folder.flags[FLAG_SCOPE] as PartyFolderFlags | undefined)?.stashActorId;
    if (stashId) ids.add(stashId);
  }
  return [...ids];
}

export function hideStashActorsInDirectory(root: HTMLElement): void {
  for (const id of getStashActorIds()) {
    const selectors = [
      `[data-entry-id="${id}"]`,
      `[data-document-id="${id}"]`,
      `.directory-item.entry[data-entry-id="${id}"]`,
    ];
    for (const sel of selectors) {
      root.querySelectorAll(sel).forEach((el) => {
        if (el instanceof HTMLElement) {
          el.hidden = true;
          el.style.display = "none";
          el.setAttribute("aria-hidden", "true");
        }
      });
    }
  }
}

/** Stash lives outside the Party folder so it is not listed among party PCs. */
export async function ensureStashActorUnfoldered(actor: Actor): Promise<void> {
  if (!game.user?.isGM) return;
  if (!isStashActor(actor)) return;
  if (getActorFolderId(actor) === null) return;
  await actor.update({ folder: null }, { render: false });
}

export async function relocateAllStashActors(): Promise<void> {
  if (!game.user?.isGM) return;
  for (const actor of game.actors.contents) {
    if (isStashActor(actor)) await ensureStashActorUnfoldered(actor);
  }
}

export function registerStashActorHooks(): void {
  Hooks.on("renderActorDirectory", (_app, html) => {
    const root =
      html instanceof HTMLElement
        ? html
        : Array.isArray(html) && html[0] instanceof HTMLElement
          ? html[0]
          : null;
    if (root) hideStashActorsInDirectory(root);
  });

  Hooks.on("preDeleteActor", (document: Actor) => {
    if (!isStashActor(document)) return;
    ui.notifications?.warn(
      game.i18n.localize("dnd4e-party-sheet.sheet.stash.deleteBlocked"),
      { localize: false }
    );
    return false;
  });
}
