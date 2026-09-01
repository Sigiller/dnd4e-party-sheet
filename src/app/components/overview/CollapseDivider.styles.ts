import styled from "styled-components";

export const DividerButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-height: 28px;
  margin: 2px 0;
  padding: 0;
  /* full reset — Foundry core styles buttons inside .application */
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colourFrameLine};

  &:hover,
  &:focus {
    background: transparent;
    border: none;
    box-shadow: none;
    outline: none;
  }

  &:hover {
    filter: brightness(0.85);
  }

  &:focus-visible {
    outline: 1px dashed ${({ theme }) => theme.colourFrameLine};
    outline-offset: 2px;
  }
`;

/** Hairline fading out toward the panel edge (Figma: transparent→#76694E→transparent). */
export const Rule = styled.span<{ $edge: "left" | "right" }>`
  flex: 1 1 auto;
  height: 1px;
  background: ${({ $edge, theme }) =>
    $edge === "left"
      ? `linear-gradient(90deg, transparent, ${theme.colourFrameLine})`
      : `linear-gradient(90deg, ${theme.colourFrameLine}, transparent)`};
`;

export const BadgeStack = styled.span<{ $expanded: boolean }>`
  display: flex;
  flex-direction: ${({ $expanded }) => ($expanded ? "column" : "column-reverse")};
  align-items: center;
  gap: 2px;
  flex: 0 0 auto;
`;

/** Two stacked taper lines forming the subtle arrow (20px over 10px). */
export const TaperArrow = styled.span`
  display: flex;
  flex-direction: inherit;
  align-items: center;
  gap: 2px;

  &::before,
  &::after {
    content: "";
    height: 1px;
    background: currentColor;
  }

  &::before {
    width: 10px;
  }

  &::after {
    width: 20px;
  }
`;

export const Badge = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 13px;
  padding: 0 12px;
`;

export const BadgeOutline = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

export const BadgeLabel = styled.span`
  position: relative;
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 10px;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colourFrameLine};
  white-space: nowrap;
`;
