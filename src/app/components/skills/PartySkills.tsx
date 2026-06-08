import type { PartySkillCompact, PartySkillDetailed } from "../../../party/party-data.js";
import { SkillsTable } from "./SkillsTable.js";
import { SkillBadge, SkillBadges, SkillsBlock } from "./PartySkills.styles.js";

interface PartySkillsProps {
  mode: "compact" | "detailed";
  compact: PartySkillCompact[];
  detailed: PartySkillDetailed[];
}

export function PartySkills({ mode, compact, detailed }: PartySkillsProps) {
  return (
    <SkillsBlock>
      {mode === "compact" ? (
        <SkillBadges>
          {compact.map((sk) => (
            <SkillBadge key={sk.key} data-tooltip={sk.owners.join(", ")}>
              {sk.label} {sk.bonus >= 0 ? `+${sk.bonus}` : sk.bonus}
            </SkillBadge>
          ))}
        </SkillBadges>
      ) : (
        <SkillsTable detailed={detailed} />
      )}
    </SkillsBlock>
  );
}
