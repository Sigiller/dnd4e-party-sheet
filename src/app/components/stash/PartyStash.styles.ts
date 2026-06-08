import styled from "styled-components";
import { cardSurface } from "../../../styles/panel.js";

export const Sidebar = styled.aside.attrs({ className: "party-overview-sidebar" })`
  flex: 0 0 200px;
  width: 200px;
  ${cardSurface}
  padding: ${({ theme }) => theme.spacingGutter};
  color: ${({ theme }) => theme.colourTextOnLight};

  h3 {
    margin: 0 0 0.5em;
    font-size: 0.85em;
    font-weight: 700;
    color: ${({ theme }) => theme.colourHeading};
  }
`;

export const WealthCard = styled.div`
  background: ${({ theme }) => theme.backgroundRowOdd};
  color: ${({ theme }) => theme.colourTextOnLight};
  padding: 0.5em;
  margin-bottom: 0.5em;
  border-radius: ${({ theme }) => theme.radiusBadge};

  h4 {
    margin: 0 0 0.25em;
    font-size: 0.8em;
    font-weight: 400;
    color: ${({ theme }) => theme.colourTextInside};
  }
`;

export const WealthGp = styled.p`
  margin: 0;
  font-size: 1em;
  font-weight: bold;
  color: inherit;
`;

export const LoadLine = styled.p`
  margin: 0.25em 0 0;
  font-size: 0.8em;
  color: ${({ theme }) => theme.colourTextInside};
`;

export const MemberWealthCard = styled(WealthCard)`
  display: flex;
  flex-direction: row;
  gap: 0.5em;
  align-items: center;

  .thumb {
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radiusBadge};
    border: 1px solid ${({ theme }) => theme.borderMuted};
  }
`;

export const StashMain = styled.div.attrs({ className: "party-stash-main flexcol" })`
  flex: 1 1 auto;
  min-width: 0;
  background: transparent;
  padding: 0;
`;

export const StashInventoryRoot = styled.div`
  width: 100%;

  ul.item-list,
  ul.items-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
`;
