import styled from "styled-components";
import { textOnLightSurface } from "../../../styles/contrast.js";

export const SkillsBlock = styled.div.attrs({ className: "party-skills-block" })`
  width: 100%;
  overflow-x: auto;
  ${textOnLightSurface}
`;

export const SkillBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacingBadgeGap};
`;

export const SkillBadge = styled.span`
  background: ${({ theme }) => theme.backgroundRowOdd};
  color: ${({ theme }) => theme.colourTextOnLight};
  padding: 0.25em 0.65em;
  border-radius: ${({ theme }) => theme.radiusBadge};
  font-size: 0.85em;
  cursor: help;
`;

export const SkillsTable = styled.table.attrs({ className: "skills" })`
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 0.9rem;
  border-collapse: collapse;
  border: none;
  margin: 2px 0 1rem;
  table-layout: fixed;
  width: 100%;
  background: unset;
  color: ${({ theme }) => theme.colourTextOnLight};

  thead {
    border-bottom: 0;
    text-shadow: unset;
    background: ${({ theme }) => theme.colourPcHead};

    th {
      color: ${({ theme }) => theme.colourTextOnDark};
      font-size: 0.75em;
      text-transform: uppercase;
      font-weight: inherit;
      border: 0;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
      vertical-align: middle;
      line-height: 1.25;
    }

    th.skill-name {
      text-align: left;
    }

    th.skill-value {
      text-align: center;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #fff;

      &:nth-child(odd) {
        background: ${({ theme }) => theme.backgroundRowOdd};
      }

      &:nth-child(even) {
        background: ${({ theme }) => theme.gradient4e};
      }
    }
  }

  tr,
  td {
    border: 0;
  }

  th,
  td {
    padding: 0.25em 0.6em;
    color: inherit;
  }

  :is(th, td).skill-title {
    padding: 0.25em 0.25em 0.25em 0;
    text-align: left;
    vertical-align: middle;
  }

  h4.skill-name {
    font-size: 1em;
    margin: 0;
    font-weight: inherit;
    color: ${({ theme }) => theme.colourHeading};
  }

  tbody .skill-ability {
    font-size: 0.75em;
    text-transform: uppercase;
  }

  .skill-value {
    text-align: center;
    vertical-align: middle;
  }

  thead .skill-value button {
    display: inline;
    width: auto;
    max-width: 100%;
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
`;
