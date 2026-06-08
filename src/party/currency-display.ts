/** Display order left-to-right: CP → SP → GP → PP → AD, then Residuum. */
export const CURRENCY_DISPLAY_ORDER = ["cp", "sp", "gp", "pp", "ad"] as const;

export const RITUALCOMP_RS_KEY = "rs";

/** GP-value subtraction: cheapest coins first. */
export const GP_SUBTRACT_ORDER = ["cp", "sp", "gp", "pp", "ad"] as const;

export type CurrencyCoinKey = (typeof CURRENCY_DISPLAY_ORDER)[number];

export const CURRENCY_ICONS: Record<string, string> = {
  cp: "fas fa-coins",
  sp: "fas fa-coins",
  gp: "fas fa-coins",
  pp: "fas fa-coins",
  ad: "fas fa-gem",
  rs: "fas fa-sparkles",
};

export type StashCurrencyRowKind = "currency" | "ritualcomp";

export interface StashCurrencyRow {
  key: string;
  kind: StashCurrencyRowKind;
  path: string;
  label: string;
  value: number;
}
