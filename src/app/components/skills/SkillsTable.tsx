import type { PartySkillDetailed } from "../../../party/party-data.js";
import { ActorNameLink } from "../ActorNameLink.js";
import { BestValueBadge } from "../../../styles/LozengeBadge.js";
import { SkillsTable as StyledTable } from "./PartySkills.styles.js";

interface SkillsTableProps {
  detailed: PartySkillDetailed[];
}

export function SkillsTable({ detailed }: SkillsTableProps) {
  if (detailed.length === 0) return null;

  const members = detailed[0]?.byMember ?? [];
  const columnCount = 1 + members.length;
  const columnWidth = `${100 / columnCount}%`;

  return (
    <StyledTable>
      <colgroup>
        <col style={{ width: columnWidth }} />
        {members.map((member) => (
          <col key={member.memberId} style={{ width: columnWidth }} />
        ))}
      </colgroup>
      <thead>
        <tr className="skills-header">
          <th className="skill-name">Skill</th>
          {members.map((member) => (
            <th key={member.memberId} className="skill-value">
              <ActorNameLink actorId={member.memberId} variant="tableHeader">
                {member.memberName}
              </ActorNameLink>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {detailed.map((row) => {
          const best = Math.max(...row.byMember.map((cell) => cell.bonus));
          return (
            <tr key={row.key} className="skill--block">
              <td className="skill-title">
                <h4 className="skill-name">{row.label}</h4>
              </td>
              {row.byMember.map((cell) => {
                const value = cell.bonus >= 0 ? `+${cell.bonus}` : `${cell.bonus}`;
                return (
                  <td key={cell.memberId} className="skill-value">
                    {cell.bonus === best ? <BestValueBadge>{value}</BestValueBadge> : value}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </StyledTable>
  );
}
