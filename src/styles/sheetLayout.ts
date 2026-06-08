import styled, { css } from "styled-components";
import { panelSurface } from "./panel.js";

const scrollTab = css`
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacingGutter};
  -webkit-overflow-scrolling: touch;
`;

export const SheetInner = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  background: ${({ theme }) => theme.gradient4e};
`;

export const SheetTabs = styled.nav`
  flex: 0 0 auto;
  display: flex;
  gap: 0;
  background: ${({ theme }) => theme.backgroundRowOdd};
  border-bottom: 2px solid ${({ theme }) => theme.colourPcHead};
`;

export const TabButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5em 1em;
  border: none;
  box-sizing: border-box;
  background: ${({ $active, theme }) =>
    $active ? theme.backgroundPanel : "transparent"};
  color: ${({ $active, theme }) =>
    $active ? theme.colourPcHead : theme.colourTextOnLight};
  cursor: pointer;
  font-weight: bold;
`;

export const SubTabCell = styled.div`
  flex: 1;
  align-self: stretch;
  position: relative;
  display: flex;
  align-items: stretch;
`;

export const SubTabHitArea = styled.button<{ $active?: boolean; $centered?: boolean; $withIcon?: boolean }>`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: ${({ $centered }) => ($centered ? "center" : "flex-start")};
  padding: 0.5em ${({ $centered, $withIcon }) =>
    $withIcon || !$centered ? "2.25em" : "1em"} 0.5em 1em;
  box-sizing: border-box;
  border: none;
  background: ${({ $active, theme }) =>
    $active ? theme.backgroundPanel : "transparent"};
  color: ${({ $active, theme }) =>
    $active ? theme.colourPcHead : theme.colourTextOnLight};
  cursor: pointer;
  font-weight: bold;
  text-align: ${({ $centered }) => ($centered ? "center" : "left")};
  line-height: inherit;
  font-family: inherit;
  font-size: inherit;
`;

export const SubTabIconGroup = styled.div`
  position: absolute;
  top: 50%;
  right: 0.5em;
  transform: translateY(-50%);
  z-index: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 0 0 auto;
`;

export const IconButton = styled.button<{ $active?: boolean }>`
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid
    ${({ $active, theme }) => ($active ? theme.colourPcHead : "var(--border-normal, #8b8b8b)")};
  border-radius: ${({ theme }) => theme.radiusControl};
  background: ${({ $active, theme }) =>
    $active ? theme.colourPcHead : "var(--background-other, #193d5e)"};
  color: ${({ $active, theme }) =>
    $active ? theme.colourTextOnDark : "#fff"};
  cursor: pointer;
  font-size: 0.7rem;

  &:hover {
    filter: brightness(1.12);
  }
`;

export const SheetBody = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0;
`;

export const OverviewTabPanel = styled.div.attrs({ className: "party-overview-tab" })`
  ${scrollTab}
  color: ${({ theme }) => theme.colourTextOnLight};
`;

export const StashTabPanel = styled.div.attrs({ className: "party-stash-tab flexrow" })`
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacingGutter};
  -webkit-overflow-scrolling: touch;
  color: ${({ theme }) => theme.colourTextOnLight};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacingGutter};
  align-items: flex-start;
`;

export const OverviewSubSection = styled.section`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacingGutter};
  flex: 0 0 auto;
`;

export const OverviewSubTabs = styled.nav`
  display: flex;
  align-items: stretch;
  gap: 0;
  background: ${({ theme }) => theme.backgroundRowOdd};
  border-bottom: 2px solid ${({ theme }) => theme.colourPcHead};

  > * {
    align-self: stretch;
  }
`;

export const OverviewSubContent = styled.div.attrs({ className: "party-overview-subcontent" })`
  width: 100%;
  ${panelSurface}
  padding: ${({ theme }) => theme.spacingGutter} ${({ theme }) => theme.spacingCardPad};
  border-top: none;
  border-radius: 0 0 ${({ theme }) => theme.radiusPanel} ${({ theme }) => theme.radiusPanel};
  box-sizing: border-box;
`;

export const MembersSection = styled.section`
  color: ${({ theme }) => theme.colourTextOnLight};

  h2 {
    margin: 0 0 ${({ theme }) => theme.spacingGutter};
    font-size: 0.95em;
    font-weight: 700;
    color: ${({ theme }) => theme.colourHeading};
  }
`;
