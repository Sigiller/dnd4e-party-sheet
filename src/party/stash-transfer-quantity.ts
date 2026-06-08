/** Effective stack size for transfer prompts (weapons/equipment with 0 qty count as 1). */
export function getItemStackQuantity(quantity: unknown): number {
  const raw = Number(quantity);
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.floor(raw);
}

export function shouldPromptTransferQuantity(quantity: number): boolean {
  return quantity > 1;
}

/** Returns a valid transfer count or null if invalid / cancelled. */
export function parseTransferQuantity(value: unknown, maxQuantity: number): number | null {
  const max = Math.floor(maxQuantity);
  if (max < 1) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > max) return null;
  return n;
}
