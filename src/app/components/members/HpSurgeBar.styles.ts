import styled from "styled-components";

/** Maroon HP strip tucked under the portrait (Figma "HP Bar" 328:10132). */
export const HpSurgeBar = styled.div.attrs({ className: "hp-surge-bar" })`
  position: relative;
  z-index: 1;
  width: ${({ theme }) => theme.portraitSize};
  height: ${({ theme }) => theme.hpBarHeight};
  box-sizing: border-box;
  background: ${({ theme }) => theme.colourHpBar};
  border: 1px solid ${({ theme }) => theme.colourHpBarBorder};
  border-radius: ${({ theme }) => theme.radiusBadge};
  overflow: hidden;
  filter: drop-shadow(0 3px 2px rgba(0, 0, 0, 0.1));

  /* && beats the member card's blanket "span, li { color: inherit }" rule */
  && span {
    color: #fff;
    text-shadow: 0 0 2px #000;
  }
`;

export const HpFill = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: #8b244b;
  opacity: 0.55;
  transition: width 0.2s;
`;

export const HpLabel = styled.span<{ $side: "left" | "right" }>`
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 100%;
  font-size: 10px;
  letter-spacing: -0.5px;
  padding: 0 4px;
  float: ${({ $side }) => $side};

  && {
    color: #fff;
    text-shadow: 0 0 2px #000;
  }
`;
