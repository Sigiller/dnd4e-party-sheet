import { MODULE_ID } from "../../../constants.js";
import { localize as loc } from "../../../i18n.js";
import type { LanguageEntry } from "../../../party/party-data.js";
import { LanguageGroup, LanguageList, LanguagesBlock } from "./PartyLanguages.styles.js";

interface PartyLanguagesProps {
  languages: { spoken: LanguageEntry[]; script: LanguageEntry[] };
}

function LanguageListSection({ title, entries }: { title: string; entries: LanguageEntry[] }) {
  return (
    <LanguageGroup>
      <h4>{title}</h4>
      <LanguageList>
        {entries.map((lang) => (
          <li key={lang.key} data-tooltip={lang.owners.join(", ")}>
            {lang.label}
          </li>
        ))}
      </LanguageList>
    </LanguageGroup>
  );
}

export function PartyLanguages({ languages }: PartyLanguagesProps) {
  const localize = (key: string) => loc(`${MODULE_ID}.${key}`);

  return (
    <LanguagesBlock>
      <LanguageListSection title={localize("sheet.languages.spoken")} entries={languages.spoken} />
      <LanguageListSection title={localize("sheet.languages.script")} entries={languages.script} />
    </LanguagesBlock>
  );
}
