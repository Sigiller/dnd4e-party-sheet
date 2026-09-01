import { MODULE_ID } from "../../constants.js";
import { localize as loc } from "../../i18n.js";
import type { PartySnapshot } from "../../party/party-data.js";
import { PartySkillsLanguagesSection } from "../components/overview/PartySkillsLanguagesSection.js";
import { MemberCard } from "../components/members/MemberCard.js";
import { MembersSection, OverviewTabPanel } from "../../styles/sheetLayout.js";

interface OverviewTabProps {
  folderId: string;
  snapshot: PartySnapshot;
}

export function OverviewTab({ folderId, snapshot }: OverviewTabProps) {
  const localize = (key: string) => loc(`${MODULE_ID}.${key}`);

  return (
    <OverviewTabPanel>
      <PartySkillsLanguagesSection folderId={folderId} snapshot={snapshot} />

      <MembersSection>
        <h2>{localize("sheet.members.title")}</h2>
        <div className="party-member-list">
          {snapshot.members.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>
      </MembersSection>
    </OverviewTabPanel>
  );
}
