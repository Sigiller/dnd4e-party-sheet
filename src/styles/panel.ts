import { css } from "styled-components";

/** Translucent parchment wash with the frame-line border (Figma card surface). */
export const panelSurface = css`
  background: ${({ theme }) => theme.cardSurface};
  border: 1px solid ${({ theme }) => theme.borderCard};
  color: ${({ theme }) => theme.colourTextOnLight};
`;

/** Elevated card: wash surface + container shadow. Sharp corners per design. */
export const cardSurface = css`
  ${panelSurface}
  box-shadow: ${({ theme }) => theme.shadowCard};
`;
