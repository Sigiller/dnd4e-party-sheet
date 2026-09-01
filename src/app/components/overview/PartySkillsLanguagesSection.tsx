import { useId, useState } from "react";
import { MODULE_ID } from "../../../constants.js";
import { localize as loc } from "../../../i18n.js";
import type { PartySnapshot } from "../../../party/party-data.js";
import { isOverviewCollapsed, setOverviewCollapsed } from "../../../settings.js";
import { PartyLanguages } from "../languages/PartyLanguages.js";
import { SkillsTable } from "../skills/SkillsTable.js";
import { SkillsBlock } from "../skills/PartySkills.styles.js";
import { CollapseDivider } from "./CollapseDivider.js";
import { OverviewSubSection, SectionHeading } from "../../../styles/sheetLayout.js";

interface PartySkillsLanguagesSectionProps {
  folderId: string;
  snapshot: Pick<PartySnapshot, "skillsDetailed" | "languages">;
}

export function PartySkillsLanguagesSection({
  folderId,
  snapshot,
}: PartySkillsLanguagesSectionProps) {
  const localize = (key: string) => loc(`${MODULE_ID}.${key}`);
  const [expanded, setExpanded] = useState(() => !isOverviewCollapsed(folderId));
  const contentId = useId();

  const toggle = () => {
    setExpanded((prev) => {
      setOverviewCollapsed(folderId, prev);
      return !prev;
    });
  };

  return (
    <OverviewSubSection>
      {expanded ? (
        <div id={contentId}>
          <SectionHeading>{localize("sheet.skills.title")}</SectionHeading>
          <SkillsBlock>
            <SkillsTable detailed={snapshot.skillsDetailed} />
          </SkillsBlock>
          <SectionHeading>{localize("sheet.languages.title")}</SectionHeading>
          <PartyLanguages languages={snapshot.languages} />
        </div>
      ) : (
        <SectionHeading id={contentId}>
          {localize("sheet.skillsLanguages.title")}
        </SectionHeading>
      )}
      <CollapseDivider
        expanded={expanded}
        onToggle={toggle}
        collapseLabel={localize("sheet.skillsLanguages.collapse")}
        expandLabel={localize("sheet.skillsLanguages.expand")}
        controlsId={contentId}
      />
    </OverviewSubSection>
  );
}
