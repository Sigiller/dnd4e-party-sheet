import type { Page } from "playwright";
import { dismissBlockingNotifications, executeMacroByName, evaluateFoundry, getModuleApiStatus, isPartySheetOpen, sleep } from "../../../tools/foundry-e2e/src/evaluate.js";
import { openPartySheetViaMacro, resetStashViaMacro } from "../../../tools/foundry-e2e/src/launchmacro.js";
import type { E2eTestCase } from "../../../tools/foundry-e2e/src/types.js";
import { PC_TYPE } from "./constants.js";

const MODULE_ID = "dnd4e-party-sheet";
const SHEET_SELECTOR = ".application.dnd4e-party-sheet";

async function waitForPartySheet(page: Page): Promise<void> {
  await page.waitForSelector(SHEET_SELECTOR, { timeout: 15000 });
}

/** Actor sheets may be AppV1 (ui.windows) or AppV2 (foundry.applications.instances). */
async function isActorSheetOpen(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const g = globalThis as typeof globalThis & {
      ui?: { windows?: Map<number, { document?: { documentName?: string } }> };
      foundry?: {
        applications?: { instances?: Map<string, { document?: { documentName?: string } }> };
      };
    };
    const v1 = [...(g.ui?.windows?.values?.() ?? [])];
    const v2 = [...(g.foundry?.applications?.instances?.values?.() ?? [])];
    return [...v1, ...v2].some((a) => a?.document?.documentName === "Actor");
  });
}

