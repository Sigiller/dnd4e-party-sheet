import assert from "node:assert/strict";
import { describe, it } from "node:test";

const OWNER = 3;
const LIMITED = 2;
const PLAYER = 1;

interface MockUser {
  id: string;
  active: boolean;
  isGM: boolean;
  role: number;
}

interface MockActor {
  ownership: Record<string, number>;
  testUserPermission: (user: MockUser, level: number) => boolean;
}

function mockActor(ownership: Record<string, number>): MockActor {
  return {
    ownership,
    testUserPermission(user, level) {
      const direct = this.ownership[user.id];
      if (direct !== undefined) return direct >= level;
      return (this.ownership.default ?? 0) >= level;
    },
  };
}

function evaluateCurrencyAccess(
  user: MockUser | null,
  actor: MockActor,
  allowPlayers: boolean
): boolean {
  if (!user) return false;
  if (user.isGM) return true;
  if (!allowPlayers) return false;
  if (!user.active || user.isGM) return false;
  if (user.role !== PLAYER) return false;
  return actor.testUserPermission(user, OWNER);
}

describe("stash currency permissions", () => {
  const player: MockUser = { id: "u1", active: true, isGM: false, role: PLAYER };
  const gm: MockUser = { id: "gm", active: true, isGM: true, role: PLAYER };

  it("allows GM regardless of player currency setting", () => {
    const stash = mockActor({ default: 0, u1: LIMITED });
    assert.equal(evaluateCurrencyAccess(gm, stash, false), true);
    assert.equal(evaluateCurrencyAccess(gm, stash, true), true);
  });

  it("allows players with owner stash when setting is enabled", () => {
    const owned = mockActor({ default: 0, u1: OWNER });
    assert.equal(evaluateCurrencyAccess(player, owned, true), true);
  });

  it("blocks players when player currency setting is disabled", () => {
    const owned = mockActor({ default: 0, u1: OWNER });
    assert.equal(evaluateCurrencyAccess(player, owned, false), false);
  });

  it("blocks players with only limited stash ownership", () => {
    const limited = mockActor({ default: 0, u1: LIMITED });
    assert.equal(evaluateCurrencyAccess(player, limited, true), false);
  });

  it("blocks players without stash ownership", () => {
    const locked = mockActor({ default: 0 });
    assert.equal(evaluateCurrencyAccess(player, locked, true), false);
  });
});
