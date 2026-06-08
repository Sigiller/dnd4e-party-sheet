import styled from "styled-components";

export const HpSurgeBar = styled.div.attrs({ className: "hp-surge-bar" })`
  position: relative;
  height: 1.4em;
  margin-top: 0.35em;
  background: rgba(0, 0, 0, 0.15);
  border-radius: ${({ theme }) => theme.radiusBadge};
  overflow: hidden;

  span {
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
  font-size: 0.75em;
  line-height: 1.4em;
  padding: 0 0.35em;
  color: #fff;
  text-shadow: 0 0 2px #000;
  float: ${({ $side }) => $side};
`;
