import { useState } from "react";
import { MODULE_ID } from "../../../constants.js";
import type { PartySnapshot } from "../../../party/party-data.js";
import { PartyLanguages } from "../languages/PartyLanguages.js";
import { PartySkills } from "../skills/PartySkills.js";
import {
  IconButton,
  OverviewSubContent,
  OverviewSubSection,
  OverviewSubTabs,
  SubTabCell,
  SubTabHitArea,
  SubTabIconGroup,
} from "../../../styles/sheetLayout.js";

interface PartySkillsLanguagesSectionProps {
  snapshot: Pick<PartySnapshot, "skillsCompact" | "skillsDetailed" | "languages">;
}

type SubTabId = "skills" | "languages";
type SkillsMode = "compact" | "detailed";

export function PartySkillsLanguagesSection({ snapshot }: PartySkillsLanguagesSectionProps) {
  const [subTab, setSubTab] = useState<SubTabId>("skills");
  const [skillsMode, setSkillsMode] = useState<SkillsMode>("compact");
  const localize = (key: string) => game.i18n.localize(`${MODULE_ID}.${key}`);

  const toggleSkillsMode = () => {
    setSubTab("skills");
    setSkillsMode((mode) => (mode === "compact" ? "detailed" : "compact"));
  };

  const skillsModeIcon =
    skillsMode === "compact" ? "fas fa-th-large" : "fas fa-table";
  const skillsModeLabel = localize(
    skillsMode === "compact" ? "sheet.skills.compact" : "sheet.skills.detailed"
  );

  return (
    <OverviewSubSection>
      <OverviewSubTabs>
        <SubTabCell>
          <SubTabHitArea
            type="button"
            $active={subTab === "skills"}
            $centered
            $withIcon
            onClick={() => setSubTab("skills")}
          >
            {localize("sheet.skills.title")}
          </SubTabHitArea>
          <SubTabIconGroup>
            <IconButton
              type="button"
              data-tooltip={skillsModeLabel}
              aria-label={skillsModeLabel}
              onClick={toggleSkillsMode}
            >
              <i className={skillsModeIcon} />
            </IconButton>
          </SubTabIconGroup>
        </SubTabCell>
        <SubTabCell>
          <SubTabHitArea
            type="button"
            $active={subTab === "languages"}
            $centered
            onClick={() => setSubTab("languages")}
          >
            {localize("sheet.languages.title")}
          </SubTabHitArea>
        </SubTabCell>
      </OverviewSubTabs>

      <OverviewSubContent>
        {subTab === "skills" ? (
          <PartySkills
            mode={skillsMode}
            compact={snapshot.skillsCompact}
            detailed={snapshot.skillsDetailed}
          />
        ) : (
          <PartyLanguages languages={snapshot.languages} />
        )}
      </OverviewSubContent>
    </OverviewSubSection>
  );
}
