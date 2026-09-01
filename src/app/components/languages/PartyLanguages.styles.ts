import styled from "styled-components";
import { textOnLightSurface } from "../../../styles/contrast.js";

export const LanguagesBlock = styled.div.attrs({ className: "party-languages-block" })`
  width: 100%;
  ${textOnLightSurface}
`;

export const LanguageGroup = styled.div`
  margin-top: 0.5em;

  h4 {
    margin: 0 0 0.3em;
    font-size: 11px;
    font-weight: 700;
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
    background: rgba(118, 105, 78, 0.24);
    color: ${({ theme }) => theme.colourHeading};
    padding: 0.3em 0.75em;
    border-radius: ${({ theme }) => theme.radiusControl};
    font-size: 11px;
    line-height: 1.2;
    cursor: help;
  }
`;
