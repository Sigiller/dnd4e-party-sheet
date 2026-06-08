import { describe, it } from "node:test";
import assert from "node:assert/strict";

const OWNER = 3;
const PLAYER = 1;
const TRUSTED = 2;
const NONE = 0;
const FLAG = "dnd4e-party-sheet";
const PC = "Player Character";

type TestActor = {
  id: string;
  type: string;
  folder: string | { id: string } | null;
  flags?: Record<string, Record<string, unknown>>;
  ownership: Record<string, number>;
};

function getActorFolderId(actor: TestActor): string | null {
  const f = actor.folder;
  if (!f) return null;
  if (typeof f === "string") return f;
  return f.id ?? null;
}

function isPartyMemberLogic(
  actor: TestActor,
  partyFolderId: string | null,
  users: { id: string; isGM: boolean; active: boolean; role: number; characterId?: string }[]
): boolean {
  if (actor.type !== PC) return false;
  if (actor.flags?.[FLAG]?.isStash) return false;
  if (partyFolderId && getActorFolderId(actor) === partyFolderId) return true;

  const isPT = (u: (typeof users)[0]) =>
    !u.isGM && u.active && (u.role === PLAYER || u.role === TRUSTED);

  for (const user of users) {
    if (!isPT(user)) continue;
    if (user.characterId === actor.id) return true;
    const level = actor.ownership[user.id];
    if (level !== undefined && level >= OWNER) return true;
  }

  const def = actor.ownership.default ?? NONE;
  if (def >= OWNER && users.some(isPT)) return true;

  return false;
}

describe("party member rules", () => {
  it("includes PC in party folder (string folder id)", () => {
    assert.equal(
      isPartyMemberLogic(
        { id: "a1", type: PC, folder: "party-f", ownership: { default: NONE } },
        "party-f",
        []
      ),
      true
    );
  });

  it("includes PC in party folder (Folder object)", () => {
    assert.equal(
      isPartyMemberLogic(
        { id: "a1", type: PC, folder: { id: "party-f" }, ownership: { default: NONE } },
        "party-f",
        []
      ),
      true
    );
  });

  it("supports multiple OWNER entries", () => {
    assert.equal(
      isPartyMemberLogic(
        {
          id: "pc",
          type: PC,
          folder: null,
          ownership: { u1: OWNER, u2: OWNER },
        },
        null,
        [
          { id: "u1", isGM: false, active: true, role: PLAYER },
          { id: "u2", isGM: false, active: true, role: TRUSTED },
        ]
      ),
      true
    );
  });

  it("excludes stash in party folder", () => {
    assert.equal(
      isPartyMemberLogic(
        {
          id: "stash",
          type: PC,
          folder: "party-f",
          ownership: { default: NONE },
          flags: { [FLAG]: { isStash: true } },
        },
        "party-f",
        []
      ),
      false
    );
  });
});
