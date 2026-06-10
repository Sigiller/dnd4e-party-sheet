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
  onNameChange: (name: string) => void;
  onEmblemClick: () => void;
}

export function PartyHeader({ flags, partyLevel, onNameChange, onEmblemClick }: PartyHeaderProps) {
  const localize = (key: string) => loc(`${MODULE_ID}.${key}`);
  const [name, setName] = useState(flags.displayName ?? "");

  useEffect(() => {
    setName(flags.displayName ?? "");
  }, [flags.displayName]);

  return (
    <Header>
      <EmblemButton type="button" onClick={onEmblemClick} title={localize("sheet.emblem")}>
        <img src={flags.emblem || "icons/svg/castle.svg"} alt="" width={64} height={64} />
      </EmblemButton>
      <div className="party-title-block flexcol">
        <NameInput
          type="text"
          value={name}
          placeholder={localize("sheet.partyName")}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => onNameChange(name)}
        />
      </div>
      <LevelBlock>
        <LevelLabel>{localize("sheet.partyLevel")}</LevelLabel>
        <LevelValue>{partyLevel}</LevelValue>
      </LevelBlock>
    </Header>
  );
}
