import { MODULE_ID } from "../constants.js";
import { getPartyFlags, resolvePartyContext, updatePartyFlags } from "../party/party-store.js";
import { buildPartySnapshot } from "../party/party-data.js";
import { prepareInventorySections, computeStashLoad } from "../party/inventory-prep.js";
import { currencyToGp, roundGp } from "../party/wealth.js";
import { getPartyFolderName } from "../settings.js";
import { canEditStash, canEditStashCurrency } from "../party/stash-permissions.js";
import { readRitualcomp, readStashCurrency, requireActorId } from "../types/dnd4e.js";
import { formatMessage, localize } from "../i18n.js";
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

  static override DEFAULT_OPTIONS = {
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
    return flags?.displayName || localize(`${MODULE_ID}.sheet.title`);
  }

  async #buildProps(): Promise<PartySheetProps> {
    const ctx = await resolvePartyContext(this.folderId);
    if (!ctx) throw new Error("Party folder not found");

    const snapshot = await buildPartySnapshot(ctx.folder.id ?? this.folderId);
    const inventory = await prepareInventorySections(ctx.stashActor);
    const stashLoad = computeStashLoad(ctx.stashActor);
    const stashGp = currencyToGp(readStashCurrency(ctx.stashActor));
    const membersGp = snapshot.members.reduce((s, m) => s + m.gp, 0);
    const partyTotalGp = roundGp(membersGp + stashGp);
    const stashActorId = requireActorId(ctx.stashActor);

    const props: PartySheetProps = {
      folderId: ctx.folder.id ?? this.folderId,
      flags: getPartyFlags(ctx.folder),
      stashActorId,
      canEdit: canEditStash(ctx.stashActor),
      canEditCurrency: canEditStashCurrency(ctx.stashActor),
      snapshot,
      stash: {
        sections: inventory,
        load: stashLoad,
        gp: stashGp,
        partyTotalGp,
        currency: readStashCurrency(ctx.stashActor),
        ritualcomp: readRitualcomp(ctx.stashActor),
        actor: { id: stashActorId },
      },
      onUpdateFlags: async (patch) => {
        await updatePartyFlags(ctx.folder, patch);
        await this.refreshData();
      },
      onRefresh: () => {
        void this.refreshData();
      },
    };

    this.#props = props;
    return props;
  }

  protected override async _prepareContext(): Promise<object> {
    return this.#buildProps();
  }

  protected override async _renderHTML(_context: object, _options: unknown): Promise<HTMLElement> {
    const root = document.createElement("div");
    root.className = "party-sheet-react-root";
    return root;
  }

  protected override async _replaceHTML(
    result: HTMLElement,
    content: HTMLElement,
    _options: unknown
  ): Promise<void> {
    const existing = content.querySelector(":scope > .party-sheet-react-root");
    if (existing instanceof HTMLElement) return;
    content.replaceChildren(result);
  }

  /** Re-render React tree only — keeps tab/UI state, does not replace the DOM host. */
  async refreshData(): Promise<void> {
    if (!this.rendered) return;
    const props = await this.#buildProps();
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

  // @ts-expect-error PartySheetApp uses force refresh semantics via options.force.
  override async render(options?: { force?: boolean }): Promise<this> {
    if (game.system?.id !== "dnd4e") return this;
    const force = options?.force ?? false;
    if (this.rendered && !force) {
      await this.refreshData();
      return this;
    }
    this.#pendingProps = await this.#buildProps();
    return super.render(options);
  }

  protected override async _onRender(_context: object, options: unknown): Promise<void> {
    // @ts-expect-error ApplicationV2._onRender accepts DeepPartial render options at runtime.
    await super._onRender(_context, options);
    const props =
      this.#pendingProps ??
      (this.#props ?? (await this.#buildProps()));
    this.#pendingProps = null;
    const root = this.element?.querySelector(".party-sheet-react-root");
    if (root instanceof HTMLElement) {
      mountPartySheet(root, props);
    }
  }

  protected override async _onClose(options: unknown): Promise<void> {
    unmountPartySheet();
    if (activeSheet === this) activeSheet = null;
    // @ts-expect-error ApplicationV2._onClose accepts DeepPartial render options at runtime.
    await super._onClose(options);
  }
}

export async function openPartySheet(folderId?: string): Promise<void> {
  const ctx = await resolvePartyContext(folderId);
  if (!ctx) {
    ui.notifications?.warn(
      formatMessage(`${MODULE_ID}.sheet.noPartyFolder`, { name: getPartyFolderName() })
    );
    return;
  }

  const resolvedFolderId = ctx.folder.id ?? folderId;
  if (!resolvedFolderId) return;

  if (activeSheet?.folderId === resolvedFolderId && activeSheet.rendered) {
    activeSheet.bringToFront();
    return;
  }

  if (activeSheet) await activeSheet.close();

  activeSheet = new PartySheetApp(resolvedFolderId);
  await activeSheet.render({ force: true });
}

export function schedulePartySheetRefresh(): void {
  if (!activeSheet?.rendered) return;
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    refreshTimer = null;
    void activeSheet?.refreshData();
  }, 150);
}
