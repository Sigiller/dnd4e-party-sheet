import { MODULE_ID } from "../constants.js";
import { getPartyFolder, resolvePartyContext } from "../party/party-store.js";
import { getPartyFolderName } from "../settings.js";
import { openPartySheet } from "../app/PartySheetApp.js";

const SHEET_BUTTON_CLASS = "party-sheet-folder-btn";

type DirectoryApp = {
  element?: HTMLElement;
  rendered?: boolean;
  render?: (force?: boolean) => Promise<unknown>;
};

export function registerPartyFolderHooks(): void {
  Hooks.on("renderActorDirectory", (app, html) => {
    injectPartySheetUi(app as DirectoryApp, html);
  });

  Hooks.on("updateFolder", () => {
    const dir = ui.sidebar?.tabs?.actors as DirectoryApp | undefined;
    if (dir?.rendered) dir.render?.(false);
  });
}

/** Resolve directory root element (Foundry v12 jQuery vs v13 HTMLElement). */
function resolveDirectoryRoot(app: DirectoryApp, html: unknown): HTMLElement | null {
  if (html instanceof HTMLElement) return html;
  if (Array.isArray(html) && html[0] instanceof HTMLElement) return html[0];
  if (app?.element instanceof HTMLElement) return app.element;
  return null;
}

function findPartyFolderRow(root: HTMLElement, folderId: string): HTMLElement | null {
  return (
    root.querySelector(`[data-folder-id="${folderId}"]`) ??
    root.querySelector(`[data-entry-id="${folderId}"]`) ??
    root.querySelector(`.directory-item.folder[data-document-id="${folderId}"]`) ??
    root.querySelector(`.directory-item.folder[data-entry-id="${folderId}"]`)
  );
}

function injectPartySheetUi(app: DirectoryApp, html: unknown): void {
  const root = resolveDirectoryRoot(app, html);
  if (!root) return;
  injectFolderIcon(root);
}

/** Icon on the Party folder row. */
function injectFolderIcon(root: HTMLElement): void {
  const folder = getPartyFolder();
  if (!folder) return;

  const row = findPartyFolderRow(root, folder.id);
  if (!row) return;

  const header =
    row.querySelector(":scope > header") ??
    row.querySelector(":scope > .folder-header") ??
    row.querySelector(".folder-header") ??
    row.querySelector("header");

  if (!header) return;
  if (header.querySelector(`.${SHEET_BUTTON_CLASS}`)) return;

  const btn = document.createElement("a");
  btn.className = `${SHEET_BUTTON_CLASS} party-sheet-open`;
  btn.title = game.i18n.localize(`${MODULE_ID}.sheet.openSheet`);
  btn.setAttribute("data-tooltip", game.i18n.localize(`${MODULE_ID}.sheet.openSheet`));
  btn.innerHTML = '<i class="fas fa-scroll"></i>';
  btn.addEventListener("click", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    void openPartySheet(folder.id);
  });

  header.appendChild(btn);
}

export async function openPartySheetFromApi(folderId?: string): Promise<void> {
  const ctx = await resolvePartyContext(folderId);
  if (!ctx) {
    ui.notifications?.warn(
      game.i18n.format(`${MODULE_ID}.sheet.noPartyFolder`, { name: getPartyFolderName() })
    );
    return;
  }
  await openPartySheet(ctx.folder.id);
}
