/* Minimal Foundry globals for module build */
declare const game: Game;
declare const Hooks: typeof Hooks;
declare const CONFIG: Record<string, unknown> & { DND4E: Dnd4eConfig };
declare const CONST: typeof CONST;
declare const foundry: typeof foundry & {
  applications: {
    api: {
      DialogV2: {
        input: (config: object) => Promise<Record<string, unknown> | null | void>;
      };
      Dialog: {
        confirm: (config: object) => Promise<boolean>;
      };
    };
    ux: {
      TextEditor: {
        getDragEventData?: (event: DragEvent) => Record<string, unknown> | null;
        implementation?: { getDragEventData?: (event: DragEvent) => Record<string, unknown> | null };
      };
      DragDrop: new (config: object) => { bind: (el: HTMLElement) => void };
    };
  };
  utils: {
    deepClone: <T>(obj: T) => T;
    escapeHTML: (str: string) => string;
  };
};
declare const Actor: typeof Actor;
declare const Item: typeof Item;
declare const Folder: typeof Folder;

interface Dnd4eConfig {
  currencyConversion: Record<string, { gp: number; each?: number; into?: string }>;
  skills: Record<string, { label?: string }>;
  spoken: Record<string, string>;
  script: Record<string, string>;
  special: Record<string, string>;
  inventoryTypes: Record<string, { label: string }>;
  trainingLevels: Record<number, string>;
}

interface Game {
  actors: Collection<Actor>;
  folders: Collection<Folder>;
  users: Collection<User>;
  user: User | null;
  i18n: { localize: (key: string) => string; format: (key: string, data?: object) => string };
  settings: {
    register: (module: string, key: string, data: object) => void;
    get: (module: string, key: string) => unknown;
  };
  modules: Collection<{ id: string; api?: PartySheetApi }>;
  system: { id: string } | null;
}

interface PartySheetApi {
  openPartySheet: (folderId?: string) => Promise<void>;
  getPartyFolder: () => Folder | undefined;
}

interface User {
  id: string;
  isGM: boolean;
  active: boolean;
  role: number;
  character?: Actor | null;
}

interface Collection<T> {
  get(id: string): T | undefined;
  contents: T[];
  find: (predicate: (doc: T) => boolean) => T | undefined;
  filter: (predicate: (doc: T) => boolean) => T[];
  [Symbol.iterator]?: () => Iterator<T>;
}

interface Actor {
  id: string;
  name: string;
  img: string;
  type: string;
  folder: string | { id: string } | null;
  ownership: Record<string, number>;
  flags: Record<string, Record<string, unknown>>;
  system: Record<string, unknown>;
  items: Collection<Item> & {
    get(id: string): Item | undefined;
  };
  deleteEmbeddedDocuments?: (
    embeddedName: string,
    ids: string[],
    operation?: object
  ) => Promise<Item[]>;
  effects: Collection<{ id: string; name: string; img: string }>;
  getActiveEffects?: () => { name: string; img: string }[];
  allApplicableEffects?: () => Promise<{ name: string; img: string }[]>;
  testUserPermission: (user: User, level: number, options?: object) => boolean;
  update: (data: object) => Promise<Actor>;
  sheet?: {
    rendered: boolean;
    render: (force?: boolean) => Promise<void>;
    bringToFront?: () => void;
  };
}

interface Item {
  id: string;
  name: string;
  img: string;
  type: string;
  uuid?: string;
  actor: Actor | null;
  system: Record<string, unknown>;
  totalWeight?: number;
  container?: Item | null;
  toObject: () => object;
  toDragData?: () => object;
  update: (data: object) => Promise<Item>;
  delete: () => Promise<Item>;
  sheet?: { render: (force?: boolean) => Promise<void> };
}

declare abstract class Item {
  static fromDropData(data: object): Promise<Item | undefined>;
  static createDocuments(docs: object[], options?: { parent?: Actor }): Promise<Item[]>;
}

declare abstract class Actor {
  static createDocuments(docs: object[], options?: { parent?: null }): Promise<Actor[]>;
}

declare const ui: {
  notifications?: { warn: (msg: string, opts?: object) => void };
  sidebar?: { tabs?: { actors?: { rendered: boolean; render: (force?: boolean) => void } } };
};

interface Folder {
  id: string;
  name: string;
  type: string;
  folder: string | { id: string } | null;
  flags: Record<string, Record<string, unknown>>;
  update: (data: object) => Promise<Folder>;
}

declare namespace Hooks {
  function once(event: string, fn: (...args: unknown[]) => void): void;
  function on(event: string, fn: (...args: unknown[]) => void): number;
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

declare const libWrapper: LibWrapper;
