import { localize } from "../i18n.js";
import { readRitualcomp, readStashCurrency, updateActorData } from "../types/dnd4e.js";
import { canEditStashCurrency } from "./stash-permissions.js";
import {
  logCurrencyAdded,
  logCurrencyRemoved,
  logCurrencyRemovedByGp,
} from "./stash-chat-log.js";
import {
  CURRENCY_DISPLAY_ORDER,
  GP_SUBTRACT_ORDER,
  RITUALCOMP_RS_KEY,
  type StashCurrencyRow,
} from "./currency-display.js";
import { getGpRate } from "./wealth.js";

export type CurrencyRecord = Record<string, number>;
export type CurrencyDeltas = Record<string, number>;

export function normalizeCurrencyRecord(raw: CurrencyRecord | undefined): CurrencyRecord {
  const out: CurrencyRecord = {};
  for (const key of CURRENCY_DISPLAY_ORDER) {
    out[key] = Math.max(0, Math.floor(Number(raw?.[key]) || 0));
  }
  return out;
}

export function normalizeRitualcompRecord(raw: CurrencyRecord | undefined): CurrencyRecord {
  return {
    [RITUALCOMP_RS_KEY]: Math.max(0, Math.floor(Number(raw?.[RITUALCOMP_RS_KEY]) || 0)),
  };
}

export function getCurrencyLabel(key: string): string {
  if (key === RITUALCOMP_RS_KEY) {
    return localize("DND4E.RitualCompRS");
  }
  const locKey = CONFIG.DND4E.currencies[key];
  return locKey ? localize(locKey) : key.toUpperCase();
}

export function getStashCurrencyRows(
  currency: CurrencyRecord,
  ritualcomp: CurrencyRecord
): StashCurrencyRow[] {
  const norm = normalizeCurrencyRecord(currency);
  const ritual = normalizeRitualcompRecord(ritualcomp);
  const rows: StashCurrencyRow[] = [];

  for (const key of CURRENCY_DISPLAY_ORDER) {
    rows.push({
      key,
      kind: "currency",
      path: `system.currency.${key}`,
      label: getCurrencyLabel(key),
      value: norm[key] ?? 0,
    });
  }

  rows.push({
    key: RITUALCOMP_RS_KEY,
    kind: "ritualcomp",
    path: `system.ritualcomp.${RITUALCOMP_RS_KEY}`,
    label: getCurrencyLabel(RITUALCOMP_RS_KEY),
    value: ritual[RITUALCOMP_RS_KEY] ?? 0,
  });

  return rows;
}

function parseNonNegativeInt(value: unknown): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function parseCurrencyDeltas(raw: Record<string, unknown>): CurrencyDeltas {
  const deltas: CurrencyDeltas = {};
  for (const key of [...CURRENCY_DISPLAY_ORDER, RITUALCOMP_RS_KEY]) {
    const v = parseNonNegativeInt(raw[key]);
    if (v > 0) deltas[key] = v;
  }
  return deltas;
}

export function applyAdd(
  currency: CurrencyRecord,
  ritualcomp: CurrencyRecord,
  deltas: CurrencyDeltas
): { currency: CurrencyRecord; ritualcomp: CurrencyRecord } {
  const nextCurrency = normalizeCurrencyRecord(currency);
  const nextRitual = normalizeRitualcompRecord(ritualcomp);

  for (const [key, amount] of Object.entries(deltas)) {
    const n = parseNonNegativeInt(amount);
    if (n <= 0) continue;
    if (key === RITUALCOMP_RS_KEY) {
      nextRitual[RITUALCOMP_RS_KEY] = (nextRitual[RITUALCOMP_RS_KEY] ?? 0) + n;
    } else if ((CURRENCY_DISPLAY_ORDER as readonly string[]).includes(key)) {
      nextCurrency[key] = (nextCurrency[key] ?? 0) + n;
    }
  }

  return { currency: nextCurrency, ritualcomp: nextRitual };
}

export function applySubtractExact(
  currency: CurrencyRecord,
  ritualcomp: CurrencyRecord,
  deltas: CurrencyDeltas
): { ok: true; currency: CurrencyRecord; ritualcomp: CurrencyRecord } | { ok: false } {
  const nextCurrency = normalizeCurrencyRecord(currency);
  const nextRitual = normalizeRitualcompRecord(ritualcomp);

  for (const [key, amount] of Object.entries(deltas)) {
    const n = parseNonNegativeInt(amount);
    if (n <= 0) continue;
    if (key === RITUALCOMP_RS_KEY) {
      const cur = nextRitual[RITUALCOMP_RS_KEY] ?? 0;
      if (cur < n) return { ok: false };
      nextRitual[RITUALCOMP_RS_KEY] = cur - n;
    } else if ((CURRENCY_DISPLAY_ORDER as readonly string[]).includes(key)) {
      const cur = nextCurrency[key] ?? 0;
      if (cur < n) return { ok: false };
      nextCurrency[key] = cur - n;
    }
  }

  return { ok: true, currency: nextCurrency, ritualcomp: nextRitual };
}

