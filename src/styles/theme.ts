export const partySheetTheme = {
  colourPcHead: "#193d5e",
  gradient4e: "linear-gradient(270deg, rgba(255, 255, 255, 1) 0%, rgba(221, 220, 203, 1) 100%)",
  backgroundRowOdd: "#d3d1ba",
  backgroundRowEven: "#dddcdb",
  /** Warm white content panels and cards */
  backgroundPanel: "#fafaf7",
  borderMuted: "#b8b5a0",
  shadowCard: "0 2px 8px rgba(0, 0, 0, 0.08)",
  radiusPanel: "6px",
  radiusCard: "8px",
  radiusBadge: "4px",
  radiusControl: "3px",
  spacingGutter: "12px",
  spacingCardPad: "16px",
  spacingBadgeGap: "8px",
  /** Body text on light / beige surfaces */
  colourTextInside: "#484a3d",
  /** Strong text on white panels (fox PC sheets use #221f1f) */
  colourTextOnLight: "#221f1f",
  /** Section headings on light backgrounds */
  colourHeading: "#193d5e",
  /** Accent on dark headers only — too light for white panels */
  vitalsGold: "#d9c676",
  /** Readable accent on light backgrounds (skill names, language groups) */
  colourAccentOnLight: "#6b5620",
  vitalsGoldLight: "#e5d7a0",
  colourTextOnDark: "#ffffff",
  fontFamily: '"DragonBodySans", system-ui, sans-serif',
} as const;

export type PartySheetTheme = typeof partySheetTheme;
