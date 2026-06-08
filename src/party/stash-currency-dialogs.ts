import { MODULE_ID } from "../constants.js";
import type { Actor } from "../foundry-globals.js";
import {
  CURRENCY_DISPLAY_ORDER,
  RITUALCOMP_RS_KEY,
} from "./currency-display.js";
import {
  addStashCurrency,
  getCurrencyLabel,
  parseCurrencyDeltas,
  subtractStashCurrencyByGp,
  subtractStashCurrencyExact,
  type CurrencyRecord,
} from "./stash-currency.js";

const COIN_KEYS = [...CURRENCY_DISPLAY_ORDER] as string[];
const ALL_KEYS = [...COIN_KEYS, RITUALCOMP_RS_KEY];

function loc(key: string): string {
  return game.i18n.localize(`${MODULE_ID}.sheet.stash.currency.${key}`);
}

function buildRowHtml(key: string, inputName: string, hidden = false): string {
  const label = foundry.utils.escapeHTML(getCurrencyLabel(key));
  const style = hidden ? ' style="display:none"' : "";
  return `<div class="form-group stash-currency-row" data-key="${key}"${style}>
    <label>${label}</label>
    <input type="number" name="${inputName}" min="0" step="1" value="0" />
  </div>`;
}

function buildAddDialogContent(): string {
  return ALL_KEYS.map((key) => buildRowHtml(key, `add_${key}`)).join("");
}

function buildSubtractDialogContent(): string {
  const rows = COIN_KEYS.map((key) => buildRowHtml(key, `sub_${key}`)).join("");
  const rsRow = buildRowHtml(RITUALCOMP_RS_KEY, `sub_${RITUALCOMP_RS_KEY}`);
  return `
    <div class="stash-currency-subtract-dialog ${MODULE_ID}">
      <style>
        .stash-currency-subtract-dialog:has(input[name="subtractByGp"]:checked) .stash-currency-rs-row {
          display: none !important;
        }
      </style>
      <div class="form-group">
        <label class="checkbox">
          <input type="checkbox" name="subtractByGp" />
          ${foundry.utils.escapeHTML(loc("subtractByGp"))}
        </label>
      </div>
      ${rows}
      <div class="stash-currency-rs-row">${rsRow}</div>
    </div>
  `;
}

const SUBTRACT_DIALOG_SELECTOR = ".stash-currency-subtract-dialog";

function findSubtractDialogRoot(start: unknown): HTMLElement | null {
  if (!(start instanceof HTMLElement)) return null;
  const wrapped = start.querySelector(SUBTRACT_DIALOG_SELECTOR);
  if (wrapped instanceof HTMLElement) return wrapped;
  if (start.matches?.(SUBTRACT_DIALOG_SELECTOR)) return start;
  const form = start.querySelector("form");
  if (form instanceof HTMLFormElement) return form;
  const content = start.querySelector(".window-content");
  if (content instanceof HTMLElement) {
    const inner = content.querySelector(SUBTRACT_DIALOG_SELECTOR);
    if (inner instanceof HTMLElement) return inner;
  }
  return start;
}

function resolveSubtractDialogRoot(
  dialog?: { element?: HTMLElement },
  html?: unknown,
  button?: HTMLButtonElement
): HTMLElement | null {
  if (dialog?.element) {
    const root = findSubtractDialogRoot(dialog.element);
    if (root) return root;
  }
  const fromHtml = findSubtractDialogRoot(html);
  if (fromHtml) return fromHtml;
  if (button instanceof HTMLElement) {
    return (
      button.closest(SUBTRACT_DIALOG_SELECTOR) ??
      findSubtractDialogRoot(
        button.closest(".window-content") ??
          button.closest(".dialog") ??
          button.closest(".application")
      )
    );
  }
  return null;
}

function readInputInt(root: HTMLElement, name: string): number {
  const input = root.querySelector<HTMLInputElement>(`input[name="${name}"]`);
  return Math.max(0, Math.floor(Number(input?.value) || 0));
}

function sumGpFromRowInputs(root: HTMLElement): number {
  let sum = 0;
  for (const key of COIN_KEYS) {
    sum += readInputInt(root, `sub_${key}`);
  }
  return sum;
}

