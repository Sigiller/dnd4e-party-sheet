import styled from "styled-components";
import { textOnLightSurface } from "../../../styles/contrast.js";
import { cardSurface } from "../../../styles/panel.js";

export const MemberCard = styled.article.attrs({ className: "party-member-card" })`
  display: flex;
  flex-direction: row;
  ${cardSurface}
  padding: ${({ theme }) => theme.spacingCardPad};
  margin-bottom: ${({ theme }) => theme.spacingGutter};
  gap: ${({ theme }) => theme.spacingCardPad};
  align-items: flex-start;
  ${textOnLightSurface}

  .image-frame img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    object-position: top center;
    border-radius: 6px;
    border: 2px solid ${({ theme }) => theme.colourPcHead};
  }

  .hp-surge-bar span {
    color: #fff;
    text-shadow: 0 0 2px #000;
  }
`;

export const MemberSubtitle = styled.p`
  margin: 0.15em 0 0.5em;
  font-size: 0.9em;
  color: ${({ theme }) => theme.colourTextInside};
`;

export const DefencesRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.75em;
  flex-wrap: wrap;
  align-items: center;
  font-size: 0.9em;
  color: ${({ theme }) => theme.colourTextOnLight};

  .defences-block span {
    margin-right: 0.5em;
  }

  .effects-block img {
    border-radius: 3px;
    cursor: help;
  }
`;

export const MemberSkills = styled.ol`
  list-style: none;
  margin: 0.5em 0 0;
  padding: 0;
  display: inline;

  li {
    display: inline;

    .name {
      color: ${({ theme }) => theme.colourAccentOnLight};
    }

    .bonus {
      color: ${({ theme }) => theme.colourTextOnLight};
    }

    &::after {
      content: ", ";
    }

    &:last-child::after {
      content: "";
    }
  }
`;
