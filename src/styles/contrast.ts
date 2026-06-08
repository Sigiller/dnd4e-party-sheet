import { css } from "styled-components";

/** Shared readable text on white / beige module surfaces */
export const textOnLightSurface = css`
  color: ${({ theme }) => theme.colourTextOnLight};

  h2,
  h3,
  h4,
  p,
  span,
  li,
  td,
  th,
  label {
    color: inherit;
  }

  h2,
  h3,
  h4.subgroup-title {
    color: ${({ theme }) => theme.colourHeading};
  }
`;
