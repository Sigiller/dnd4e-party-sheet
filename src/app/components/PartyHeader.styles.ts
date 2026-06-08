import styled from "styled-components";

export const Header = styled.header.attrs({ className: "party-sheet-header" })`
  flex: 0 0 auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1em;
  padding: 0.75em 1em;
  background: ${({ theme }) => theme.colourPcHead};
  color: ${({ theme }) => theme.colourTextOnDark};
`;

export const EmblemButton = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;

  img {
    object-fit: cover;
    border-radius: 4px;
  }
`;

export const NameInput = styled.input`
  font-size: 1.4em;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: ${({ theme }) => theme.colourTextOnDark};
  padding: 0.25em 0.5em;
  min-width: 200px;
`;

export const LevelBlock = styled.div`
  margin-left: auto;
  text-align: right;
`;

export const LevelLabel = styled.span`
  display: block;
  font-size: 0.75em;
  opacity: 0.85;
`;

export const LevelValue = styled.span`
  font-size: 1.5em;
  font-weight: bold;
`;
