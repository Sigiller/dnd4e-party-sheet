import type { MemberSummary } from "../../../party/party-data.js";
import { ActorNameLink } from "../ActorNameLink.js";
import { HpSurgeBar } from "./HpSurgeBar.js";
import {
  DefencesRow,
  MemberCard as Card,
  MemberSkills,
  MemberSubtitle,
} from "./MemberCard.styles.js";

interface MemberCardProps {
  member: MemberSummary;
}

export function MemberCard({ member }: MemberCardProps) {
  return (
    <Card>
      <div className="member-portrait-col">
        <div className="image-frame">
          <img className="portrait profile-img" src={member.img} alt="" width={100} height={100} />
        </div>
        <HpSurgeBar hp={member.hp} surges={member.surges} />
      </div>

      <div className="member-stats-col flexcol">
        <ActorNameLink actorId={member.id} variant="heading">
          {member.name}
        </ActorNameLink>
        {member.subtitle ? <MemberSubtitle>{member.subtitle}</MemberSubtitle> : null}

        <DefencesRow>
          <div className="defences-block">
            <span>AC {member.defences.ac}</span>
            <span>
              Fort {member.defences.fort} / Ref {member.defences.ref} / Will {member.defences.wil}
            </span>
          </div>
          {member.senses.length > 0 ? (
            <div className="senses-block">{member.senses.join(", ")}</div>
          ) : null}
          {member.effects.length > 0 ? (
            <div className="effects-block flexrow">
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
        </DefencesRow>

        {member.trainedSkills.length > 0 ? (
          <MemberSkills className="skill-list member-skills">
            {member.trainedSkills.map((sk) => (
              <li key={sk.key} className={`skill--block ${sk.key}`}>
                <span className="skill-name">
                  <span className="name">{sk.label}</span>{" "}
                  <span className="bonus total">
                    {sk.total >= 0 ? `+${sk.total}` : sk.total}
                  </span>
                </span>
              </li>
            ))}
          </MemberSkills>
        ) : null}
      </div>
    </Card>
  );
}
