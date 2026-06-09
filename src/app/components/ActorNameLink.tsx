import type { KeyboardEvent } from "react";
import styled from "styled-components";
import { MODULE_ID } from "../../constants.js";
import {
  DND4E_ACTOR_INVENTORY_TAB,
  type OpenActorSheetOptions,
  openActorSheet,
} from "../../party/open-actor-sheet.js";

const ActorNameHeading = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colourHeading};
  cursor: pointer;
`;

const ActorNameSidebar = styled.h4`
  margin: 0 0 0.25em;
  font-size: 0.8em;
  font-weight: 400;
  color: ${({ theme }) => theme.colourTextInside};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colourHeading};
  }
`;

const ActorNameTableLabel = styled.span`
  cursor: pointer;
`;

const PortraitButton = styled.button`
  display: block;
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  cursor: pointer;
  line-height: 0;
  flex-shrink: 0;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colourHeading};
    outline-offset: 2px;
  }
`;

interface ActorNameLinkProps {
  actorId: string;
  children: string;
  variant?: "heading" | "tableHeader" | "sidebar";
  sheetOptions?: OpenActorSheetOptions;
  className?: string;
}

function openSheet(actorId: string, sheetOptions?: OpenActorSheetOptions): void {
  void openActorSheet(actorId, sheetOptions);
}

function handleKeyActivate(
  event: KeyboardEvent,
  actorId: string,
  sheetOptions?: OpenActorSheetOptions
): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openSheet(actorId, sheetOptions);
  }
}

function tooltipKey(sheetOptions?: OpenActorSheetOptions): string {
  if (sheetOptions?.tab === DND4E_ACTOR_INVENTORY_TAB.tab) {
    return `${MODULE_ID}.sheet.members.openActorSheetInventory`;
  }
  return `${MODULE_ID}.sheet.members.openActorSheet`;
}

export function ActorNameLink({
  actorId,
  children,
  variant = "heading",
  sheetOptions,
  className,
}: ActorNameLinkProps) {
  const title = game.i18n.localize(tooltipKey(sheetOptions));

  if (variant === "tableHeader") {
    return (
      <ActorNameTableLabel
        className={className}
        role="button"
        tabIndex={0}
        title={title}
        data-tooltip={title}
        onClick={() => openSheet(actorId, sheetOptions)}
        onKeyDown={(event) => handleKeyActivate(event, actorId, sheetOptions)}
      >
        {children}
      </ActorNameTableLabel>
    );
  }

  if (variant === "sidebar") {
    return (
      <ActorNameSidebar
        className={className}
        role="button"
        tabIndex={0}
        title={title}
        data-tooltip={title}
        onClick={() => openSheet(actorId, sheetOptions)}
        onKeyDown={(event) => handleKeyActivate(event, actorId, sheetOptions)}
      >
        {children}
      </ActorNameSidebar>
    );
  }

  return (
    <ActorNameHeading
      className={className}
      role="button"
      tabIndex={0}
      title={title}
      data-tooltip={title}
      onClick={() => openSheet(actorId, sheetOptions)}
      onKeyDown={(event) => handleKeyActivate(event, actorId, sheetOptions)}
    >
      {children}
    </ActorNameHeading>
  );
}

interface ActorPortraitLinkProps {
  actorId: string;
  src: string;
  width?: number;
  height?: number;
  className?: string;
  sheetOptions?: OpenActorSheetOptions;
}

export function ActorPortraitLink({
  actorId,
  src,
  width = 36,
  height = 36,
  className,
  sheetOptions,
}: ActorPortraitLinkProps) {
  const title = game.i18n.localize(tooltipKey(sheetOptions));

  return (
    <PortraitButton
      type="button"
      className={className}
      title={title}
      data-tooltip={title}
      onClick={() => openSheet(actorId, sheetOptions)}
      onKeyDown={(event) => handleKeyActivate(event, actorId, sheetOptions)}
    >
      <img src={src} alt="" width={width} height={height} />
    </PortraitButton>
  );
}
