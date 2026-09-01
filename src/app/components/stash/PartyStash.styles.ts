import styled from "styled-components";
import { cardSurface } from "../../../styles/panel.js";

/** Shell-less column of wealth cards (Figma "Stash Overview" 440:1156). */
export const Sidebar = styled.aside.attrs({ className: "party-overview-sidebar" })`
  flex: 0 0 180px;
  width: 180px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: ${({ theme }) => theme.colourTextOnLight};
`;

export const WealthCard = styled.div`
  ${cardSurface}
  padding: 8px;

  h4 {
    margin: 0 0 2px;
    font-size: 12px;
    font-weight: 700;
    color: ${({ theme }) => theme.colourHeading};
  }
`;

export const WealthGp = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: bold;
  color: inherit;
`;

export const LoadLine = styled.p`
  margin: 2px 0 0;
  font-size: 10px;
  color: ${({ theme }) => theme.colourTextInside};
`;

export const MemberWealthCard = styled(WealthCard)`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: flex-start;

  .thumb {
    flex: 0 0 40px;
    align-self: flex-start;
    width: 40px;
    aspect-ratio: 1 / 1;

    img {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 40px;
      object-fit: cover;
      object-position: top center;
      border-radius: ${({ theme }) => theme.radiusBadge};
      border: 1px solid ${({ theme }) => theme.colourPcHead};
    }
  }

  .wealth-card-body {
    min-width: 0;
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
