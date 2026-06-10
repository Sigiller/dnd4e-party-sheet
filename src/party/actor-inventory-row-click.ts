/**
 * Fox4e inventory rows only put data-action="itemSummary" on the name column.
 * Clicks on other header cells should still toggle the summary (base dnd4e puts
 * the image inside the same rollable target).
 */
export function registerActorInventoryRowClickHook(): void {
  const onInventoryClick = (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("a, input, textarea, select, .item-controls, .item-image")) return;
    if (target.closest('[data-action="itemSummary"]')) return;

    const header = target.closest(".item-list.gear .item-header");
    if (!header) return;

    header.querySelector<HTMLElement>('[data-action="itemSummary"]')?.click();
  };

  const bindInventoryClick = (app: unknown) => {
    const host = (app as { element?: HTMLElement }).element;
    if (!host || host.dataset.partySheetInventoryClick === "1") return;
    host.dataset.partySheetInventoryClick = "1";
    host.addEventListener("click", onInventoryClick);
  };

  Hooks.on("renderActorSheetV2", bindInventoryClick);
  Hooks.on("renderActorSheet", bindInventoryClick as never);
}
