import { css } from "styled-components";

/** Shared panel surface (Overview sub-content, sidebar). */
export const panelSurface = css`
  background: ${({ theme }) => theme.backgroundPanel};
  border: 1px solid ${({ theme }) => theme.borderMuted};
  color: ${({ theme }) => theme.colourTextOnLight};
`;

/** Elevated card (member cards, sidebar shell). */
export const cardSurface = css`
  ${panelSurface}
  border-radius: ${({ theme }) => theme.radiusCard};
  box-shadow: ${({ theme }) => theme.shadowCard};
`;
