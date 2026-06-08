import styled, { css } from "styled-components";
import { MODULE_ID } from "../../constants.js";
import { openActorSheet } from "../../party/open-actor-sheet.js";

const ActorNameButton = styled.button<{ $variant?: "heading" | "tableHeader" }>`
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-weight: inherit;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  ${({ $variant, theme }) =>
    $variant === "tableHeader"
      ? css`
          color: inherit;
          text-transform: inherit;
          line-height: inherit;
        `
      : css`
          color: ${theme.colourHeading};
          text-align: left;
        `}
`;

interface ActorNameLinkProps {
  actorId: string;
  children: string;
  variant?: "heading" | "tableHeader";
  className?: string;
}

export function ActorNameLink({
  actorId,
  children,
  variant = "heading",
  className,
}: ActorNameLinkProps) {
  const title = game.i18n.localize(`${MODULE_ID}.sheet.members.openActorSheet`);

  return (
    <ActorNameButton
      type="button"
      className={className}
      $variant={variant}
      title={title}
      data-tooltip={title}
      onClick={() => {
        void openActorSheet(actorId);
      }}
    >
      {children}
    </ActorNameButton>
  );
}
