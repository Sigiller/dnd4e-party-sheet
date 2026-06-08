import { useCallback, useState } from "react";
import { MODULE_ID, type PartyFolderFlags } from "../constants.js";
import type { PartySnapshot } from "../party/party-data.js";
import type { InventorySection } from "../party/inventory-prep.js";
import { OverviewTab } from "./tabs/OverviewTab.js";
import { StashTab } from "./tabs/StashTab.js";
import { PartyHeader } from "./components/PartyHeader.js";
import {
  SheetBody,
  SheetInner,
  SheetTabs,
  TabButton,
} from "../styles/sheetLayout.js";

export interface PartySheetProps {
  folderId: string;
  flags: PartyFolderFlags;
  stashActorId: string;
  canEdit: boolean;
  canEditCurrency: boolean;
  snapshot: PartySnapshot;
  stash: {
    sections: InventorySection[];
    load: number;
    gp: number;
    partyTotalGp: number;
    currency: Record<string, number>;
    ritualcomp: Record<string, number>;
    actor: { id: string };
  };
  onUpdateFlags: (patch: Partial<PartyFolderFlags>) => Promise<void>;
  onRefresh: () => void;
}

type TabId = "overview" | "stash";

export function PartySheetRoot(props: PartySheetProps) {
  const [tab, setTab] = useState<TabId>("overview");
  const localize = (key: string) => game.i18n.localize(`${MODULE_ID}.${key}`);

  const onEmblemPick = useCallback(async () => {
    const fp = new foundry.applications.apps.FilePicker({
      type: "image",
      current: props.flags.emblem ?? "",
      callback: (path: string) => props.onUpdateFlags({ emblem: path }),
    });
    await fp.render(true);
  }, [props]);

  return (
    <SheetInner>
      <PartyHeader
        flags={props.flags}
        partyLevel={props.snapshot.partyLevel}
        onNameChange={(displayName) => props.onUpdateFlags({ displayName })}
        onEmblemClick={onEmblemPick}
      />

      <SheetTabs>
        <TabButton
          type="button"
          $active={tab === "overview"}
          onClick={() => setTab("overview")}
        >
          {localize("sheet.tabs.overview")}
        </TabButton>
        <TabButton
          type="button"
          $active={tab === "stash"}
          onClick={() => setTab("stash")}
        >
          {localize("sheet.tabs.stash")}
        </TabButton>
      </SheetTabs>

      <SheetBody>
        {tab === "overview" ? (
          <OverviewTab snapshot={props.snapshot} />
        ) : (
          <StashTab
            snapshot={props.snapshot}
            stash={props.stash}
            canEdit={props.canEdit}
            canEditCurrency={props.canEditCurrency}
            stashActorId={props.stashActorId}
            onRefresh={props.onRefresh}
          />
        )}
      </SheetBody>
    </SheetInner>
  );
}
