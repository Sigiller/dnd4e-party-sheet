import { useRef } from "react";
import { MODULE_ID } from "../../constants.js";
import type { PartySnapshot } from "../../party/party-data.js";
import type { InventorySection } from "../../party/inventory-prep.js";
import { PartyOverviewSidebar } from "../components/stash/PartyOverviewSidebar.js";
import { PartyStashCurrency } from "../components/stash/PartyStashCurrency.js";
import { PartyStashInventory } from "../components/stash/PartyStashInventory.js";
import { useStashDragDrop } from "../components/stash/useStashDragDrop.js";
import { StashMain } from "../components/stash/PartyStash.styles.js";
import { StashTabPanel } from "../../styles/sheetLayout.js";

interface StashTabProps {
  snapshot: PartySnapshot;
  stash: {
    sections: InventorySection[];
    load: number;
    gp: number;
    partyTotalGp: number;
    currency: Record<string, number>;
    ritualcomp: Record<string, number>;
  };
  stashActorId: string;
  canEdit: boolean;
  canEditCurrency: boolean;
  onRefresh: () => void;
}

export function StashTab({ snapshot, stash, stashActorId, canEdit, canEditCurrency, onRefresh }: StashTabProps) {
  const tabRef = useRef<HTMLDivElement>(null);
  const localize = (key: string) => game.i18n.localize(`${MODULE_ID}.${key}`);

  useStashDragDrop(tabRef, stashActorId, canEdit, onRefresh);

  return (
    <StashTabPanel ref={tabRef}>
      <PartyOverviewSidebar
        title={localize("sheet.stash.partyOverview")}
        partyTotalGp={stash.partyTotalGp}
        stashLoad={stash.load}
        members={snapshot.members}
      />
      <StashMain>
        <PartyStashCurrency
          stashActorId={stashActorId}
          currency={stash.currency}
          ritualcomp={stash.ritualcomp}
          canEdit={canEditCurrency}
          onChanged={onRefresh}
        />
        <PartyStashInventory
          title={localize("sheet.stash.partyStash")}
          sections={stash.sections}
          stashActorId={stashActorId}
          canEdit={canEdit}
          onItemsChanged={onRefresh}
        />
      </StashMain>
    </StashTabPanel>
  );
}
