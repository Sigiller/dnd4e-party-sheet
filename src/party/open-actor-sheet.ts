import { getGameActors } from "../types/dnd4e.js";

export interface OpenActorSheetOptions {
  tab?: string;
  tabGroup?: string;
}

export interface ActorSheetRenderOptions {
  force?: boolean;
  tab?: string | Record<string, string>;
}

/** Default inventory tab for base dnd4e ActorSheet4e (group "sheet"). Fox4eSheet uses "primary". */
export const DND4E_ACTOR_INVENTORY_TAB: OpenActorSheetOptions = {
  tab: "inventory",
  tabGroup: "sheet",
};

type SheetTabsConfig = Record<string, { tabs?: { id: string }[] }>;

export interface SheetLike {
  rendered: boolean;
  render: (options?: ActorSheetRenderOptions | boolean) => Promise<void>;
  bringToFront?: () => void;
  changeTab?: (tab: string, group: string, options?: { force?: boolean }) => void;
  tabGroups?: Record<string, string>;
  element?: HTMLElement | { querySelector: (selector: string) => Element | null };
  document?: { id?: string };
}

/** Resolve the tab group that contains inventory for the active actor sheet class. */
export function resolveInventoryTabGroup(sheet: SheetLike): string {
  const tabsConfig = (sheet as { constructor?: { TABS?: SheetTabsConfig } }).constructor?.TABS;
  if (tabsConfig) {
    for (const [groupName, groupConfig] of Object.entries(tabsConfig)) {
      if (groupConfig.tabs?.some((entry) => entry.id === "inventory")) {
        return groupName;
      }
    }
  }
  return DND4E_ACTOR_INVENTORY_TAB.tabGroup ?? "sheet";
}

function resolveActorSheetTab(
  sheet: SheetLike,
  options?: OpenActorSheetOptions
): { tab?: string; group: string } {
  const tab = options?.tab;
  let group = options?.tabGroup ?? "sheet";
  if (tab === "inventory") {
    group = resolveInventoryTabGroup(sheet);
  }
  return { tab, group };
}

const pendingActorSheetTabs = new Map<string, { tab: string; group: string }>();

export function queueActorSheetTab(actorId: string, tab: string, group: string): void {
  pendingActorSheetTabs.set(actorId, { tab, group });
}

export function clearActorSheetTab(actorId: string): void {
  pendingActorSheetTabs.delete(actorId);
}

function getSheetRoot(sheet: SheetLike): { querySelector: (selector: string) => Element | null } | undefined {
  const element = sheet.element;
  if (element && typeof element.querySelector === "function") {
    return element;
  }
  return undefined;
}

export function isActorSheetTabActive(
  sheet: SheetLike,
  tab: string,
  group: string
): boolean {
  const root = getSheetRoot(sheet);
  if (!root) return false;
  const panel = root.querySelector(
    `.tab[data-group="${group}"][data-tab="${tab}"]`
  );
  return panel?.classList.contains("active") ?? false;
}

function clickSheetTabNav(sheet: SheetLike, tab: string, group: string): boolean {
  const root = getSheetRoot(sheet);
  if (!root) return false;

  const selectors = [
    `[data-action="tab"][data-group="${group}"][data-tab="${tab}"]`,
    `.tabs [data-group="${group}"][data-tab="${tab}"]`,
    `nav.tabs [data-tab="${tab}"]`,
  ];

  for (const selector of selectors) {
    const element = root.querySelector(selector);
    if (element instanceof HTMLElement) {
      element.click();
      return true;
    }
  }

  return false;
}

export function activateActorSheetTab(
  sheet: SheetLike,
  tab: string,
  group: string
): void {
  if (sheet.tabGroups) {
    sheet.tabGroups[group] = tab;
  }

  if (typeof sheet.changeTab === "function") {
    sheet.changeTab(tab, group, { force: true });
  }

  if (!isActorSheetTabActive(sheet, tab, group)) {
    clickSheetTabNav(sheet, tab, group);
  }
}

function scheduleActorSheetTabActivation(
  sheet: SheetLike,
  actorId: string,
  tab: string,
  group: string
): void {
  const attempt = () => {
    activateActorSheetTab(sheet, tab, group);
    if (isActorSheetTabActive(sheet, tab, group)) {
      clearActorSheetTab(actorId);
    }
  };

  const defer =
    typeof requestAnimationFrame === "function"
      ? requestAnimationFrame.bind(globalThis)
      : (callback: FrameRequestCallback) => setTimeout(() => callback(0), 0);

  defer(() => {
    attempt();
    if (!pendingActorSheetTabs.has(actorId)) return;
    defer(() => {
      attempt();
      if (!pendingActorSheetTabs.has(actorId)) return;
      setTimeout(attempt, 0);
    });
  });
}

export function applyPendingActorSheetTab(sheet: SheetLike): void {
  const actorId = sheet.document?.id;
  if (!actorId) return;

  const pending = pendingActorSheetTabs.get(actorId);
  if (!pending) return;

  scheduleActorSheetTabActivation(sheet, actorId, pending.tab, pending.group);
}

export function registerActorSheetTabHook(): void {
  const onRenderActorSheet = (app: unknown) => {
    applyPendingActorSheetTab(app as SheetLike);
  };

  Hooks.on("renderActorSheetV2", onRenderActorSheet);
  Hooks.on("renderActorSheet", onRenderActorSheet as never);
}

export async function openActorSheet(
  actorId: string,
  options?: OpenActorSheetOptions
): Promise<void> {
  const actor = getGameActors()?.get(actorId);
  if (!actor?.sheet) return;

  const sheet = actor.sheet as unknown as SheetLike;
  const { tab, group } = resolveActorSheetTab(sheet, options);

  if (tab) {
    queueActorSheetTab(actorId, tab, group);
    if (sheet.tabGroups) {
      sheet.tabGroups[group] = tab;
    }
  }

  if (sheet.rendered) {
    sheet.bringToFront?.();
    if (tab) {
      scheduleActorSheetTabActivation(sheet, actorId, tab, group);
    }
    return;
  }

  const renderOptions: ActorSheetRenderOptions = { force: true };
  if (tab) {
    renderOptions.tab = { [group]: tab };
  }

  await sheet.render(renderOptions);

  if (tab) {
    scheduleActorSheetTabActivation(sheet, actorId, tab, group);
  }
}

export async function openActorInventorySheet(actorId: string): Promise<void> {
  return openActorSheet(actorId, DND4E_ACTOR_INVENTORY_TAB);
}
