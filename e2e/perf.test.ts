import type { Page } from "playwright";
import { executeMacroByName, evaluateFoundry, sleep } from "../../../tools/foundry-e2e/src/evaluate.js";
import { openPartySheetViaMacro } from "../../../tools/foundry-e2e/src/launchmacro.js";
import type { PerfMetric, PerfTestCase } from "../../../tools/foundry-e2e/src/types.js";
import { PC_TYPE } from "./constants.js";

const MODULE_ID = "dnd4e-party-sheet";

async function measurePartySheetColdOpen(page: Page): Promise<number> {
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => game?.ready === true, null, { timeout: 60000 });
  await executeMacroByName(page, "QA_SignalReady");

  return evaluateFoundry(page, (id: string) => {
    const t0 = performance.now();
    return game.modules.get(id)?.api?.openPartySheet?.().then(async () => {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return Math.round(performance.now() - t0);
    });
  }, MODULE_ID);
}

async function measurePartySheetWarmOpen(page: Page): Promise<number> {
  return evaluateFoundry(page, (id: string) => {
    const apps = [...(ui.windows?.values?.() ?? [])];
    for (const app of apps) {
      if (String(app?.title ?? "").toLowerCase().includes("party")) {
        app.close({ animate: false });
      }
    }
    const t0 = performance.now();
    return game.modules.get(id)?.api?.openPartySheet?.().then(async () => {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return Math.round(performance.now() - t0);
    });
  }, MODULE_ID);
}

export const perfTests: PerfTestCase[] = [
  {
    name: "party sheet open metrics",
    role: "gm",
    async run({ page, config }) {
      await openPartySheetViaMacro(page, config);
      await sleep(300);

      const cold = await measurePartySheetColdOpen(page);
      const warm = await measurePartySheetWarmOpen(page);

      const actorCold = await evaluateFoundry(page, (payload: { partyFolderName: string; pcType: string }) => {
        const folder = game.folders.find(
          (f) =>
            f.type === "Actor" &&
            f.name.trim().toLowerCase() === payload.partyFolderName.trim().toLowerCase()
        );
        const member = game.actors.contents.find((a) => {
          const fid = typeof a.folder === "string" ? a.folder : a.folder?.id;
          return a.type === payload.pcType && fid === folder?.id;
        });
        if (!member) return 0;
        if (member.sheet?.rendered) member.sheet.close({ animate: false });
        const t0 = performance.now();
        return member.sheet.render(true).then(() => Math.round(performance.now() - t0));
      }, { partyFolderName: config.partyFolderName, pcType: PC_TYPE });

      await openPartySheetViaMacro(page, config);
      await sleep(200);
      const stashSwitch = await page.evaluate(async () => {
        const tab = [...document.querySelectorAll("button, a")].find((el) =>
          /stash/i.test(el.textContent ?? "")
        );
        if (!tab) return 0;
        const t0 = performance.now();
        (tab as HTMLElement).click();
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        return Math.round(performance.now() - t0);
      });

      const liveRefresh = await evaluateFoundry(page, (payload: { partyFolderName: string; pcType: string }) => {
        const folder = game.folders.find(
          (f) =>
            f.type === "Actor" &&
            f.name.trim().toLowerCase() === payload.partyFolderName.trim().toLowerCase()
        );
        const member = game.actors.contents.find((a) => {
          const fid = typeof a.folder === "string" ? a.folder : a.folder?.id;
          return a.type === payload.pcType && fid === folder?.id;
        });
        if (!member) return 0;
        const hp = member.system?.attributes?.hp?.value ?? 10;
        const t0 = performance.now();
        return member
          .update({ "system.attributes.hp.value": Math.max(1, hp - 1) })
          .then(() => Math.round(performance.now() - t0));
      }, { partyFolderName: config.partyFolderName, pcType: PC_TYPE });

      return [
        { name: "partySheetColdOpenMs", ms: cold },
        { name: "partySheetWarmOpenMs", ms: warm },
        { name: "dnd4eActorSheetColdOpenMs", ms: actorCold },
        { name: "stashTabSwitchMs", ms: stashSwitch },
        { name: "liveRefreshMs", ms: liveRefresh },
      ];
    },
  },
];
