import assert from "node:assert/strict";
import { describe, it } from "node:test";

const OWNER = 3;
const NONE = 0;
const PLAYER = 1;
const TRUSTED = 2;

interface MockUser {
  id: string;
  isGM: boolean;
  active: boolean;
  role: number;
}

function buildStashOwnership(users: MockUser[]): Record<string, number> {
  const ownership: Record<string, number> = { default: NONE };
  for (const user of users) {
    if (user.isGM) ownership[user.id] = OWNER;
    else if (!user.isGM && (user.role === PLAYER || user.role === TRUSTED)) {
      ownership[user.id] = OWNER;
    }
  }
  return ownership;
}

describe("buildStashOwnership", () => {
  it("grants owner to all player and trusted users, not only active ones", () => {
    const ownership = buildStashOwnership([
      { id: "gm", isGM: true, active: true, role: PLAYER },
      { id: "online", isGM: false, active: true, role: PLAYER },
      { id: "offline", isGM: false, active: false, role: PLAYER },
      { id: "trusted", isGM: false, active: false, role: TRUSTED },
      { id: "observer", isGM: false, active: true, role: 0 },
    ]);

    assert.equal(ownership.gm, OWNER);
    assert.equal(ownership.online, OWNER);
    assert.equal(ownership.offline, OWNER);
    assert.equal(ownership.trusted, OWNER);
    assert.equal(ownership.observer, undefined);
    assert.equal(ownership.default, NONE);
  });
});
