import { useEffect, useState } from "react";
import { MODULE_ID, type PartyFolderFlags } from "../../constants.js";
import { localize as loc } from "../../i18n.js";
import {
  EmblemButton,
  Header,
  LevelBlock,
  LevelLabel,
  LevelValue,
  NameInput,
} from "./PartyHeader.styles.js";

interface PartyHeaderProps {
  flags: PartyFolderFlags;
  partyLevel: number;
  canEdit: boolean;
  onNameChange: (name: string) => void;
  onEmblemClick: () => void;
}

export function PartyHeader({
  flags,
  partyLevel,
  canEdit,
  onNameChange,
  onEmblemClick,
}: PartyHeaderProps) {
  const localize = (key: string) => loc(`${MODULE_ID}.${key}`);
  const [name, setName] = useState(flags.displayName ?? "");

  useEffect(() => {
    setName(flags.displayName ?? "");
  }, [flags.displayName]);

  const commitName = () => {
    if (name === (flags.displayName ?? "")) return;
    onNameChange(name);
  };

  return (
    <Header>
      <EmblemButton
        type="button"
        onClick={onEmblemClick}
        disabled={!canEdit}
        title={localize("sheet.emblem")}
      >
        <img src={flags.emblem || "icons/svg/castle.svg"} alt="" width={64} height={64} />
        {/* Plaque frame from Figma node 440:1079: 1px line with bottom-corner scoops */}
        <svg width="58" height="63" viewBox="0 0 58 63" fill="none" aria-hidden="true">
          <path
            d="M57.5 0.5V57C54.4 57 52 59.4 52 62.5H6C6 59.4 3.6 57 0.5 57V0.5Z"
            stroke="#76694e"
          />
        </svg>
      </EmblemButton>
      <NameInput
        type="text"
        value={name}
        placeholder={localize("sheet.partyName")}
        readOnly={!canEdit}
        onChange={(e) => setName(e.target.value)}
        onBlur={commitName}
      />
      <LevelBlock>
        <LevelLabel>{localize("sheet.partyLevel")}</LevelLabel>
        <LevelValue>{partyLevel}</LevelValue>
      </LevelBlock>
    </Header>
  );
}
