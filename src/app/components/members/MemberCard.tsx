import type { MemberSummary } from "../../../party/party-data.js";
import { ActorNameLink } from "../ActorNameLink.js";
import { HpSurgeBar } from "./HpSurgeBar.js";
import {
  BadgeRow,
  BottomRow,
  DefenseCircle,
  DefenseLabel,
  DefensePip,
  DefencesRow,
  InfoCol,
  MemberCard as Card,
  MemberSkills,
  MemberSubtitle,
  NameBlock,
  PortraitCol,
  PortraitFrame,
  SenseBadge,
  SkillChip,
  TopRow,
} from "./MemberCard.styles.js";

interface MemberCardProps {
  member: MemberSummary;
}

export function MemberCard({ member }: MemberCardProps) {
  const defences = [
    { key: "ac", label: "AC", value: member.defences.ac },
    { key: "fort", label: "Fort", value: member.defences.fort },
    { key: "ref", label: "Ref", value: member.defences.ref },
    { key: "will", label: "Will", value: member.defences.wil },
  ];

  return (
    <Card data-testid="member-card">
      <PortraitCol>
        <PortraitFrame>
          <img className="portrait profile-img" src={member.img} alt="" />
        </PortraitFrame>
        <HpSurgeBar hp={member.hp} surges={member.surges} />
      </PortraitCol>

      <InfoCol>
        <TopRow>
          <NameBlock>
            <ActorNameLink actorId={member.id} variant="heading">
              {member.name}
            </ActorNameLink>
            {member.subtitle ? <MemberSubtitle>{member.subtitle}</MemberSubtitle> : null}
          </NameBlock>
          {member.senses.length > 0 || member.effects.length > 0 ? (
            <BadgeRow>
              {member.effects.length > 0 ? (
                <div className="effects-block">
                  {member.effects.map((ef, i) => (
                    <img
                      key={`${ef.name}-${i}`}
                      src={ef.img}
                      alt=""
                      width={28}
                      height={28}
                      data-tooltip={ef.name}
                    />
                  ))}
                </div>
              ) : null}
              {member.senses.map((sense) => (
                <SenseBadge key={sense}>{sense}</SenseBadge>
              ))}
            </BadgeRow>
          ) : null}
        </TopRow>

        <BottomRow>
          <DefencesRow>
            {defences.map((def) => (
              <DefensePip key={def.key}>
                <DefenseCircle>{def.value}</DefenseCircle>
                <DefenseLabel>{def.label}</DefenseLabel>
              </DefensePip>
            ))}
          </DefencesRow>
          {member.trainedSkills.length > 0 ? (
            <MemberSkills className="skill-list">
              {member.trainedSkills.map((sk) => (
                <SkillChip key={sk.key} className={`skill--block ${sk.key}`}>
                  {sk.label} {sk.total >= 0 ? `+${sk.total}` : sk.total}
                </SkillChip>
              ))}
            </MemberSkills>
          ) : null}
        </BottomRow>
      </InfoCol>
    </Card>
  );
}
