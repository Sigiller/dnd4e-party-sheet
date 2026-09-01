/**
 * Path generators for the scroll-panel tab chrome.
 *
 * The shapes reproduce the Figma exports of node 440:769/759 exactly at the
 * 751/752px design width; for other sizes the straight edges translate while
 * every corner keeps its designed fixed-size cubics (never scaled — scaling
 * would distort the arcs).
 *
 * Panel coordinate space: y=0 is the top of the raised tongue; the body top
 * edge sits at y=TAB_RAISE; the panel spans the full measured width/height.
 */

export type TabSide = "left" | "right";

/** Tongue rises this many px above the body top edge. */
export const TAB_RAISE = 31;
/** Content (scroll region) starts this far below the tongue top. */
export const CONTENT_TOP = 45;
/** Decorative inner border inset from the panel edge. */
export const BORDER_INSET = 3;
/** Upward drop shadow of the active panel (needs headroom above the tongue). */
export const ACTIVE_SHADOW = "drop-shadow(0 -4px 5px rgba(0, 0, 0, 0.65))";
export const INACTIVE_SHADOW = "drop-shadow(0 -2px 2.5px rgba(0, 0, 0, 0.65))";

const r2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Panel silhouette: body rectangle whose top edge steps up TAB_RAISE px over
 * the `side` half. Cove fillet at the step (Figma: 366.5→397.5 of 752) and a
 * convex merge into the outer corner (720.9→752).
 */
export function tabPanelPath(w: number, h: number, side: TabSide): string {
  const m = w / 2;
  if (side === "right") {
    return (
      `M${w} ${h}H0V31H${r2(m - 9.51)}` +
      `C${r2(m + 12.53)} 31 ${r2(m + 21.53)} 22 ${r2(m + 21.53)} 0` +
      `H${r2(w - 31.1)}` +
      `C${r2(w - 31.1)} 22 ${r2(w - 22.09)} 31 ${w} 31V${h}Z`
    );
  }
  return (
    `M0 ${h}H${w}V31H${r2(m + 9.51)}` +
    `C${r2(m - 12.53)} 31 ${r2(m - 21.53)} 22 ${r2(m - 21.53)} 0` +
    `H31.1` +
    `C31.1 22 22.09 31 0 31V${h}Z`
  );
}

/**
 * 1px decorative border following the panel contour inset by BORDER_INSET,
 * with the smaller ~8px corner cubics from the Figma TabBorder export.
 * Runs on half-pixel offsets for crisp hairline rendering.
 */
export function tabBorderPath(w: number, h: number, side: TabSide): string {
  const m = w / 2;
  const b = h - 3.5;
  if (side === "right") {
    return (
      `M${r2(w - 34.5)} 3.5` +
      `C${r2(w - 34.42)} 13.82 ${r2(w - 31.94)} 21.56 ${r2(w - 26.76)} 26.73` +
      `C${r2(w - 21.58)} 31.9 ${r2(w - 13.84)} 34.42 ${r2(w - 3.5)} 34.5` +
      `V${b}H3.5V34.5H${r2(m - 6.51)}` +
      `C${r2(m + 4.08)} 34.5 ${r2(m + 11.99)} 31.98 ${r2(m + 17.25)} 26.73` +
      `C${r2(m + 22.43)} 21.56 ${r2(m + 24.95)} 13.82 ${r2(m + 25.03)} 3.5` +
      `Z`
    );
  }
  return (
    `M34.5 3.5` +
    `C34.42 13.82 31.94 21.56 26.76 26.73` +
    `C21.58 31.9 13.84 34.42 3.5 34.5` +
    `V${b}H${r2(w - 3.5)}V34.5H${r2(m + 6.51)}` +
    `C${r2(m - 4.08)} 34.5 ${r2(m - 11.99)} 31.98 ${r2(m - 17.25)} 26.73` +
    `C${r2(m - 22.43)} 21.56 ${r2(m - 24.95)} 13.82 ${r2(m - 25.03)} 3.5` +
    `Z`
  );
}

/** Fading hairline under the active tab label (Figma: 258px, y≈35). */
export function tabUnderline(w: number, side: TabSide): { x: number; y: number; width: number } {
  const half = w / 2;
  const width = Math.min(258, half * 0.69);
  const cx = side === "right" ? w * 0.75 : w * 0.25;
  return { x: r2(cx - width / 2), y: 35, width: r2(width) };
}
