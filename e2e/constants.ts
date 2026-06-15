/** dnd4e PC actor type (matches src/types/dnd4e.ts). */
export const PC_TYPE = "Player Character";

export function isPlayerCharacterType(type: string): boolean {
  return String(type) === PC_TYPE;
}
