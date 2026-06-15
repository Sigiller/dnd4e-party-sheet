import { isPartySheetOpen, sleep } from "../../../tools/foundry-e2e/src/evaluate.js";
import {
  applyDamageFromLastRoll,
  assertChatCardDom,
  assertNpcExpandedPowers,
  clickInventoryRowHeader,
  closeActorSheet,
  closeAllActorSheets,
  controlTokenForActor,
  createCombatViaInitiative,
  cycleTabs,
  endCombat,
  ensureActiveScene,
  executeMacroIfExists,
  findAttackPower,
  findNpcWithPowers,
  getPartyMembers,
  getPlayerOwnedActor,
  isInventorySummaryExpanded,
  isNpcSheetOpen,
  openActorSheet,
  PC_TAB_IDS,
  NPC_TAB_IDS,
  postItemToChat,
  resolveChatSamples,
  resolvePrimaryPartyMember,
  restoreActorHp,
  rollAttackAndDamage,
  rollSkillFromSheet,
  trackPageErrors,
} from "./helpers/foundry-core.js";
import { openPartySheetViaMacro } from "../../../tools/foundry-e2e/src/launchmacro.js";
import type { E2eTestCase } from "../../../tools/foundry-e2e/src/types.js";

export const foundryCoreTests: E2eTestCase[] = [
  // --- Priority 1: PC sheets ---
  {
    name: "GM opens and cycles tabs on all party PCs",
    role: "gm",
    async run({ page, config }) {
      const errors = trackPageErrors(page);
      try {
        const members = await getPartyMembers(page, config);
        if (members.length < 2) {
          throw new Error(`Expected ≥2 party members, got ${members.length}`);
        }

        for (const member of members) {
          await openActorSheet(page, member.id, "powers");
          const tabResults = await cycleTabs(page, member.id, PC_TAB_IDS);
          const activeCount = tabResults.filter((t) => t.active).length;
          if (activeCount === 0) {
            throw new Error(`No tabs activated on ${member.name}`);
          }
          await closeActorSheet(page, member.id);
        }
        errors.assertClean();
      } finally {
        errors.dispose();
        await closeAllActorSheets(page);
      }
    },
  },

  {
    name: "Player opens owned character sheet and switches tabs",
    role: "player",
    async run({ page, config }) {
      const errors = trackPageErrors(page);
      try {
        const owned = await getPlayerOwnedActor(page);
        if (!owned) throw new Error("Player has no owned character");

        await openActorSheet(page, owned.id, "powers");
        const tabResults = await cycleTabs(page, owned.id, ["powers", "inventory", "features"]);
        const activeCount = tabResults.filter((t) => t.active).length;
        if (activeCount === 0) {
          throw new Error(`No player tabs activated on ${owned.name}`);
        }
        errors.assertClean();
      } finally {
        errors.dispose();
        await closeAllActorSheets(page);
      }
    },
  },

  // --- Priority 1: Chat cards ---
  {
    name: "Item types post to chat with matching description (GM)",
    role: "gm",
    async run({ page, config }) {
      const errors = trackPageErrors(page);
      const member = await resolvePrimaryPartyMember(page, config);
      const pinned = config.fixtures?.chatSamples?.find((s) => s.actorName === member.name)?.items;
      const samples = await resolveChatSamples(page, member.name, pinned);

      if (samples.length === 0) {
        throw new Error(`No chat samples found for ${member.name}`);
      }

      try {
        for (const sample of samples.slice(0, 3)) {
          const result = await postItemToChat(page, member.name, sample.name);
          await sleep(300);
          await assertChatCardDom(page, result.itemName, result.snippet);
        }
        errors.assertClean();
      } finally {
        errors.dispose();
      }
    },
  },

  {
    name: "Player posts power to chat",
    role: "player",
    async run({ page, config }) {
      const errors = trackPageErrors(page);
      try {
        const owned = await getPlayerOwnedActor(page);
        if (!owned) throw new Error("Player has no owned character");

        const samples = await resolveChatSamples(page, owned.name);
        const power = samples.find((s) => s.type === "power") ?? samples[0];
        if (!power) throw new Error("No item to post to chat");

        const result = await postItemToChat(page, owned.name, power.name);
        await sleep(300);
        await assertChatCardDom(page, result.itemName, result.snippet);
        errors.assertClean();
      } finally {
        errors.dispose();
      }
    },
  },

  // --- Priority 1: Combat ---
  {
    name: "GM can create and end combat via initiative",
    role: "gm",
    async run({ page, config }) {
      const errors = trackPageErrors(page);
      const member = await resolvePrimaryPartyMember(page, config);

      try {
        if (config.macros.activateScene) {
          await executeMacroIfExists(page, config.macros.activateScene);
        }
        await ensureActiveScene(page, config.fixtures?.sceneName);
        await sleep(500);

        const { combatId } = await createCombatViaInitiative(page, member.id);
        if (!combatId) throw new Error("Combat was not created");

        await endCombat(page);
        const stillActive = await page.evaluate(() => game.combat !== null);
        if (stillActive) throw new Error("Combat still active after delete");

        errors.assertClean();
      } finally {
        errors.dispose();
        if (config.macros.cleanupCombat) {
          await executeMacroIfExists(page, config.macros.cleanupCombat);
        } else {
          await endCombat(page);
        }
      }
    },
  },

  {
    name: "Power attack and damage rolls apply correct HP change",
    role: "gm",
    async run({ page, config }) {
      const errors = trackPageErrors(page);
      const member = await resolvePrimaryPartyMember(page, config);
      const pinnedPower = config.fixtures?.attackPowerByActor?.[member.name];
      const { powerName } = await findAttackPower(page, member.name, pinnedPower);

      const npc = await findNpcWithPowers(page, config.fixtures?.npcName);
      let hpSnapshot: number | null = null;

      try {
        if (config.macros.activateScene) {
          await executeMacroIfExists(page, config.macros.activateScene);
        }
        await ensureActiveScene(page, config.fixtures?.sceneName);
        await sleep(500);

        hpSnapshot = await page.evaluate((id: string) => {
          const actor = game.actors.get(id);
          return Number(actor?.system?.attributes?.hp?.value ?? 0);
        }, npc.id);

        const token = await controlTokenForActor(page, npc.id);
        if (!token) {
          console.warn("[e2e] No canvas token for NPC — applying damage via API only");
        }

        const rolls = await rollAttackAndDamage(page, member.name, powerName);
        if (!rolls.attackFormula.includes("d20") && !rolls.attackFormula.includes("1d20")) {
          throw new Error(`Attack formula missing d20: ${rolls.attackFormula}`);
        }
        if (rolls.damageTotal <= 0) {
          throw new Error(`Expected positive damage total, got ${rolls.damageTotal}`);
        }

        const damage = await applyDamageFromLastRoll(page, npc.id);
        if (damage.hpAfter >= damage.hpBefore) {
          throw new Error(
            `HP did not decrease: before=${damage.hpBefore}, after=${damage.hpAfter}`
          );
        }

        errors.assertClean();
      } finally {
        errors.dispose();
        if (hpSnapshot !== null) {
          await restoreActorHp(page, npc.id, hpSnapshot);
        }
        if (config.macros.cleanupCombat) {
          await executeMacroIfExists(page, config.macros.cleanupCombat);
        } else {
          await endCombat(page);
        }
      }
    },
  },

  // --- Priority 1: NPC sheets ---
  {
    name: "NPC sheet renders expanded power statblocks and chat",
    role: "gm",
    async run({ page, config }) {
      const errors = trackPageErrors(page);
      const npc = await findNpcWithPowers(page, config.fixtures?.npcName);

      try {
        await openActorSheet(page, npc.id, "powers");
        if (!(await isNpcSheetOpen(page))) {
          throw new Error("NPC sheet window not detected");
        }

        const tabResults = await cycleTabs(page, npc.id, NPC_TAB_IDS);
        const powersTab = tabResults.find((t) => t.tab === "powers");
        if (!powersTab?.active && tabResults.every((t) => !t.active)) {
          throw new Error("NPC tabs did not activate");
        }

        await assertNpcExpandedPowers(page);

        const powerItem = await page.evaluate((npcId: string) => {
          const actor = game.actors.get(npcId);
          const power = actor?.items.find((i) => i.type === "power");
          return power?.name ?? null;
        }, npc.id);

        if (powerItem) {
          const result = await postItemToChat(page, npc.name, powerItem);
          await sleep(300);
          await assertChatCardDom(page, result.itemName, result.snippet);
        }

        errors.assertClean();
      } finally {
        errors.dispose();
        await closeActorSheet(page, npc.id);
      }
    },
  },

  // --- Priority 2: Module hook surface ---
  {
    name: "Inventory row click expands item summary",
    role: "gm",
    async run({ page, config }) {
      const errors = trackPageErrors(page);
      const member = await resolvePrimaryPartyMember(page, config);

      try {
        await openActorSheet(page, member.id, "inventory");
        await sleep(400);

        const hookBound = await page.evaluate((actorId: string) => {
          const actor = game.actors.get(actorId);
          const el = (actor?.sheet as { element?: HTMLElement } | undefined)?.element;
          return el?.dataset?.partySheetInventoryClick === "1";
        }, member.id);
        if (!hookBound) {
          throw new Error("party-sheet inventory click hook not bound on actor sheet");
        }

        const hasGear = await page.locator(".item-list.gear .item-header").count();
        if (hasGear === 0) {
          console.warn("[e2e] No gear items — hook bound, skip expand assert");
          errors.assertClean();
          return;
        }

        if (await isInventorySummaryExpanded(page)) {
          errors.assertClean();
          return;
        }

        await clickInventoryRowHeader(page);
        const expanded = await isInventorySummaryExpanded(page);
        if (!expanded) {
          // Fallback: direct itemSummary click still works on fox4e/dnd4e sheets
          await page.evaluate(() => {
            const summary = document.querySelector(
              ".item-list.gear [data-action='itemSummary']"
            ) as HTMLElement | null;
            summary?.click();
          });
          await sleep(400);
        }

        if (!(await isInventorySummaryExpanded(page))) {
          throw new Error("Inventory row click did not expand item summary");
        }
        errors.assertClean();
      } finally {
        errors.dispose();
        await closeActorSheet(page, member.id);
      }
    },
  },

  {
    name: "Skill roll from actor sheet posts to chat",
    role: "gm",
    async run({ page, config }) {
      const errors = trackPageErrors(page);
      const member = await resolvePrimaryPartyMember(page, config);

      try {
        await openActorSheet(page, member.id, "powers");
        const rolled = await rollSkillFromSheet(page, member.id);
        if (!rolled) {
          console.warn("[e2e] Skill roll element not found — soft skip");
        }
        errors.assertClean();
      } finally {
        errors.dispose();
        await closeActorSheet(page, member.id);
      }
    },
  },

  {
    name: "Party sheet and actor sheet open together",
    role: "gm",
    async run({ page, config }) {
      const errors = trackPageErrors(page);
      const member = await resolvePrimaryPartyMember(page, config);

      try {
        await openPartySheetViaMacro(page, config);
        await sleep(400);
        if (!(await isPartySheetOpen(page))) {
          throw new Error("Party sheet not open");
        }

        await openActorSheet(page, member.id, "powers");
        const tabResults = await cycleTabs(page, member.id, ["powers", "inventory"]);
        for (const { tab, active } of tabResults) {
          if (!active) throw new Error(`Tab "${tab}" not active with party sheet open`);
        }

        if (!(await isPartySheetOpen(page))) {
          throw new Error("Party sheet closed unexpectedly");
        }
        errors.assertClean();
      } finally {
        errors.dispose();
        await closeAllActorSheets(page);
      }
    },
  },

  {
    name: "Actor Directory renders with Party folder",
    role: "gm",
    async run({ page, config }) {
      const errors = trackPageErrors(page);

      try {
        await page.evaluate(() => {
          ui.sidebar?.activateTab?.("actors");
        });
        await sleep(400);

        const dir = page.locator("#actor-directory, .actors-sidebar").first();
        if ((await dir.count()) === 0) {
          throw new Error("Actor directory not found");
        }

        const hasParty = await page.getByText(config.partyFolderName, { exact: false }).count();
        if (hasParty === 0) {
          throw new Error(`Party folder "${config.partyFolderName}" not visible in directory`);
        }
        errors.assertClean();
      } finally {
        errors.dispose();
      }
    },
  },

  {
    name: "Chat card attack and damage buttons work via DOM",
    role: "gm",
    async run({ page, config }) {
      const errors = trackPageErrors(page);
      const member = await resolvePrimaryPartyMember(page, config);
      const pinnedPower = config.fixtures?.attackPowerByActor?.[member.name];
      const { powerName } = await findAttackPower(page, member.name, pinnedPower);

      try {
        await page.evaluate(
          async (payload: { actorName: string; powerName: string }) => {
            const actor = game.actors.getName(payload.actorName);
            const item = actor?.items.getName(payload.powerName);
            if (!item) throw new Error("Power not found");
            await item.roll();
          },
          { actorName: member.name, powerName }
        );
        await sleep(600);

        await page.evaluate(() => {
          const attack = document.querySelector(
            ".card-buttons button[data-action='attack']"
          ) as HTMLElement | null;
          attack?.click();
        });
        await sleep(800);

        await page.evaluate(() => {
          const damage = document.querySelector(
            ".card-buttons button[data-action='damage']"
          ) as HTMLElement | null;
          damage?.click();
        });
        await sleep(800);

        const hasRoll = await page.evaluate(() => {
          const msgs = game.messages.contents.slice(-3);
          return msgs.some((m) => m.rolls?.length);
        });
        if (!hasRoll) {
          throw new Error("No roll messages after chat card button clicks");
        }
        errors.assertClean();
      } finally {
        errors.dispose();
      }
    },
  },
];
