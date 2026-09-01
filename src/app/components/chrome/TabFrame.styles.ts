import styled from "styled-components";
import { CONTENT_TOP, TAB_RAISE } from "./tabFrameGeometry.js";

export const Frame = styled.div.attrs({ className: "party-tab-frame" })`
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  /* Tongues overlap the banner's lower edge (Figma: tabs at y=74 under a 105px header) */
  margin-top: -${TAB_RAISE}px;
  overflow: visible;
`;

export const ChromeSvg = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  pointer-events: none;
  overflow: visible;
`;

export const ScrollRegion = styled.div.attrs({ className: "party-tab-scroll" })`
  position: absolute;
  top: ${CONTENT_TOP}px;
  left: 4px;
  right: 4px;
  bottom: 4px;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
`;

export const TabList = styled.nav`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${CONTENT_TOP}px;
  display: flex;
  pointer-events: none;
`;

export const TabHit = styled.button<{ $active?: boolean }>`
  flex: 1 1 50%;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  margin: 0;
  padding: 4px 0 0;
  /* full reset — Foundry core styles buttons inside .application */
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  cursor: pointer;
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  line-height: 1;
  color: ${({ $active, theme }) => ($active ? theme.colourHeading : "rgba(5, 62, 98, 0.72)")};

  &:hover,
  &:focus {
    background: transparent;
    border: none;
    box-shadow: none;
    outline: none;
    color: ${({ theme }) => theme.colourHeading};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colourCream};
    outline-offset: -4px;
  }
`;
