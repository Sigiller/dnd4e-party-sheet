import { describe, it } from "node:test";
import assert from "node:assert/strict";

/** Minimal mock of collectLanguages logic for unit tests. */
function collectLanguagesMock(
  actors: { name: string; languages: { value?: string[]; custom?: string } }[],
  config: Record<string, string>,
  _kind: "spoken" | "script"
): { key: string; label: string; owners: string[] }[] {
  const map = new Map<string, { label: string; owners: Set<string> }>();

  const add = (mapKey: string, label: string, owner: string) => {
    let entry = map.get(mapKey);
    if (!entry) {
      entry = { label, owners: new Set() };
      map.set(mapKey, entry);
    }
    entry.owners.add(owner);
  };

  for (const actor of actors) {
    const trait = actor.languages;
    for (const key of trait.value ?? []) {
      add(key, config[key] ?? key, actor.name);
    }
    for (const custom of (trait.custom ?? "")
      .split(";")
      .map((p) => p.trim())
      .filter(Boolean)) {
      add(`custom:${custom.toLowerCase()}`, custom, actor.name);
    }
  }

  return [...map.entries()]
    .map(([key, { label, owners }]) => {
      const ownerList = [...owners].sort();
      const count = ownerList.length;
      return {
        key,
        label: count > 1 ? `${label} (${count})` : label,
        owners: ownerList,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

describe("party languages aggregation", () => {
  const config = { common: "Common", elvish: "Elvish" };

  it("includes custom languages from semicolon-separated field", () => {
    const result = collectLanguagesMock(
      [{ name: "Alice", languages: { value: ["common"], custom: "Deep Speech; Undercommon" } }],
      config,
      "spoken"
    );
    assert.ok(result.some((e) => e.label === "Deep Speech"));
    assert.ok(result.some((e) => e.label === "Undercommon"));
  });

  it("shows member count when multiple PCs share a language", () => {
    const result = collectLanguagesMock(
      [
        { name: "Alice", languages: { value: ["common"] } },
        { name: "Bob", languages: { value: ["common"] } },
      ],
      config,
      "spoken"
    );
    const common = result.find((e) => e.key === "common");
    assert.equal(common?.label, "Common (2)");
    assert.deepEqual(common?.owners, ["Alice", "Bob"]);
  });

  it("merges duplicate custom language names case-insensitively", () => {
    const result = collectLanguagesMock(
      [
        { name: "Alice", languages: { custom: "Giant" } },
        { name: "Bob", languages: { custom: "giant" } },
      ],
      config,
      "spoken"
    );
    assert.equal(result.length, 1);
    assert.equal(result[0]?.label, "Giant (2)");
  });
});