export const smokeTests: E2eTestCase[] = [
  {
    name: "module ready and API available",
    role: "gm",
    async run({ page, config }) {
      const qa = await evaluateFoundry(page, () => window.__qa);
      if (!qa?.ready) throw new Error("window.__qa.ready is false");

      const api = await getModuleApiStatus(page, config.moduleId);
      if (!api.hasOpenPartySheet || !api.hasGetPartyFolder) {
        throw new Error("Module API missing openPartySheet or getPartyFolder");
      }
      if (api.partyFolderName !== config.partyFolderName) {
        throw new Error(`Expected party folder "${config.partyFolderName}", got "${api.partyFolderName}"`);
      }
    },
  },

  {
    name: "GM opens party sheet with Overview and Stash tabs",
    role: "gm",
    async run({ page, config }) {
      await resetStashViaMacro(page, config);
      await openPartySheetViaMacro(page, config);
      await waitForPartySheet(page);

      if (!(await isPartySheetOpen(page))) {
        throw new Error("Party Sheet window not found after openPartySheet()");
      }

      // Redesign chrome: both ribbon tabs must expose the ARIA tab role.
      for (const name of [/^overview$/i, /^stash$/i]) {
        if ((await page.getByRole("tab", { name }).count()) === 0) {
          throw new Error(`Tab with role="tab" and name ${name} not found`);
        }
      }
    },
  },

  {
    name: "GM first open creates hidden Party Stash actor",
    role: "gm",
    async run({ page, config }) {
      await executeMacroByName(page, config.macros.openPartySheet);
      await waitForPartySheet(page);
      await sleep(300);

      const stash = await evaluateFoundry(page, (id: string) => {
        const folder = game.modules.get(id)?.api?.getPartyFolder?.();
        const stashId = folder?.flags?.[id]?.stashActorId;
        const actor = stashId ? game.actors.get(stashId) : null;
        return {
          stashId: stashId ?? null,
          actorName: actor?.name ?? null,
          inPartyFolder: actor ? actor.folder?.id === folder?.id : false,
        };
      }, MODULE_ID);

      if (!stash.stashId || !stash.actorName) {
        throw new Error("Party Stash actor was not created");
      }
      if (stash.inPartyFolder) {
        throw new Error("Party Stash should not be inside Party folder");
      }
    },
  },

  {
    name: "Overview shows party members and party level",
    role: "gm",
    async run({ page, config }) {
      await openPartySheetViaMacro(page, config);
      await waitForPartySheet(page);

      const overview = await evaluateFoundry(
        page,
        (payload: { moduleId: string; partyFolderName: string; pcType: string }) => {
          const folder = game.modules.get(payload.moduleId)?.api?.getPartyFolder?.();
          const members = game.actors.contents.filter((a) => {
            if (a.type !== payload.pcType) return false;
            const f = a.folder;
            const fid = typeof f === "string" ? f : f?.id;
            return fid === folder?.id;
          });
          const levels = members.map((m) => Number(m.system?.details?.level) || 1);
          const partyLevel =
            levels.length > 0
              ? Math.floor(levels.reduce((s, l) => s + l, 0) / levels.length)
              : 0;
          return { memberCount: members.length, partyLevel };
        },
        { moduleId: MODULE_ID, partyFolderName: config.partyFolderName, pcType: PC_TYPE }
      );

      if (overview.memberCount < 2) {
        throw new Error(`Expected ≥2 party members, got ${overview.memberCount}`);
      }

      const cards = await page.locator('[data-testid="member-card"]').count();
      if (cards !== overview.memberCount) {
        throw new Error(`Expected ${overview.memberCount} member cards, rendered ${cards}`);
      }
    },
  },

  {
    name: "Overview skills/languages collapse divider toggles",
    role: "gm",
    async run({ page, config }) {
      await openPartySheetViaMacro(page, config);
      await waitForPartySheet(page);
      await page.getByRole("tab", { name: /^overview$/i }).click();
      await sleep(200);

      const divider = page.getByTestId("overview-collapse-divider");
      if ((await divider.count()) === 0) {
        throw new Error("Collapse divider not found on Overview tab");
      }

      const skillsBlock = page.locator(".party-skills-block");
      const before = await skillsBlock.count();
      await divider.click();
      await sleep(300);
      const after = await skillsBlock.count();
      if (before === after) {
        throw new Error(`Divider click did not toggle skills section (count ${before} → ${after})`);
      }

      // Restore the previous state (it persists per user via a client setting).
      await divider.click();
      await sleep(300);
      if ((await skillsBlock.count()) !== before) {
        throw new Error("Divider did not restore the initial expanded state");
      }
    },
  },

  {
    name: "Stash tab shows Party Total and inventory sections",
    role: "gm",
    async run({ page, config }) {
      await openPartySheetViaMacro(page, config);
      await waitForPartySheet(page);

      const stashTab = page.getByRole("tab", { name: /^stash$/i }).first();
      if ((await stashTab.count()) === 0) {
        throw new Error('Stash tab (role="tab") not found');
      }
      await stashTab.click();

      await page
        .getByText(/party total/i)
        .first()
        .waitFor({ state: "visible", timeout: 5000 })
        .catch(() => {
          throw new Error("Party Total label not visible on Stash tab");
        });
    },
  },

  {
    name: "Player can open party sheet when stash is ready",
    role: "player",
    async run({ page, config }) {
      await openPartySheetViaMacro(page, config);
      await waitForPartySheet(page);

      if (!(await isPartySheetOpen(page))) {
        throw new Error("Player could not open Party Sheet");
      }
    },
  },

  {
    name: "Member name opens character actor sheet",
    role: "gm",
    async run({ page, config }) {
      await openPartySheetViaMacro(page, config);
      await waitForPartySheet(page);
      await page.getByRole("tab", { name: /^overview$/i }).click();
      await sleep(200);

      const nameLink = page
        .locator('[data-testid="member-card"] h3[role="button"]')
        .first();
      if ((await nameLink.count()) === 0) {
        throw new Error("Member card name link not found");
      }
      await nameLink.click();

      await page
        .waitForFunction(
          () => {
            const g = globalThis as typeof globalThis & {
              ui?: { windows?: Map<number, { document?: { documentName?: string } }> };
              foundry?: {
                applications?: {
                  instances?: Map<string, { document?: { documentName?: string } }>;
                };
              };
            };
            const v1 = [...(g.ui?.windows?.values?.() ?? [])];
            const v2 = [...(g.foundry?.applications?.instances?.values?.() ?? [])];
            return [...v1, ...v2].some((a) => a?.document?.documentName === "Actor");
          },
          null,
          { timeout: 10000 }
        )
        .catch(() => {
          throw new Error("Actor sheet did not open after clicking member name");
        });

      if (!(await isActorSheetOpen(page))) {
        throw new Error("Actor sheet not detected after member name click");
      }
    },
  },

  {
    name: "allowPlayerStashCurrency OFF (GM toggles world setting)",
    role: "gm",
    async run({ page }) {
      await evaluateFoundry(page, (id: string) => {
        return game.settings.set(id, "allowPlayerStashCurrency", false);
      }, MODULE_ID);

      const setting = await evaluateFoundry(page, (id: string) =>
        game.settings.get(id, "allowPlayerStashCurrency")
      , MODULE_ID);
      if (setting !== false) throw new Error("Setting allowPlayerStashCurrency should be false");

      await evaluateFoundry(page, (id: string) => {
        return game.settings.set(id, "allowPlayerStashCurrency", true);
      }, MODULE_ID);
      await dismissBlockingNotifications(page);
    },
  },
];
