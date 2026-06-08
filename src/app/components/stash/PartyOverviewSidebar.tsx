import { MODULE_ID } from "../../../constants.js";
import type { MemberSummary } from "../../../party/party-data.js";
import { formatGp, formatPartyTotalGp } from "../../../party/wealth.js";
import {
  LoadLine,
  MemberWealthCard,
  Sidebar,
  WealthCard,
  WealthGp,
} from "./PartyStash.styles.js";

interface PartyOverviewSidebarProps {
  title: string;
  partyTotalGp: number;
  stashLoad: number;
  members: MemberSummary[];
}

export function PartyOverviewSidebar({
  title,
  partyTotalGp,
  stashLoad,
  members,
}: PartyOverviewSidebarProps) {
  const localize = (key: string) => game.i18n.localize(`${MODULE_ID}.${key}`);

  return (
    <Sidebar>
      <h3>{title}</h3>
      <WealthCard className="party-total-card">
        <h4>{localize("sheet.stash.partyTotal")}</h4>
        <WealthGp>{formatPartyTotalGp(partyTotalGp)} gp</WealthGp>
        <LoadLine>
          {localize("sheet.stash.load")}: {stashLoad}
        </LoadLine>
      </WealthCard>

      {members.map((m) => (
        <MemberWealthCard key={m.id}>
          <img src={m.img} alt="" width={36} height={36} className="thumb" />
          <div className="wealth-card-body">
            <h4>{m.name}</h4>
            <WealthGp>{formatGp(m.gp)} gp</WealthGp>
            <LoadLine>
              {localize("sheet.stash.load")}: {m.load.value} / {m.load.max}
            </LoadLine>
          </div>
        </MemberWealthCard>
      ))}
    </Sidebar>
  );
}
