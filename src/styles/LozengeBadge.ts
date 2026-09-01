import styled, { css } from "styled-components";

/** Pointed lozenge via clip-path. Use drop-shadow — box-shadow is clipped. */
export const lozengeClip = css`
  clip-path: polygon(
    6px 0,
    calc(100% - 6px) 0,
    100% 50%,
    calc(100% - 6px) 100%,
    6px 100%,
    0 50%
  );
`;

/** Solid olive lozenge marking the party-best skill bonus (Figma #938872). */
export const BestValueBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 49px;
  height: 17px;
  padding: 0 10px;
  box-sizing: border-box;
  background: #938872;
  color: ${({ theme }) => theme.colourTextOnLight};
  white-space: nowrap;
  ${lozengeClip}
`;
