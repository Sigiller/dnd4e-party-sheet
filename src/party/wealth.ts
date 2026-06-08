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

export function formatGp(gp: number): string {
  return gp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
