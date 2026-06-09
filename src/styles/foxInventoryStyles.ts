import { createGlobalStyle } from "styled-components";

/** Mirrors fox-4e-styling PC inventory list rules for the party stash panel. */
export const FoxInventoryStyles = createGlobalStyle`
  .application.dnd4e-party-sheet.sheet.fox4e .party-fox-inventory-host .tab.inventory {
    overflow-x: hidden;
    padding-right: 0.25em;
    padding-top: 0.25em;

    h2.tab-title {
      font-size: 1.5em;
      text-transform: uppercase;
      font-weight: 800;
      color: #193d5e;
      padding: 0.1em 0.25em 0.25em 0;
      line-height: 1;
      text-shadow: -0.02em -0.02em #fff;
      margin: 0 0 0.5em;
    }

    .item-list.gear,
    .item-list.gear .item-group,
    .item-list.gear .items-list,
    .item-list.gear .item.gear {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .item-list.gear .items-header {
      text-transform: uppercase;
      font-size: 0.75em;
      text-align: center;
      font-weight: 600;
      margin-top: 1em;
      background: var(--background-other, #193d5e);
      color: #fff;
      align-items: center;
      padding: 0.2rem 0.45rem 0.2rem 0.3rem;
      line-height: 1;
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      gap: 0.3rem;
    }

    .item-list.gear .items-header .group-name {
      font-weight: 600;
      line-height: 1;
      color: #fff;
      font-size: 1em;
      text-align: left;
      flex: 1 1 auto;
      min-width: 0;
      margin: 0;
    }

    .item-list.gear :is(.item .item-header, .items-header) .item-name {
      flex: 1 1 auto;
      min-width: 0;
    }

    .item-list.gear :is(.item .item-header, .items-header) .item-uses {
      flex: 60px 0 0;
      white-space: nowrap;
    }

    .item-list.gear :is(.item .item-header, .items-header) .item-slot {
      flex: 65px 0 0;
      white-space: nowrap;
      text-align: left;
    }

    .item-list.gear :is(.item .item-header, .items-header) .item-level {
      flex: 25px 0 0;
      white-space: nowrap;
      text-align: right;
    }

    .item-list.gear :is(.item .item-header, .items-header) .item-price {
      flex: 40px 0 0;
      white-space: nowrap;
      text-align: right;
    }

    .item-list.gear :is(.item .item-header, .items-header) .item-weight {
      flex: 40px 0 0;
      white-space: nowrap;
      text-align: right;
    }

    .item-list.gear :is(.item .item-header, .items-header) .item-quantity {
      flex: 30px 0 0;
      white-space: nowrap;
      text-align: right;
    }

    .item-list.gear :is(.item .item-header, .items-header) .item-controls {
      flex: 50px 0 0;
      text-align: right;
    }

    .item-list.gear .item-controls {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: flex-end;
      gap: 0.15rem;
    }

    .item-list.gear .item-controls a {
      cursor: pointer;
      color: inherit;
      text-decoration: none;
    }

    .item-list.gear .item-controls a .fas:is(:focus, :active, :hover) {
      opacity: 1;
    }

    .item-list.gear .item-controls a:not(.active, :focus, :active, :hover) .fas {
      opacity: 0.3;
    }

    .item-list.gear .item:not(.collapsed) .item-controls a .fas {
      opacity: 1;
    }

    .item-list.gear .item {
      align-items: center;
    }

    .item-list.gear .item.gear:nth-child(even) .item-header {
      background: var(--background-row-even, #dddcdb);
    }

    .item-list.gear .item.gear:nth-child(odd) .item-header {
      background: var(--background-row-odd, #d3d1ba);
    }

    /* Collapsed stash rows stay on beige/white stripes — dark text */
    .item-list.gear .item.gear.collapsed .item-header,
    .item-list.gear .item.gear.collapsed .item-header h4,
    .item-list.gear .item.gear.collapsed .item-header .item-detail {
      color: #221f1f;
    }

    .item-list.gear .item.gear:not(.collapsed) .item-header {
      background: var(--background-item, #d7941d);
      color: #fff;
    }

    .item-list.gear .item.gear:not(.collapsed) .item-header h4,
    .item-list.gear .item.gear:not(.collapsed) .item-header .item-detail {
      color: #fff;
    }

    .item-list.gear .item.gear.loot:not(.collapsed) .item-header {
      background: #5b1e34;
    }

    .item-list.gear .item .item-header {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      gap: 0.3rem;
      align-items: center;
      border: unset;
      padding: 0 0.45rem 0 0;
      width: 100%;
      box-sizing: border-box;
    }

    .item-list.gear .item-name.rollable h4 {
      cursor: url("/modules/fox-4e-styling/images/cursor_view.svg"), auto;
    }

    .item-list.gear .item.collapsible .item-header .item-detail {
      cursor: url("/modules/fox-4e-styling/images/cursor_view.svg"), auto;
    }

    .item-list.gear .item-image.roll-d20 {
      cursor: url("/modules/fox-4e-styling/images/cursor_roll-d20.svg"), auto;
    }

    .item-list.gear .item-summary {
      table {
        border: unset;
        color: #000;

        :is(td, th) {
          padding: 2px 5px;
        }

        &:not(.power, .item, .hazard, .monster) thead {
          background: #193d5e;
          color: #fff;
        }

        &:not(.power, .item, .hazard, .monster) tr:not(:first-child) {
          border-top: 1px solid #fff;
        }

        &:not(.power, .item, .hazard, .monster) tr:not(:last-child) {
          border-bottom: 1px solid #fff;
        }

        &:not(.power, .item, .hazard, .monster) tbody:not(:first-child) tr {
          border-top: 1px solid #fff;
          border-bottom: 1px solid #fff;
        }

        &:not(.power, .item, .hazard, .monster) td {
          border: none;
        }

        &:not(.power, .item, .hazard, .monster) tr:nth-child(odd) {
          background: var(--background-row-odd, #d3d1ba);
        }

        &:not(.power, .item, .hazard, .monster) tr:nth-child(even) {
          background: var(--background-row-even, #dddcdb);
        }

        &:not(.power, .item, .hazard, .monster) tfoot {
          font-size: 0.85em;
        }
      }
    }

    .item-list.gear .item-card .item-summary .card-content {
      background: var(--gradient-4e);

      p {
        padding: 0.1em 0.3em;
      }

      :is(h1, h2, h3, h4, h5) {
        font-family: "DragonBodySans", system-ui, sans-serif;
        margin: 0;
        padding: 0.1em 0.3em;
        font-weight: 500;
        color: #000;
      }

      .flavour-text,
      .chat-flavour,
      .flavour {
        font-style: oblique;
      }

      .indent {
        padding: 0.1em 0.3em 0.1em 1em;
      }

      table:not(.power, .item, .hazard, .monster) {
        margin: 0.5em 0;
        border: 0.3em solid rgba(255, 255, 255, 0);
      }

      :is(ul, ol) {
        padding: 0 0 0 2em;

        li {
          margin-bottom: 0.1em;
        }
      }

      ul {
        list-style-type: none;
        position: relative;

        li::before {
          display: block;
          margin-left: -1em;
          margin-right: 0.4em;
          font-size: 1em;
          content: "\\2726";
          position: absolute;
          color: inherit;
        }
      }

      a.content-link,
      a.inline-roll {
        border: 0;
        background: 0;
        padding: 0;
        text-decoration: underline;
        text-decoration-style: dotted;
        text-indent: 0;
        white-space: initial;
        word-break: initial;
        color: #5d1232;
      }

      a.inline-roll {
        font-weight: 700;
      }

      a.inline-result i {
        display: none;
      }

      a.inline-roll i {
        text-indent: 0;
        margin-right: 1px;
      }
    }

    .item-list.gear .item-card:is(.weapon-card, .equipment-card, .consumable-card, .tool-card, .backpack-card)
      .item-summary
      .card-content {
      background: #f6e8d3;

      .flavour {
        background: var(--gradient-4e-item, linear-gradient(90deg, #eed4ad 0%, #fff 100%));
      }

      p.subheading,
      .item-details > span,
      hr + p:not(.flavour) {
        background: #eccc9a;
      }

      p.basics + p.basics {
        padding-top: 0;
      }

      .ac-scale {
        background: #f6e8d3;
        columns: 3;
      }

      .ac-scale p.base-ac {
        flex-basis: calc(100% / 3 - 0.3em);
        background: unset;
      }

      .base-ac > strong {
        display: inline-block;
        min-width: 3em;
      }

      p.subheading + p {
        padding: 0.1em 0.3em 0.1em 1em;
        text-indent: -0.7em;
      }
    }

    .item-list.gear .item.depleted .item-header > * {
      opacity: 0.5;
    }

    .item-list.gear .item.depleted .item-header .item-image {
      filter: grayscale(1) contrast(0.75);
      opacity: 1;
    }

    .item-list.gear .item.collapsible.collapsed:not(:last-child) {
      border-bottom: 1px solid #fff;
    }

    .item-list.gear .item-image {
      flex: 26px 0 0;
      text-align: center;
    }

    .item-list.gear .item-image img {
      display: block;
      height: 26px;
      width: 26px;
      border: unset;
      border-radius: 0;
    }

    .item-list.gear .item-name h4 {
      font-weight: 600;
      line-height: 1;
      font-size: 1em;
      white-space: normal;
      margin: 0;
      color: inherit;
    }

    .item-list.gear .item-detail {
      text-transform: uppercase;
      text-align: center;
      font-size: 0.7rem;
      color: inherit;
    }

    .item-list.gear .item .item-uses {
      white-space: nowrap;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.2em;
      font-size: 0.75rem;
    }

    .item-list.gear .collapsible.collapsed .collapsible-content {
      grid-template-rows: 0fr;
    }

    .item-list.gear .collapsible-content {
      display: grid;
      grid-template-rows: 1fr;
      transition: all 250ms ease;
    }

    .item-list.gear .collapsible-content > .wrapper {
      overflow: hidden;
    }
  }
`;
