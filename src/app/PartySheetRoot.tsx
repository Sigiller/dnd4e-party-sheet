import { useCallback, useState } from "react";
import { MODULE_ID, type PartyFolderFlags } from "../constants.js";
import { localize as loc } from "../i18n.js";
import type { PartySnapshot } from "../party/party-data.js";
import type { InventorySection } from "../party/inventory-prep.js";
import { OverviewTab } from "./tabs/OverviewTab.js";
import { StashTab } from "./tabs/StashTab.js";
import { PartyHeader } from "./components/PartyHeader.js";
import { TabFrame, type SheetTabId } from "./components/chrome/TabFrame.js";
import { SheetInner } from "../styles/sheetLayout.js";

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

export function PartySheetRoot(props: PartySheetProps) {
  const [tab, setTab] = useState<SheetTabId>("overview");
  const localize = (key: string) => loc(`${MODULE_ID}.${key}`);

  const onEmblemPick = useCallback(async () => {
    const FilePickerCtor =
      foundry.applications.apps.FilePicker.implementation ??
      foundry.applications.apps.FilePicker;
    const fp = new FilePickerCtor({
      type: "image",
      current: props.flags.emblem ?? "",
      callback: (path: string) => props.onUpdateFlags({ emblem: path }),
    });
    await fp.render({ force: true });
  }, [props]);

  return (
    <SheetInner>
      <PartyHeader
        flags={props.flags}
        partyLevel={props.snapshot.partyLevel}
        onNameChange={(displayName) => props.onUpdateFlags({ displayName })}
        onEmblemClick={onEmblemPick}
      />

      <TabFrame
        activeTab={tab}
        onTabChange={setTab}
        labels={{
          overview: localize("sheet.tabs.overview"),
          stash: localize("sheet.tabs.stash"),
        }}
        ariaLabel={localize("sheet.tabs.label")}
      >
        {tab === "overview" ? (
          <OverviewTab folderId={props.folderId} snapshot={props.snapshot} />
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
      </TabFrame>
    </SheetInner>
  );
}
