type CurrencyRecord = Record<string, number>;

export function getGpRate(coinKey: string): number {
  return CONFIG.DND4E.currencyConversion[coinKey]?.gp ?? 0;
}

export function currencyToGp(currency: CurrencyRecord): number {
  const convert = CONFIG.DND4E.currencyConversion;
  let goldSum = 0;
  for (const [type, value] of Object.entries(currency ?? {})) {
    const rate = convert[type]?.gp ?? 0;
    goldSum += (Number(value) || 0) * rate;
  }
  return Math.round(goldSum * 100) / 100;
}

export function roundGp(gp: number): number {
  return Math.round(gp * 100) / 100;
}

export function formatGp(gp: number, fixedDecimals?: number): string {
  const value =
    fixedDecimals !== undefined
      ? roundGp(gp).toFixed(fixedDecimals)
      : String(gp);
  const [intPart, fracPart] = value.split(".");
  const withSep = (intPart ?? "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fracPart !== undefined ? `${withSep}.${fracPart}` : withSep;
}

export function formatPartyTotalGp(gp: number): string {
  return formatGp(roundGp(gp));
}
