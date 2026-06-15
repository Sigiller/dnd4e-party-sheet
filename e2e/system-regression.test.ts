import { evaluateFoundry, sleep } from "../../../tools/foundry-e2e/src/evaluate.js";
import { openPartySheetViaMacro } from "../../../tools/foundry-e2e/src/launchmacro.js";
import type { E2eTestCase } from "../../../tools/foundry-e2e/src/types.js";
import { PC_TYPE } from "./constants.js";

export const systemRegressionTests: E2eTestCase[] = [
  {
    name: "dnd4e actor sheet opens for PC outside Party",
    role: "gm",
    async run({ page, config }) {
      const result = await evaluateFoundry(page, (payload: { partyFolderName: string; pcType: string }) => {
        const outsider = game.actors.contents.find((a) => {
          if (a.type !== payload.pcType) return false;
          const folder = game.folders.find(
            (f) =>
              f.type === "Actor" &&
              f.name.trim().toLowerCase() === payload.partyFolderName.trim().toLowerCase()
          );
          const fid = typeof a.folder === "string" ? a.folder : a.folder?.id;
          return fid !== folder?.id;
        });
        if (!outsider) return { error: "no_outsider_pc" as const };
        const t0 = performance.now();
        return outsider.sheet.render(true).then(() => ({
          actorName: outsider.name,
          ms: Math.round(performance.now() - t0),
        }));
      }, { partyFolderName: config.partyFolderName, pcType: PC_TYPE });

      if ("error" in result && result.error) {
        throw new Error(`Regression setup failed: ${result.error}`);
      }
      if (!result.actorName) throw new Error("Actor sheet render failed");
      await sleep(300);
      await evaluateFoundry(page, (name: string) => {
        const a = game.actors.getName(name);
        if (a?.sheet?.rendered) return a.sheet.close({ animate: false });
      }, result.actorName);
    },
  },

  {
    name: "stash drop hook does not intercept non-party actor drops",
    role: "gm",
    async run({ page, config }) {
      const handled = await evaluateFoundry(page, (payload: { partyFolderName: string; pcType: string }) => {
        const folder = game.folders.find(
          (f) =>
            f.type === "Actor" &&
            f.name.trim().toLowerCase() === payload.partyFolderName.trim().toLowerCase()
        );
        const outsider = game.actors.contents.find((a) => {
          const fid = typeof a.folder === "string" ? a.folder : a.folder?.id;
          return a.type === payload.pcType && fid !== folder?.id;
        });
        if (!outsider) return { skip: true as const };
        const isPartyMember = (typeof outsider.folder === "string" ? outsider.folder : outsider.folder?.id) === folder?.id;
        return { isPartyMember, outsiderName: outsider.name };
      }, { partyFolderName: config.partyFolderName, pcType: PC_TYPE });

      if ("skip" in handled && handled.skip) {
        console.warn("[e2e] No outsider PC — skip drop regression");
        return;
      }
      if (handled.isPartyMember) {
        throw new Error("Test actor should not be a party member");
      }
    },
  },

  {
    name: "party sheet live refresh on party member HP update",
    role: "gm",
    async run({ page, config }) {
      await openPartySheetViaMacro(page, config);
      await sleep(500);

      const updated = await evaluateFoundry(
        page,
        (payload: { moduleId: string; partyFolderName: string; pcType: string }) => {
          const folder = game.folders.find(
            (f) =>
              f.type === "Actor" &&
              f.name.trim().toLowerCase() === payload.partyFolderName.trim().toLowerCase()
          );
          const member = game.actors.contents.find((a) => {
            const fid = typeof a.folder === "string" ? a.folder : a.folder?.id;
            return a.type === payload.pcType && fid === folder?.id;
          });
          if (!member) return { error: "no_member" as const };
          const hp = member.system?.attributes?.hp?.value ?? 10;
          const next = Math.max(1, hp - 1);
          return member.update({ "system.attributes.hp.value": next }).then(() => ({
            name: member.name,
            hp: next,
          }));
        },
        { moduleId: "dnd4e-party-sheet", partyFolderName: config.partyFolderName, pcType: PC_TYPE }
      );

      if ("error" in updated && updated.error) {
        throw new Error(`Could not update member HP: ${updated.error}`);
      }
      await sleep(400);
    },
  },

  {
    name: "inventory row click hook does not break actor sheet render",
    role: "gm",
    async run({ page, config }) {
      const ok = await evaluateFoundry(page, (payload: { partyFolderName: string; pcType: string }) => {
        const folder = game.folders.find(
          (f) =>
            f.type === "Actor" &&
            f.name.trim().toLowerCase() === payload.partyFolderName.trim().toLowerCase()
        );
        const member = game.actors.contents.find((a) => {
          const fid = typeof a.folder === "string" ? a.folder : a.folder?.id;
          return a.type === payload.pcType && fid === folder?.id;
        });
        if (!member) return false;
        return member.sheet.render(true).then(() => true).catch(() => false);
      }, { partyFolderName: config.partyFolderName, pcType: PC_TYPE });

      if (!ok) throw new Error("Actor sheet failed to render with inventory hook active");
      await sleep(300);
    },
  },
];
