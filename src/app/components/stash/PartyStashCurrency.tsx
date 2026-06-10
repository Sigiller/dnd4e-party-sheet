import { Fragment } from "react";
import { MODULE_ID } from "../../../constants.js";
import { localize } from "../../../i18n.js";
import { getGameActors } from "../../../types/dnd4e.js";
import { CURRENCY_ICONS } from "../../../party/currency-display.js";
import { getStashCurrencyRows } from "../../../party/stash-currency.js";
import {
  promptAddStashCurrency,
  promptSubtractStashCurrency,
} from "../../../party/stash-currency-dialogs.js";
import type { CurrencyRecord } from "../../../party/stash-currency.js";
import {
  CurrencyActions,
  CurrencyBar,
  CurrencyButton,
  CurrencyCell,
  CurrencyCells,
  CurrencyDivider,
} from "./PartyStashCurrency.styles.js";

interface PartyStashCurrencyProps {
  stashActorId: string;
  currency: CurrencyRecord;
  ritualcomp: CurrencyRecord;
  canEdit: boolean;
  onChanged: () => void;
}

function coinIconClass(key: string): string {
  const base = CURRENCY_ICONS[key] ?? "fas fa-coins";
  return `${base} coin-${key}`;
}

export function PartyStashCurrency({
  stashActorId,
  currency,
  ritualcomp,
  canEdit,
  onChanged,
}: PartyStashCurrencyProps) {
  const rows = getStashCurrencyRows(currency, ritualcomp);
  const loc = (key: string) => localize(`${MODULE_ID}.sheet.stash.currency.${key}`);

  const handleAdd = async () => {
    const actor = getGameActors()?.get(stashActorId);
    if (!actor) return;
    const ok = await promptAddStashCurrency(actor);
    if (ok) onChanged();
  };

  const handleSubtract = async () => {
    const actor = getGameActors()?.get(stashActorId);
    if (!actor) return;
    const ok = await promptSubtractStashCurrency(actor);
    if (ok) onChanged();
  };

  return (
    <CurrencyBar>
      <CurrencyCells>
        {rows.map((row, index) => (
          <Fragment key={row.key}>
            {index > 0 ? <CurrencyDivider aria-hidden>|</CurrencyDivider> : null}
            <CurrencyCell>
              <span>{row.value}</span>
              <i
                className={coinIconClass(row.key)}
                data-tooltip={row.label}
                aria-label={row.label}
              />
            </CurrencyCell>
          </Fragment>
        ))}
      </CurrencyCells>
      {canEdit ? (
        <CurrencyActions>
          <CurrencyButton
            type="button"
            data-tooltip={loc("addTitle")}
            onClick={() => void handleAdd()}
          >
            <i className="fas fa-plus" />
          </CurrencyButton>
          <CurrencyButton
            type="button"
            data-tooltip={loc("subtractTitle")}
            onClick={() => void handleSubtract()}
          >
            <i className="fas fa-minus" />
          </CurrencyButton>
        </CurrencyActions>
      ) : null}
    </CurrencyBar>
  );
}
