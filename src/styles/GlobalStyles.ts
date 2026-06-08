import { createGlobalStyle } from "styled-components";
import { partySheetTheme as t } from "./theme.js";

export const GlobalStyles = createGlobalStyle`
  .application.dnd4e-party-sheet.sheet.fox4e {
    --gradient-4e: ${t.gradient4e};
    --background-row-odd: ${t.backgroundRowOdd};
    --background-row-even: ${t.backgroundRowEven};
    --background-panel: ${t.backgroundPanel};
    --border-muted: ${t.borderMuted};
    --background-other: ${t.colourPcHead};
    --background-item: #d7941d;
  }

  .application.dnd4e-party-sheet {
    --colour-pc-head: ${t.colourPcHead};
    --gradient-4e: ${t.gradient4e};
    --background-row-odd: ${t.backgroundRowOdd};
    --background-row-even: ${t.backgroundRowEven};
    --background-panel: ${t.backgroundPanel};
    --border-muted: ${t.borderMuted};
    --colour-text-inside: ${t.colourTextInside};
    --vitals-gold: ${t.vitalsGold};
    --vitals-gold-light: ${t.vitalsGoldLight};
    font-family: ${t.fontFamily};

    .window-content,
    .party-sheet-react-root,
    .party-sheet-inner {
      color: ${t.colourTextOnLight};
    }

    /* Foundry / fox may force light text; restore contrast on our panels */
    .party-sheet-inner :is(
      .party-overview-tab,
      .party-overview-sidebar,
      .party-member-card,
      .party-skills-block,
      .party-languages-block,
      .party-overview-subcontent,
      .party-stash-main
    ) {
      color: ${t.colourTextOnLight};
    }

    .party-sheet-header {
      color: ${t.colourTextOnDark};
    }

    .window-content {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .party-sheet-react-root {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      height: 100%;
      overflow: hidden;
      background: ${t.gradient4e};
    }
  }

  #actors .party-sheet-folder-btn {
    margin-left: auto;
    padding: 0 0.35em;
    cursor: pointer;
    color: var(--color-text-primary, inherit);

    &:hover {
      color: var(--color-text-hyperlink, #ff6400);
    }
  }
`;
