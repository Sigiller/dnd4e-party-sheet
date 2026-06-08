import type { KeyboardEvent } from "react";
import styled from "styled-components";
import { MODULE_ID } from "../../constants.js";
import { openActorSheet } from "../../party/open-actor-sheet.js";

const ActorNameHeading = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colourHeading};
  cursor: pointer;
`;

const ActorNameTableLabel = styled.span`
  cursor: pointer;
`;

interface ActorNameLinkProps {
  actorId: string;
  children: string;
  variant?: "heading" | "tableHeader";
  className?: string;
}

function openSheet(actorId: string): void {
  void openActorSheet(actorId);
}

function handleKeyActivate(event: KeyboardEvent, actorId: string): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openSheet(actorId);
  }
}

export function ActorNameLink({
  actorId,
  children,
  variant = "heading",
  className,
}: ActorNameLinkProps) {
  const title = game.i18n.localize(`${MODULE_ID}.sheet.members.openActorSheet`);

  if (variant === "tableHeader") {
    return (
      <ActorNameTableLabel
        className={className}
        role="button"
        tabIndex={0}
        title={title}
        data-tooltip={title}
        onClick={() => openSheet(actorId)}
        onKeyDown={(event) => handleKeyActivate(event, actorId)}
      >
        {children}
      </ActorNameTableLabel>
    );
  }

  return (
    <ActorNameHeading
      className={className}
      role="button"
      tabIndex={0}
      title={title}
      data-tooltip={title}
      onClick={() => openSheet(actorId)}
      onKeyDown={(event) => handleKeyActivate(event, actorId)}
    >
      {children}
    </ActorNameHeading>
  );
}
