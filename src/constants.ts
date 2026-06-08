export const MODULE_ID = "dnd4e-party-sheet";

export const FLAG_SCOPE = MODULE_ID;

export interface PartyFolderFlags {
  emblem?: string;
  displayName?: string;
  stashActorId?: string;
}

export interface StashActorFlags {
  isStash?: boolean;
  partyFolderId?: string;
}

export const STASH_ACTOR_NAME = "Party Stash";

export const TRAINING_TRAINED = 5;
