import { MODULE_ID } from "../constants.js";
import type { Actor } from "../foundry-globals.js";
import { handleStashItemDropOnActor } from "./stash-transfer.js";

type ActorSheet4eClass = {
  name: string;
  prototype: { _onDropItem: (event: DragEvent, data: object) => Promise<unknown> };
};

function libWrapperIndexKey(key: string): string {
  const escaped = key.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `["${escaped}"]`;
}

function sheetClassTarget(actorType: string, sheetId: string, method: string): string {
  const typeKey = /^[A-Za-z_][\w$]*$/.test(actorType)
    ? `.${actorType}`
    : libWrapperIndexKey(actorType);
  return `CONFIG.Actor.sheetClasses${typeKey}${libWrapperIndexKey(sheetId)}.cls.prototype.${method}`;
}

function isDnd4eActorSheetClass(
  cls: { prototype?: object } | undefined,
  ActorSheet4e: ActorSheet4eClass
): boolean {
  return Boolean(cls?.prototype && ActorSheet4e?.prototype && cls.prototype instanceof ActorSheet4e);
}

function getActorSheet4eMethodTargets(ActorSheet4e: ActorSheet4eClass, method: string): string[] {
  const targets: string[] = [];
  const className = ActorSheet4e?.name ?? "ActorSheet4e";
  const actorTypes = new Set([
    ...Object.keys(CONFIG.Actor?.sheetClasses ?? {}),
    ...Object.keys((CONFIG.Actor as { dataModels?: Record<string, unknown> })?.dataModels ?? {}),
  ]);

  const DSC = foundry.applications.apps?.DocumentSheetConfig as
    | {
        getSheetClassesForSubType?: (
          doc: string,
          subType: string
        ) => { sheetClasses?: Record<string, { cls?: { prototype?: object } }> };
      }
    | undefined;

  if (DSC?.getSheetClassesForSubType) {
    for (const actorType of actorTypes) {
      try {
        const { sheetClasses } = DSC.getSheetClassesForSubType("Actor", actorType);
        for (const [sheetId, entry] of Object.entries(sheetClasses ?? {})) {
          if (!isDnd4eActorSheetClass(entry?.cls, ActorSheet4e)) continue;
          targets.push(sheetClassTarget(actorType, sheetId, method));
        }
      } catch {
        /* unknown actor subtype */
      }
    }
  }

  for (const [actorType, byId] of Object.entries(CONFIG.Actor?.sheetClasses ?? {})) {
    for (const [sheetId, entry] of Object.entries(
      (byId ?? {}) as Record<string, { cls?: { prototype?: object } }>
    )) {
      if (!isDnd4eActorSheetClass(entry?.cls, ActorSheet4e)) continue;
      targets.push(sheetClassTarget(actorType, sheetId, method));
    }
  }

  targets.push(
    sheetClassTarget("Player Character", className, method),
    sheetClassTarget("Player Character", `dnd4e.${className}`, method)
  );

  return [...new Set(targets)];
}

async function stashOnDropItemWrapper(
  this: { actor: Actor },
  wrapped: (event: DragEvent, data: object) => Promise<unknown>,
  event: DragEvent,
  data: object
): Promise<unknown> {
  if (await handleStashItemDropOnActor(this.actor, data as Record<string, unknown>)) {
    return false;
  }
  return wrapped.call(this, event, data);
}

function patchSheetClassesDirectly(ActorSheet4e: ActorSheet4eClass): void {
  const seen = new Set<ActorSheet4eClass>();
  const visit = (cls: { prototype?: object } | undefined) => {
    if (!cls || !isDnd4eActorSheetClass(cls, ActorSheet4e)) return;
    const sheetCls = cls as ActorSheet4eClass;
    if (seen.has(sheetCls)) return;
    seen.add(sheetCls);

    const original = sheetCls.prototype._onDropItem;
    sheetCls.prototype._onDropItem = async function (
      this: { actor: Actor },
      event: DragEvent,
      data: object
    ) {
      if (await handleStashItemDropOnActor(this.actor, data as Record<string, unknown>)) {
        return false;
      }
      return original.call(this, event, data);
    };
  };

  for (const byId of Object.values(CONFIG.Actor?.sheetClasses ?? {})) {
    for (const entry of Object.values(
      (byId ?? {}) as Record<string, { cls?: { prototype?: object } }>
    )) {
      visit(entry?.cls);
    }
  }
  visit(ActorSheet4e);
}

/** Intercept dnd4e actor sheet item drops so stash transfers do not also run default _onDropItemCreate. */
export async function registerStashActorSheetDropHook(): Promise<void> {
  const { default: ActorSheet4e } = (await import(
    "/systems/dnd4e/module/actor/actor-sheet.js"
  )) as { default: ActorSheet4eClass };
  const lw = (globalThis as { libWrapper?: typeof libWrapper }).libWrapper;
  const targets = getActorSheet4eMethodTargets(ActorSheet4e, "_onDropItem");
  let registered = 0;

  if (lw) {
    for (const target of targets) {
      try {
        // MIXED: may skip wrapped() when handling stash→PC (WRAPPER requires always chaining).
        lw.register(MODULE_ID, target, stashOnDropItemWrapper, lw.MIXED);
        registered++;
      } catch {
        /* sheet class not loaded yet */
      }
    }
  }

  if (!registered) {
    patchSheetClassesDirectly(ActorSheet4e);
    console.warn(
      `${MODULE_ID} | stash drop: libWrapper unavailable; applied direct _onDropItem patch on dnd4e actor sheets.`
    );
  }
}
