import styled from "styled-components";

/**
 * Navy banner: grayscale wood texture multiplied over the navy base, plus a
 * wide elliptical vignette (transparent centre near the title, dark edges) —
 * both taken verbatim from the Figma header node 440:1071.
 */
export const Header = styled.header.attrs({ className: "party-sheet-header" })`
  position: relative;
  flex: 0 0 auto;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 15px;
  height: 105px;
  padding: 0 30px 34px 31px;
  background-color: ${({ theme }) => theme.colourPcHead};
  background-image:
    radial-gradient(386px 41px at 225px 37px, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%),
    url("${({ theme }) => theme.textureWood}");
  background-repeat: no-repeat, repeat-x;
  background-size: auto, auto 100%;
  background-blend-mode: normal, multiply;
  color: ${({ theme }) => theme.colourTextOnDark};
`;

export const EmblemButton = styled.button`
  position: relative;
  flex: 0 0 auto;
  width: 64px;
  height: 64px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;

  img {
    display: block;
    width: 64px;
    height: 64px;
    object-fit: cover;
  }

  /* Ornate plaque frame overlaying the emblem (Figma "Subtract" 58x63 at +3,-2) */
  svg {
    position: absolute;
    top: -2px;
    left: 3px;
    pointer-events: none;
  }
`;

export const NameInput = styled.input.attrs({ className: "party-title-block" })`
  flex: 1 1 auto;
  min-width: 120px;
  font-family: ${({ theme }) => theme.fontFamilyHead};
  font-size: 28px;
  font-weight: 500;
  color: ${({ theme }) => theme.colourTextOnDark};
  text-shadow: 0 0 7px #000;
  text-overflow: ellipsis;
  background: transparent;
  border: 1px solid transparent;
  padding: 0.15em 0.3em;
  align-self: center;

  &:hover,
  &:focus {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: none;
  }
`;

export const LevelBlock = styled.div`
  margin-left: auto;
  flex: 0 0 auto;
  text-align: right;
  align-self: center;
`;

export const LevelLabel = styled.span`
  display: block;
  font-size: 10px;
  line-height: 1.3;
  opacity: 0.9;
`;

export const LevelValue = styled.span`
  display: block;
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: 20px;
  font-weight: 700;
  line-height: 1.1;
`;
