import styled from "styled-components";
import { textOnLightSurface } from "../../../styles/contrast.js";

/** Figma "Hero Overview" (440:782): translucent wash over the parchment panel. */
export const MemberCard = styled.article.attrs({ className: "party-member-card" })`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  margin-bottom: 10px;
  background: ${({ theme }) => theme.cardSurface};
  border: 1px solid ${({ theme }) => theme.borderCard};
  box-shadow: ${({ theme }) => theme.shadowCard};
  ${textOnLightSurface}
`;

export const PortraitCol = styled.div.attrs({ className: "member-portrait-col" })`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const PortraitFrame = styled.div`
  width: ${({ theme }) => theme.portraitSize};
  height: ${({ theme }) => theme.portraitSize};
  /* HP bar tucks over the portrait bottom (Figma: -25px) */
  margin-bottom: -25px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid ${({ theme }) => theme.colourPcHead};
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.25));

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    border: none;
    border-radius: 50%;
  }
`;

export const InfoCol = styled.div.attrs({ className: "member-stats-col" })`
  flex: 1 1 auto;
  min-width: 0;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
`;

export const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`;

export const NameBlock = styled.div`
  min-width: 0;

  h3 {
    font-family: ${({ theme }) => theme.fontFamilyHead};
    font-size: 28px;
    font-weight: 500;
    line-height: 1.05;
    border: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const MemberSubtitle = styled.p`
  margin: 2px 0 0;
  font-size: 12px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colourTextOnLight};
`;

export const BadgeRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  flex: 0 0 auto;

  .effects-block {
    display: flex;
    gap: 0.25em;
  }

  .effects-block img {
    border-radius: 3px;
    cursor: help;
    background-color: ${({ theme }) => theme.colourPcHead};
    object-fit: contain;
  }
`;

/** Outlined sense badge (DARKVISION / LOW-LIGHT). */
export const SenseBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.colourPrimary900};
  border-radius: ${({ theme }) => theme.radiusBadge};
  box-shadow: ${({ theme }) => theme.shadowElement};
  font-size: 14px;
  line-height: 1.2;
  text-transform: uppercase;
  white-space: nowrap;

  /* && beats the card's blanket "span, li { color: inherit }" contrast rule */
  && {
    color: ${({ theme }) => theme.colourPrimary900};
  }
`;

export const BottomRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 8px;
`;

export const DefencesRow = styled.div.attrs({ className: "defences-block" })`
  display: flex;
  flex-direction: row;
  gap: 8px;
  flex: 0 0 auto;
`;

export const DefensePip = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 60px;
  justify-content: center;
`;

export const DefenseCircle = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.defenseCircleSize};
  height: ${({ theme }) => theme.defenseCircleSize};
  margin-bottom: -8px;
  border: 2px solid ${({ theme }) => theme.colourPrimary900};
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.shadowElement};
  font-family: ${({ theme }) => theme.fontFamilyHead};
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -1.4px;
  padding-right: 2px;

  && {
    color: ${({ theme }) => theme.colourPrimary700};
  }
`;

export const DefenseLabel = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 26px;
  padding: 0 6px;
  background: ${({ theme }) => theme.colourPcHead};
  border: 1px solid ${({ theme }) => theme.colourPrimary900};
  border-radius: ${({ theme }) => theme.radiusBadge};
  box-shadow: ${({ theme }) => theme.shadowElement};
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;

  && {
    color: ${({ theme }) => theme.vitalsGold};
  }
`;

export const MemberSkills = styled.ul.attrs({ className: "member-skills" })`
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 6px 8px;
`;

/** Navy chip with light-gold border/text (trained skills). */
export const SkillChip = styled.li`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: ${({ theme }) => theme.colourPcHead};
  border: 1px solid ${({ theme }) => theme.vitalsGoldLight};
  border-radius: ${({ theme }) => theme.radiusBadge};
  filter: drop-shadow(0 3px 2px rgba(0, 0, 0, 0.1));
  font-size: 14px;
  line-height: 1.2;
  text-transform: uppercase;
  white-space: nowrap;
  margin: 0;

  && {
    color: ${({ theme }) => theme.vitalsGoldLight};
  }
`;