function coinValueInCp(key: string, getRate: (key: string) => number): number {
  const rateGp = getRate(key);
  if (rateGp <= 0) return 0;
  return Math.round(rateGp * 100);
}

export function applySubtractByGpSum(
  currency: CurrencyRecord,
  gpTotal: number,
  getRate: (key: string) => number = getGpRate
): { ok: true; currency: CurrencyRecord } | { ok: false } {
  const next = normalizeCurrencyRecord(currency);
  const targetCp = Math.max(0, Math.round(gpTotal * 100));
  if (targetCp <= 0) return { ok: true, currency: next };

  const cheapestFirst = GP_SUBTRACT_ORDER.map((key) => ({ key, cp: coinValueInCp(key, getRate) }))
    .filter((coin) => coin.cp > 0)
    .sort((a, b) => a.cp - b.cp);

  let remainingCp = targetCp;
  for (const coin of cheapestFirst) {
    if (remainingCp <= 0) break;
    const spend = Math.min(next[coin.key] ?? 0, Math.floor(remainingCp / coin.cp));
    next[coin.key] = (next[coin.key] ?? 0) - spend;
    remainingCp -= spend * coin.cp;
  }

  if (remainingCp > 0) {
    // Nothing left is small enough to pay exactly: break one bigger coin and take the change.
    const broken = cheapestFirst.find((coin) => coin.cp > remainingCp && (next[coin.key] ?? 0) > 0);
    if (!broken) return { ok: false };

    next[broken.key] = (next[broken.key] ?? 0) - 1;
    let changeCp = broken.cp - remainingCp;
    remainingCp = 0;

    for (const coin of [...cheapestFirst].reverse()) {
      const coins = Math.floor(changeCp / coin.cp);
      next[coin.key] = (next[coin.key] ?? 0) + coins;
      changeCp -= coins * coin.cp;
    }
  }

  return { ok: true, currency: next };
}

/** Per-coin dot paths so a concurrent update to a different coin is not overwritten. */
function changedCurrencyPaths(
  before: CurrencyRecord,
  after: CurrencyRecord,
  prefix: string
): Record<string, number> {
  const paths: Record<string, number> = {};
  for (const [key, value] of Object.entries(after)) {
    if (Number(before[key] ?? 0) !== value) paths[`${prefix}.${key}`] = value;
  }
  return paths;
}

async function writeStashCurrency(
  stashActor: Actor.Implementation,
  before: { currency: CurrencyRecord; ritualcomp: CurrencyRecord },
  after: { currency: CurrencyRecord; ritualcomp: CurrencyRecord }
): Promise<void> {
  const paths = {
    ...changedCurrencyPaths(before.currency, after.currency, "system.currency"),
    ...changedCurrencyPaths(before.ritualcomp, after.ritualcomp, "system.ritualcomp"),
  };
  if (Object.keys(paths).length === 0) return;
  await updateActorData(stashActor, paths);
}

export async function addStashCurrency(
  stashActor: Actor.Implementation,
  deltas: CurrencyDeltas
): Promise<void> {
  if (!canEditStashCurrency(stashActor)) return;
  const currency = readStashCurrency(stashActor);
  const ritualcomp = readRitualcomp(stashActor);
  const { currency: nextCurrency, ritualcomp: nextRitual } = applyAdd(currency, ritualcomp, deltas);
  await writeStashCurrency(
    stashActor,
    { currency, ritualcomp },
    { currency: nextCurrency, ritualcomp: nextRitual }
  );
  await logCurrencyAdded(game.user?.character ?? null, deltas);
}

export async function subtractStashCurrencyExact(
  stashActor: Actor.Implementation,
  deltas: CurrencyDeltas
): Promise<{ ok: true } | { ok: false }> {
  if (!canEditStashCurrency(stashActor)) return { ok: false };
  const currency = readStashCurrency(stashActor);
  const ritualcomp = readRitualcomp(stashActor);
  const result = applySubtractExact(currency, ritualcomp, deltas);
  if (!result.ok) return { ok: false };
  await writeStashCurrency(
    stashActor,
    { currency, ritualcomp },
    { currency: result.currency, ritualcomp: result.ritualcomp }
  );
  await logCurrencyRemoved(game.user?.character ?? null, deltas);
  return { ok: true };
}

export async function subtractStashCurrencyByGp(
  stashActor: Actor.Implementation,
  gpTotal: number
): Promise<{ ok: true } | { ok: false }> {
  if (!canEditStashCurrency(stashActor)) return { ok: false };
  const currency = readStashCurrency(stashActor);
  const ritualcomp = readRitualcomp(stashActor);
  const result = applySubtractByGpSum(currency, gpTotal);
  if (!result.ok) return { ok: false };
  await writeStashCurrency(
    stashActor,
    { currency, ritualcomp },
    { currency: result.currency, ritualcomp: normalizeRitualcompRecord(ritualcomp) }
  );
  await logCurrencyRemovedByGp(game.user?.character ?? null, gpTotal);
  return { ok: true };
}