function readSubtractDeltas(root: HTMLElement, includeResiduum: boolean): CurrencyDeltas {
  const raw: Record<string, unknown> = {};
  const keys = includeResiduum ? ALL_KEYS : COIN_KEYS;
  for (const key of keys) {
    const v = readInputInt(root, `sub_${key}`);
    if (v > 0) raw[key] = v;
  }
  return parseCurrencyDeltas(raw);
}

function syncResiduumVisibility(root: HTMLElement): void {
  const checkbox = root.querySelector<HTMLInputElement>('input[name="subtractByGp"]');
  const rsRow = root.querySelector(".stash-currency-rs-row");
  if (!checkbox || !(rsRow instanceof HTMLElement)) return;
  rsRow.style.display = checkbox.checked ? "none" : "";
}

function wireSubtractDialogListeners(start: unknown): void {
  const root = findSubtractDialogRoot(start);
  if (!root) return;

  if (root.dataset.stashGpToggleBound === "1") return;
  root.dataset.stashGpToggleBound = "1";

  root.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.name !== "subtractByGp") return;
    syncResiduumVisibility(root);
  });

  syncResiduumVisibility(root);
}

export async function promptAddStashCurrency(stashActor: Actor): Promise<boolean> {
  const title = loc("addTitle");
  const result = await foundry.applications.api.DialogV2.input({
    window: { title },
    content: buildAddDialogContent(),
    ok: { icon: "fas fa-plus", label: loc("confirm") },
    cancel: { icon: "fas fa-times", label: game.i18n.localize("Cancel") },
    rejectClose: false,
  });

  if (!result) return false;

  const raw: Record<string, unknown> = {};
  for (const key of ALL_KEYS) {
    raw[key] = result[`add_${key}`];
  }
  const deltas = parseCurrencyDeltas(raw);
  if (Object.keys(deltas).length === 0) return false;

  await addStashCurrency(stashActor, deltas);
  return true;
}

export async function promptSubtractStashCurrency(stashActor: Actor): Promise<boolean> {
  const title = loc("subtractTitle");
  let applied = false;

  await foundry.applications.api.DialogV2.input({
    window: { title },
    content: buildSubtractDialogContent(),
    ok: {
      icon: "fas fa-check",
      label: loc("confirm"),
      callback: async (
        _event: SubmitEvent,
        button: HTMLButtonElement,
        dialog?: { element?: HTMLElement }
      ) => {
        const root = resolveSubtractDialogRoot(dialog, undefined, button);
        if (!root) return false;

        const byGp = root.querySelector<HTMLInputElement>('input[name="subtractByGp"]')?.checked;

        if (byGp) {
          const gpTotal = sumGpFromRowInputs(root);
          if (gpTotal <= 0) return false;
          const result = await subtractStashCurrencyByGp(stashActor, gpTotal);
          if (!result.ok) {
            ui.notifications?.warn(loc("insufficientFunds"), { localize: true });
            return false;
          }
          applied = true;
          return true;
        }

        const deltas = readSubtractDeltas(root, true);
        if (Object.keys(deltas).length === 0) return false;

        const result = await subtractStashCurrencyExact(stashActor, deltas);
        if (!result.ok) {
          ui.notifications?.warn(loc("insufficientFunds"), { localize: true });
          return false;
        }
        applied = true;
        return true;
      },
    },
    cancel: { icon: "fas fa-times", label: game.i18n.localize("Cancel") },
    rejectClose: false,
    render: (_event: unknown, html: HTMLElement) => {
      wireSubtractDialogListeners(html);
      queueMicrotask(() => wireSubtractDialogListeners(html));
    },
  });

  return applied;
}

export function readStashCurrencyFromActor(stashActor: Actor): {
  currency: CurrencyRecord;
  ritualcomp: CurrencyRecord;
} {
  return {
    currency: (stashActor.system?.currency ?? {}) as CurrencyRecord,
    ritualcomp: (stashActor.system?.ritualcomp ?? {}) as CurrencyRecord,
  };
}
