import styled from "styled-components";
import { textOnLightSurface } from "../../../styles/contrast.js";

export const SkillsBlock = styled.div.attrs({ className: "party-skills-block" })`
  width: 100%;
  overflow-x: auto;
  ${textOnLightSurface}
  margin-bottom: 12px;
`;

export const SkillsTable = styled.table.attrs({ className: "skills" })`
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 12px;
  border-collapse: collapse;
  border: none;
  margin: 2px 0 0.5rem;
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
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      border: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
      border-bottom: 0;

      /* Design zebra: light ivory rows over the bare parchment panel */
      &:nth-child(odd) {
        background: ${({ theme }) => theme.tabInactiveBase};
      }

      &:nth-child(even) {
        background: transparent;
      }
    }
  }

  tr,
  td {
    border: 0;
  }

  th,
  td {
    padding: 0.3em 0.6em;
    color: inherit;
  }

  :is(th, td).skill-title {
    padding: 0.3em 0.25em 0.3em 5px;
    text-align: left;
    vertical-align: middle;
  }

  h4.skill-name {
    font-size: 1em;
    margin: 0;
    font-weight: inherit;
    color: inherit;
  }

  .skill-value {
    text-align: center;
    vertical-align: middle;
  }
`;
