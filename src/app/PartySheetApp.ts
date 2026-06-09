import { MODULE_ID } from "../constants.js";
import { getPartyFlags, resolvePartyContext, updatePartyFlags } from "../party/party-store.js";
import { buildPartySnapshot } from "../party/party-data.js";
import { prepareInventorySections, computeStashLoad } from "../party/inventory-prep.js";
import { currencyToGp, roundGp } from "../party/wealth.js";
import { getPartyFolderName } from "../settings.js";
import { canEditStash, canEditStashCurrency } from "../party/stash-permissions.js";
import { mountPartySheet, unmountPartySheet } from "./mount.js";
import type { PartySheetProps } from "./PartySheetRoot.js";

const { ApplicationV2 } = foundry.applications.api;

let activeSheet: PartySheetApp | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

export class PartySheetApp extends ApplicationV2 {
  folderId: string;
  #props: PartySheetProps | null = null;
  #pendingProps: PartySheetProps | null = null;

  constructor(folderId: string) {
    super();
    this.folderId = folderId;
  }

  static DEFAULT_OPTIONS = {
    id: "dnd4e-party-sheet-app",
    classes: ["dnd4e-party-sheet", "sheet", "fox4e", "dnd4e"],
    tag: "div",
    window: {
      title: `${MODULE_ID}.sheet.title`,
      icon: "fas fa-users",
      resizable: true,
    },
    position: {
      width: 920,
      height: 720,
    },
    scrollY: [".party-overview-tab", ".party-stash-tab"],
  };

  get title(): string {
    const flags = this.#props?.flags;
    return flags?.displayName || game.i18n.localize(`${MODULE_ID}.sheet.title`);
  }

  async _prepareContext(): Promise<PartySheetProps> {
    const ctx = await resolvePartyContext(this.folderId);
    if (!ctx) throw new Error("Party folder not found");

    const snapshot = await buildPartySnapshot(ctx.folder.id);
    const inventory = await prepareInventorySections(ctx.stashActor);
    const stashLoad = computeStashLoad(ctx.stashActor);
    const stashGp = currencyToGp((ctx.stashActor.system?.currency as Record<string, number>) ?? {});
    const membersGp = snapshot.members.reduce((s, m) => s + m.gp, 0);
    const partyTotalGp = roundGp(membersGp + stashGp);

    const props: PartySheetProps = {
      folderId: ctx.folder.id,
      flags: getPartyFlags(ctx.folder),
      stashActorId: ctx.stashActor.id,
      canEdit: canEditStash(ctx.stashActor),
      canEditCurrency: canEditStashCurrency(ctx.stashActor),
      snapshot,
      stash: {
        sections: inventory,
        load: stashLoad,
        gp: stashGp,
        partyTotalGp,
        currency: (ctx.stashActor.system?.currency ?? {}) as Record<string, number>,
        ritualcomp: (ctx.stashActor.system?.ritualcomp ?? {}) as Record<string, number>,
        actor: ctx.stashActor,
      },
      onUpdateFlags: async (patch) => {
        await updatePartyFlags(ctx.folder, patch);
        await this.refreshData();
      },
      onRefresh: () => this.refreshData(),
    };

    this.#props = props;
    return props;
  }

  async _renderHTML(_context: PartySheetProps, _options: unknown): Promise<HTMLElement> {
    const root = document.createElement("div");
    root.className = "party-sheet-react-root";
    return root;
  }

  async _replaceHTML(result: HTMLElement, content: HTMLElement, _options: unknown): Promise<void> {
    const existing = content.querySelector(":scope > .party-sheet-react-root");
    if (existing instanceof HTMLElement) return;
    content.replaceChildren(result);
  }

  /** Re-render React tree only — keeps tab/UI state, does not replace the DOM host. */
  async refreshData(): Promise<void> {
    if (!this.rendered) return;
    const props = await this._prepareContext({});
    this.#props = props;
    const root = this.element?.querySelector(".party-sheet-react-root");
    if (root instanceof HTMLElement) {
      mountPartySheet(root, props);
    }
    this.#updateWindowTitle();
  }

  #updateWindowTitle(): void {
    const title = this.title;
    const el = this.element?.querySelector(".window-header .window-title");
    if (el) el.textContent = title;
  }

  async render(force = false, options: Record<string, unknown> = {}): Promise<this> {
    if (!game.system || game.system.id !== "dnd4e") return this;
    if (this.rendered && !force) {
      await this.refreshData();
      return this;
    }
    this.#pendingProps = await this._prepareContext(options);
    return super.render(force, options);
  }

  async _onRender(context: PartySheetProps, options: unknown): Promise<void> {
    await super._onRender(context, options);
    const props =
      this.#pendingProps ??
      (context?.snapshot?.members ? context : await this._prepareContext({}));
    this.#pendingProps = null;
    const root = this.element?.querySelector(".party-sheet-react-root");
    if (root instanceof HTMLElement) {
      mountPartySheet(root, props);
    }
  }

  async _onClose(options: unknown): Promise<void> {
    unmountPartySheet();
    if (activeSheet === this) activeSheet = null;
    await super._onClose(options);
  }

}

export async function openPartySheet(folderId?: string): Promise<void> {
  const ctx = await resolvePartyContext(folderId);
  if (!ctx) {
    ui.notifications?.warn(
      game.i18n.format(`${MODULE_ID}.sheet.noPartyFolder`, {
        name: getPartyFolderName(),
      })
    );
    return;
  }

  if (activeSheet?.folderId === ctx.folder.id && activeSheet.rendered) {
    activeSheet.bringToFront();
    return;
  }

  if (activeSheet) await activeSheet.close();

  activeSheet = new PartySheetApp(ctx.folder.id);
  await activeSheet.render(true);
}

export function schedulePartySheetRefresh(): void {
  if (!activeSheet?.rendered) return;
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    refreshTimer = null;
    void activeSheet?.refreshData();
  }, 150);
}
