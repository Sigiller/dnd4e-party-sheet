import styled from "styled-components";
import { textOnLightSurface } from "../../../styles/contrast.js";

export const LanguagesBlock = styled.div.attrs({ className: "party-languages-block" })`
  width: 100%;
  ${textOnLightSurface}
`;

export const LanguageGroup = styled.div`
  margin-top: 0.5em;

  h4 {
    margin: 0 0 0.25em;
    font-size: 0.9em;
    color: ${({ theme }) => theme.colourAccentOnLight};
  }
`;

export const LanguageList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacingBadgeGap};

  li {
    background: ${({ theme }) => theme.backgroundRowOdd};
    color: ${({ theme }) => theme.colourTextOnLight};
    padding: 0.25em 0.65em;
    border-radius: ${({ theme }) => theme.radiusBadge};
    font-size: 0.85em;
    cursor: help;
  }
`;
