import { MODULE_ID } from "../../../constants.js";
import { localize as loc } from "../../../i18n.js";
import type { MemberSummary } from "../../../party/party-data.js";
import { DND4E_ACTOR_INVENTORY_TAB } from "../../../party/open-actor-sheet.js";
import { formatGp, formatPartyTotalGp } from "../../../party/wealth.js";
import { ActorNameLink, ActorPortraitLink } from "../ActorNameLink.js";
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
  const localize = (key: string) => loc(`${MODULE_ID}.${key}`);

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
          <ActorPortraitLink
            actorId={m.id}
            src={m.img}
            width={36}
            height={36}
            className="thumb"
            sheetOptions={DND4E_ACTOR_INVENTORY_TAB}
          />
          <div className="wealth-card-body">
            <ActorNameLink
              actorId={m.id}
              variant="sidebar"
              sheetOptions={DND4E_ACTOR_INVENTORY_TAB}
            >
              {m.name}
            </ActorNameLink>
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
