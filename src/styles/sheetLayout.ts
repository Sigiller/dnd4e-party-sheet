import styled from "styled-components";

export const SheetInner = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  background: ${({ theme }) => theme.colourPcHead};
`;

/** Small uppercase section label (Figma: "SKILLS", "LANGUAGES", "PARTY MEMBERS"). */
export const SectionHeading = styled.h3`
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: ${({ theme }) => theme.colourHeading};
  border: none;
`;

export const OverviewTabPanel = styled.div.attrs({ className: "party-overview-tab" })`
  flex: 1 0 auto;
  padding: ${({ theme }) => theme.spacingGutter};
  color: ${({ theme }) => theme.colourTextOnLight};
`;

export const StashTabPanel = styled.div.attrs({ className: "party-stash-tab flexrow" })`
  flex: 1 0 auto;
  padding: ${({ theme }) => theme.spacingGutter};
  color: ${({ theme }) => theme.colourTextOnLight};
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: ${({ theme }) => theme.spacingGutter};
  align-items: flex-start;

  /* fox-4e-styling sets .flexrow > * { flex: unset } on all .sheet.fox4e apps */
  > .party-overview-sidebar {
    flex: 0 0 180px;
    width: 180px;
    max-width: 180px;
  }

  > .party-stash-main {
    flex: 1 1 auto;
    min-width: 0;
  }
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

export const MembersSection = styled.section`
  color: ${({ theme }) => theme.colourTextOnLight};

  h2 {
    margin: 0 0 ${({ theme }) => theme.spacingGutter};
    font-size: 14px;
    font-weight: 700;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: ${({ theme }) => theme.colourHeading};
    border: none;
  }
`;
