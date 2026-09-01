import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  BORDER_INSET,
  CONTENT_TOP,
  TAB_RAISE,
  tabBorderPath,
  tabPanelPath,
  tabUnderline,
} from "../src/app/components/chrome/tabFrameGeometry.js";

/** Parse every coordinate pair-ish number out of a path string. */
function numbersOf(d: string): number[] {
  return (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
}

/**
 * Reference values from the Figma SVG exports (node 440:769, design canvas
 * 752×1690 after removing the export's shadow padding).
 */
const W = 752;
const H = 1690;

describe("tabPanelPath", () => {
  it("matches the Figma export at the design size (right tongue)", () => {
    const d = tabPanelPath(W, H, "right");
    // Figma: M762 1704H10V45H376.487C398.516 45 407.528 36 407.528 14
    //        H730.896C730.896 36 739.909 45 762 45V1704Z  (shifted by -10,-14)
    const expected = [
      752, 1690, 0, 31, 366.49, 388.53, 31, 397.53, 22, 397.53, 0, 720.9, 720.9, 22, 729.91, 31,
      752, 31, 1690,
    ];
    const actual = numbersOf(d);
    assert.equal(actual.length, expected.length, d);
    for (let i = 0; i < expected.length; i++) {
      const a = actual[i] ?? Number.NaN;
      const e = expected[i] ?? Number.NaN;
      assert.ok(Math.abs(a - e) <= 0.1, `n[${i}] ${a} vs ${e} in ${d}`);
    }
  });

  it("left tongue mirrors the right tongue", () => {
    const right = numbersOf(tabPanelPath(W, H, "right"));
    const left = numbersOf(tabPanelPath(W, H, "left"));
    // Corresponding x coordinates mirror around W/2; spot-check the cove start.
    assert.ok(left.includes(W / 2 + 9.51));
    assert.ok(right.includes(W / 2 - 9.51));
    assert.equal(left.length, right.length);
  });

  it("translates with width and height without scaling corners", () => {
    const d = tabPanelPath(1000, 500, "right");
    const n = numbersOf(d);
    // Tongue rise stays 31px, merge curve stays 31.1px from the right edge.
    assert.ok(n.includes(31));
    assert.ok(n.includes(1000 - 31.1));
    assert.ok(n.includes(500));
  });
});

describe("tabBorderPath", () => {
  it("matches the Figma TabBorder export at the design size", () => {
    const d = tabBorderPath(W, H, "right");
    const n = numbersOf(d);
    // Figma border (shifted +3.004,+3): right corner ends at (748.5, 34.5),
    // cove exits at (401.03, 3.5), top-right run starts at 717.5.
    for (const expected of [717.5, 3.5, 748.5, 34.5, 369.49, 401.03]) {
      assert.ok(
        n.some((v) => Math.abs(v - expected) <= 0.1),
        `expected ${expected} in ${d}`,
      );
    }
  });

  it("hugs the runtime panel bottom", () => {
    const d = tabBorderPath(W, 900, "left");
    assert.ok(numbersOf(d).includes(900 - 3.5), d);
  });
});

describe("tabUnderline", () => {
  it("caps at the design width and centres on the tongue half", () => {
    const u = tabUnderline(W, "right");
    assert.equal(u.width, 258);
    assert.ok(Math.abs(u.x + u.width / 2 - W * 0.75) < 0.5);
  });

  it("shrinks on narrow panels", () => {
    const u = tabUnderline(600, "left");
    assert.ok(u.width < 258);
    assert.ok(Math.abs(u.x + u.width / 2 - 150) < 0.5);
  });
});

describe("constants", () => {
  it("keep the designed relationships", () => {
    assert.equal(TAB_RAISE, 31);
    assert.ok(CONTENT_TOP > TAB_RAISE);
    assert.equal(BORDER_INSET, 3);
  });
});
