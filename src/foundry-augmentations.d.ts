import type { PartyFolderFlags, StashActorFlags } from "./constants.js";

export interface PartySheetApi {
  openPartySheet: (folderId?: string) => Promise<void>;
  getPartyFolder: () => Folder.Implementation | undefined;
}

interface LibWrapper {
  register: (
    packageId: string,
    target: string,
    fn: (...args: unknown[]) => unknown,
    type: string,
    options?: { perf_mode?: string }
  ) => void;
  WRAPPER: string;
  MIXED: string;
  PERF_NORMAL: string;
}

declare global {
  interface CONFIG {
    DND4E: {
      currencies: Record<string, string>;
      currencyConversion: Record<string, { gp: number; each?: number; into?: string }>;
      skills: Record<string, { label?: string }>;
      spoken: Record<string, string>;
      script: Record<string, string>;
      special: Record<string, string>;
      inventoryTypes: Record<string, { label: string }>;
      trainingLevels: Record<number, string>;
    };
    Actor: {
      sheetClasses?: Record<
        string,
        Record<string, { cls?: { prototype?: object; name?: string } }>
      >;
      dataModels?: Record<string, unknown>;
    } & Record<string, unknown>;
  }

  const libWrapper: LibWrapper;
}

declare module "fvtt-types/configuration" {
  export interface ModuleConfig {
    "dnd4e-party-sheet": {
      api?: PartySheetApi;
    };
  }

  export interface SettingConfig {
    "dnd4e-party-sheet.partyFolderName": string;
    "dnd4e-party-sheet.allowPlayerStashCurrency": boolean;
    "dnd4e-party-sheet.stashChatLog": boolean;
    "dnd4e-xp-award.partyFolderName": string;
    "dnd4e.itemDeleteConfirmation": boolean;
  }

  export interface FlagConfig {
    Folder: {
      "dnd4e-party-sheet": PartyFolderFlags;
    };
    Actor: {
      "dnd4e-party-sheet": StashActorFlags;
    };
  }
}

export {};
