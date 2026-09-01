import { UI_ASSETS } from "../assets.js";

/** Visual tokens aligned to the Figma party-sheet redesign (navy + parchment scroll). */
export const partySheetTheme = {
  /* — Navy core (Figma "DnD 4e/Primary") — */
  colourPcHead: "#053e62",
  colourPrimary900: "#021f31",
  colourPrimary700: "#042e49",
  colourPrimary100: "#075c92",
  gradient4e: "linear-gradient(270deg, rgba(255, 255, 255, 1) 0%, rgba(221, 220, 203, 1) 100%)",
  backgroundRowOdd: "#d3d1ba",
  backgroundRowEven: "#dddcdb",
  /** Light surface for tables/cards sitting on the parchment panel */
  backgroundPanel: "#eeeee6",
  borderMuted: "#b8b5a0",
  /** Card outline (Figma Hero Overview: frame-line at 75%) */
  borderCard: "rgba(118, 105, 78, 0.75)",
  shadowCard: "0 2px 4px rgba(0, 0, 0, 0.25)",
  shadowElement: "0 2px 3px rgba(0, 0, 0, 0.12)",
  radiusPanel: "6px",
  radiusCard: "8px",
  radiusBadge: "4px",
  radiusControl: "3px",
  spacingGutter: "12px",
  spacingCardPad: "16px",
  spacingBadgeGap: "8px",
  /* — Tab frame chrome (values sampled from Figma SVG exports, not variables) — */
  /** Thin decorative line: tab inner border, divider hairlines, lozenge outline */
  colourFrameLine: "#76694e",
  /** Active tab/panel base under the damask texture */
  tabActiveBase: "#cfc3ab",
  /** Inactive (tucked-behind) tab base */
  tabInactiveBase: "#eae4db",
  /* — Member card surfaces (Figma Hero Overview 440:782) — */
  /** Translucent card wash layered over the parchment panel */
  cardSurface:
    "linear-gradient(rgba(255, 251, 245, 0.25), rgba(255, 251, 245, 0.25)), " +
    "linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5))",
  colourHpBar: "#5d0000",
  colourHpBarBorder: "#750003",
  /* — Text — */
  /** Body text on light / beige surfaces */
  colourTextInside: "#484a3d",
  /** Strong text on white panels (fox PC sheets use #221f1f) */
  colourTextOnLight: "#221f1f",
  /** Section headings on light backgrounds */
  colourHeading: "#053e62",
  /** Accent on dark headers only — too light for white panels */
  vitalsGold: "#ddc56a",
  /** Readable accent on light backgrounds (skill names, language groups) */
  colourAccentOnLight: "#6b5620",
  vitalsGoldLight: "#e8d89b",
  colourCream: "#f2ecd9",
  colourTextOnDark: "#ffffff",
  /* — Currency (Figma "DnD 4e / Currency") — */
  currencyCopper: "#8b5a2b",
  currencySilver: "#9ca3af",
  currencyGold: "#c9a227",
  currencyPlatinum: "#6b7b8c",
  currencyAstral: "#5eb8d4",
  currencyResiduum: "#9b6dd7",
  /* — Sizing — */
  portraitSize: "125px",
  hpBarHeight: "24px",
  defenseCircleSize: "44px",
  /** Figma design canvas width — reference only; layout stays fluid */
  sheetContentWidth: "751px",
  /* — Fonts (DragonHead/DragonBodySans ship with fox-4e-styling; per-glyph
     fallback sends Cyrillic through Palatino, matching the Figma spec) — */
  fontFamily: '"DragonBodySans", system-ui, sans-serif',
  fontFamilyHead: '"DragonHead", Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif',
  fontFamilyTitle: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif',
  /* — Textures — */
  textureWood: UI_ASSETS.headerWood,
  textureDamask: UI_ASSETS.tabDamask,
} as const;

export type PartySheetTheme = typeof partySheetTheme;
