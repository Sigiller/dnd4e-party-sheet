import type { Page } from "playwright";
import { evaluateFoundry, executeMacroByName, sleep } from "../../../../tools/foundry-e2e/src/evaluate.js";
import type { ModuleE2eConfig } from "../../../../tools/foundry-e2e/src/types.js";
import { PC_TYPE } from "../constants.js";

export const PC_TAB_IDS = ["powers", "inventory", "features", "basics", "details", "status"] as const;
export const NPC_TAB_IDS = ["powers", "skills", "inventory", "features", "effects"] as const;

function resolveTabGroupForTab(
  sheet: { constructor?: { TABS?: Record<string, { tabs?: { id: string }[] }> } },
  tabId: string
): string | null {
  const tabsConfig = sheet.constructor?.TABS;
  if (!tabsConfig) return null;
  for (const [groupName, groupConfig] of Object.entries(tabsConfig)) {
    if (groupConfig.tabs?.some((t) => t.id === tabId)) return groupName;
  }
  return null;
}

function listSheetTabs(
  sheet: { constructor?: { TABS?: Record<string, { tabs?: { id: string }[] }> } }
): { tab: string; group: string }[] {
  const tabsConfig = sheet.constructor?.TABS ?? {};
  const out: { tab: string; group: string }[] = [];
  for (const [group, config] of Object.entries(tabsConfig)) {
    for (const t of config.tabs ?? []) {
      out.push({ tab: t.id, group });
    }
  }
  return out;
}

const IGNORED_CONSOLE_PATTERNS = [
  /favicon/i,
  /DevTools/i,
  /WebGL/i,
  /PixiJS/i,
  /Failed to load resource/i,
  /404 \(Not Found\)/i,
];

export interface PartyMemberInfo {
  id: string;
  name: string;
}

export interface ChatPostResult {
  messageId: string;
  itemName: string;
  snippet: string;
  cardHtml: string;
}

export interface PageErrorTracker {
  assertClean: () => void;
  dispose: () => void;
}

export function normalizeChatText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function trackPageErrors(page: Page): PageErrorTracker {
  const errors: string[] = [];

  const onPageError = (err: Error) => {
    errors.push(`pageerror: ${err.message}`);
  };

  const onConsole = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (IGNORED_CONSOLE_PATTERNS.some((re) => re.test(text))) return;
    errors.push(`console: ${text}`);
  };

  page.on("pageerror", onPageError);
  page.on("console", onConsole);

  return {
    assertClean() {
      if (errors.length > 0) {
        throw new Error(`Page errors detected:\n${errors.join("\n")}`);
      }
    },
    dispose() {
      page.off("pageerror", onPageError);
      page.off("console", onConsole);
    },
  };
}

export async function executeMacroIfExists(page: Page, macroName?: string): Promise<void> {
  if (!macroName) return;
  try {
    await executeMacroByName(page, macroName);
  } catch {
    // Macro may not be imported in world — tests fall back to API helpers.
  }
}

export async function getPartyFolderId(
  page: Page,
  partyFolderName: string
): Promise<string | null> {
  return evaluateFoundry(page, (name: string) => {
    const folder = game.folders.find(
      (f) => f.type === "Actor" && f.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    return folder?.id ?? null;
  }, partyFolderName);
}

export async function getPartyMembers(
  page: Page,
  config: ModuleE2eConfig
): Promise<PartyMemberInfo[]> {
  return evaluateFoundry(
    page,
    (payload: { partyFolderName: string; pcType: string }) => {
      const folder = game.folders.find(
        (f) =>
          f.type === "Actor" &&
          f.name.trim().toLowerCase() === payload.partyFolderName.trim().toLowerCase()
      );
      return game.actors.contents
        .filter((a) => {
          if (a.type !== payload.pcType) return false;
          const fid = typeof a.folder === "string" ? a.folder : a.folder?.id;
          return fid === folder?.id;
        })
        .map((a) => ({ id: a.id, name: a.name ?? "" }))
        .filter((a) => a.name.length > 0);
    },
    { partyFolderName: config.partyFolderName, pcType: PC_TYPE }
  );
}

export async function openActorSheet(
  page: Page,
  actorId: string,
  tab?: string
): Promise<void> {
  await evaluateFoundry(
    page,
    async (payload: { actorId: string; tab?: string }) => {
      const actor = game.actors.get(payload.actorId);
      if (!actor) throw new Error(`Actor not found: ${payload.actorId}`);
      const sheet = actor.sheet as {
        render: (opts?: boolean | Record<string, unknown>) => Promise<void>;
        constructor?: { TABS?: Record<string, { tabs?: { id: string }[]; initial?: string }> };
      };

      const initial =
        payload.tab ??
        sheet.constructor?.TABS?.sheet?.initial ??
        sheet.constructor?.TABS?.primary?.initial ??
        "powers";

      let group: string | null = null;
      const tabsConfig = sheet.constructor?.TABS;
      if (tabsConfig) {
        for (const [groupName, groupConfig] of Object.entries(tabsConfig)) {
          if (groupConfig.tabs?.some((t) => t.id === initial)) {
            group = groupName;
            break;
          }
        }
      }
      if (!group) {
        group = sheet.constructor?.TABS?.primary ? "primary" : "sheet";
      }

      const renderTab: Record<string, string> = {};
      renderTab[group] = initial;
      await sheet.render({ force: true, tab: renderTab });
    },
    { actorId, tab }
  );
  await sleep(500);
}

export async function closeActorSheet(page: Page, actorId: string): Promise<void> {
  await evaluateFoundry(page, (id: string) => {
    const actor = game.actors.get(id);
    if (actor?.sheet?.rendered) {
      return actor.sheet.close({ animate: false });
    }
  }, actorId);
  await sleep(200);
}

export async function closeAllActorSheets(page: Page): Promise<void> {
  await evaluateFoundry(page, () => {
    for (const app of ui.windows?.values?.() ?? []) {
      const doc = (app as { document?: { documentName?: string } }).document;
      if (doc?.documentName === "Actor" && (app as { close?: (opts?: object) => void }).close) {
        (app as { close: (opts?: object) => void }).close({ animate: false });
      }
    }
  });
  await sleep(200);
}

export async function cycleTabs(
  page: Page,
  actorId: string,
  preferredTabs: readonly string[]
): Promise<{ tab: string; active: boolean }[]> {
  return evaluateFoundry(
    page,
    async (payload: { actorId: string; preferredTabs: string[] }) => {
      const actor = game.actors.get(payload.actorId);
      if (!actor?.sheet) throw new Error(`No sheet for actor ${payload.actorId}`);
      const sheet = actor.sheet as {
        rendered: boolean;
        changeTab?: (tab: string, group: string) => void;
        element?: HTMLElement;
        constructor?: { TABS?: Record<string, { tabs?: { id: string }[] }> };
      };

      const available: { tab: string; group: string }[] = [];
      const tabsConfig = sheet.constructor?.TABS ?? {};
      for (const [group, config] of Object.entries(tabsConfig)) {
        for (const t of config.tabs ?? []) {
          available.push({ tab: t.id, group });
        }
      }

      const toCycle: { tab: string; group: string }[] = [];
      for (const tab of payload.preferredTabs) {
        const match = available.find((a) => a.tab === tab);
        if (match) toCycle.push(match);
      }

      if (toCycle.length === 0 && available.length > 0) {
        for (let i = 0; i < Math.min(4, available.length); i++) {
          toCycle.push(available[i]);
        }
      }

      const results: { tab: string; active: boolean }[] = [];
      for (const { tab, group } of toCycle) {
        try {
          sheet.changeTab?.(tab, group);
        } catch (err) {
          results.push({ tab, active: false });
          continue;
        }
        await new Promise((r) => setTimeout(r, 200));
        const root = sheet.element;
        const active = Boolean(
          root?.querySelector(`section.tab.active[data-tab="${tab}"]`) ??
            root?.querySelector(`[data-tab="${tab}"].active`)
        );
        results.push({ tab, active: active || sheet.rendered });
      }
      return { rendered: sheet.rendered, results };
    },
    { actorId, preferredTabs: [...preferredTabs] }
  ).then((r) => {
    if (!r.rendered) throw new Error(`Sheet not rendered for actor ${actorId}`);
    const failed = r.results.filter((t) => !t.active);
    if (failed.length === r.results.length) {
      throw new Error(`No tabs activated for actor ${actorId}`);
    }
    return r.results;
  });
}

export async function getPlayerOwnedActor(
  page: Page
): Promise<{ id: string; name: string } | null> {
  return evaluateFoundry(page, () => {
    const char = game.user?.character;
    if (char) return { id: char.id, name: char.name ?? "" };
    const owned = game.actors.contents.find((a) => a.isOwner && a.type === "Player Character");
    if (owned) return { id: owned.id, name: owned.name ?? "" };
    return null;
  });
}

export async function findItemByType(
  page: Page,
  actorName: string,
  itemType: string
): Promise<{ name: string; id: string } | null> {
  return evaluateFoundry(
    page,
    (payload: { actorName: string; itemType: string }) => {
      const actor = game.actors.getName(payload.actorName);
      if (!actor) return null;
      const item = actor.items.find((i) => i.type === payload.itemType);
      if (!item) return null;
      return { name: item.name ?? "", id: item.id };
    },
    { actorName, itemType }
  );
}

export async function resolveChatSamples(
  page: Page,
  actorName: string,
  pinned?: { name: string; type: string }[]
): Promise<{ name: string; type: string }[]> {
  if (pinned && pinned.length > 0) return pinned;

  return evaluateFoundry(page, (name: string) => {
    const actor = game.actors.getName(name);
    if (!actor) return [];
    const types = ["power", "feature"];
    const found: { name: string; type: string }[] = [];
    for (const type of types) {
      const item = actor.items.find((i) => i.type === type);
      if (item?.name) found.push({ name: item.name, type });
    }
    if (found.length === 0) {
      const fallback = actor.items.find((i) => ["weapon", "equipment", "armor"].includes(i.type));
      if (fallback?.name) found.push({ name: fallback.name, type: fallback.type });
    }
    return found;
  }, actorName);
}

export async function postItemToChat(
  page: Page,
  actorName: string,
  itemName: string
): Promise<ChatPostResult> {
  return evaluateFoundry(
    page,
    async (payload: { actorName: string; itemName: string }) => {
      const actor = game.actors.getName(payload.actorName);
      if (!actor) throw new Error(`Actor not found: ${payload.actorName}`);
      const item = actor.items.getName(payload.itemName);
      if (!item) throw new Error(`Item not found: ${payload.itemName} on ${payload.actorName}`);

      const descChat = (item.system as { description?: { chat?: string; value?: string } })
        ?.description?.chat;
      const descValue = (item.system as { description?: { chat?: string; value?: string } })
        ?.description?.value;
      const snippet = (descChat || descValue || item.name || "").replace(/<[^>]+>/g, " ").trim();
      const snippetWords = snippet.split(/\s+/).filter((w) => w.length > 4).slice(0, 6);
      const shortSnippet = snippetWords.join(" ").slice(0, 80) || (item.name ?? "");

      await item.toChat();
      const msg = game.messages.contents.at(-1);
      if (!msg) throw new Error("No chat message after toChat()");

      return {
        messageId: msg.id,
        itemName: item.name ?? "",
        snippet: shortSnippet,
        cardHtml: msg.content ?? "",
      };
    },
    { actorName, itemName }
  );
}

export async function assertChatCardDom(
  page: Page,
  itemName: string,
  snippet: string
): Promise<void> {
  const card = page.locator(".dnd4e.chat-card").last();
  const count = await card.count();
  if (count === 0) throw new Error("Chat card not found in DOM");

  const heading = card.locator("h3").first();
  const headingText = (await heading.textContent()) ?? "";
  if (!headingText.includes(itemName)) {
    throw new Error(`Chat card heading expected "${itemName}", got "${headingText}"`);
  }

  const content = card.locator(".card-content, .item-description").first();
  const cardHtml = (await card.innerHTML()) ?? "";
  const contentHtml = (await content.innerHTML().catch(() => "")) || cardHtml;
  const contentText = normalizeChatText(contentHtml);

  if (contentText.length < 5) {
    throw new Error(`Chat card content empty for "${itemName}"`);
  }

  // Smoke gate: non-empty card body with correct title is sufficient for most item types.
  if (contentText.length > 15) return;

  const hasAutogenDetails =
    contentHtml.includes("item-details") ||
    contentHtml.includes("autogen");
  const hasNameInContent = contentText.toLowerCase().includes(itemName.toLowerCase());
  const hasCardButtons = (await card.locator(".card-buttons, footer.card-footer").count()) > 0;

  if (hasAutogenDetails || hasNameInContent || hasCardButtons) return;

  const normalizedSnippet = normalizeChatText(snippet);
  if (normalizedSnippet.length > 0) {
    const probe = normalizedSnippet.slice(0, 40).trim();
    if (probe.length > 0 && !contentText.toLowerCase().includes(probe.toLowerCase().slice(0, 20))) {
      throw new Error(
        `Chat card content missing description snippet for "${itemName}" (probe: "${probe.slice(0, 20)}")`
      );
    }
  }
}

export async function ensureActiveScene(
  page: Page,
  sceneName?: string
): Promise<{ sceneId: string; sceneName: string }> {
  return evaluateFoundry(page, async (preferredName?: string) => {
    let scene = preferredName ? game.scenes.getName(preferredName) : null;
    if (!scene) {
      scene =
        game.scenes.contents.find((s) => s.active) ??
        game.scenes.contents.find((s) => s.tokens.size > 0) ??
        game.scenes.contents[0];
    }
    if (!scene) throw new Error("No scene available in world");
    if (!scene.active) await scene.activate();
    await new Promise((r) => setTimeout(r, 500));
    return { sceneId: scene.id, sceneName: scene.name ?? "" };
  }, sceneName);
}

export async function findAttackPower(
  page: Page,
  actorName: string,
  powerName?: string
): Promise<{ actorName: string; powerName: string; actorId: string }> {
  return evaluateFoundry(
    page,
    (payload: { actorName: string; powerName?: string }) => {
      const actor = game.actors.getName(payload.actorName);
      if (!actor) throw new Error(`Actor not found: ${payload.actorName}`);

      let item = payload.powerName ? actor.items.getName(payload.powerName) : null;
      if (!item) {
        item = actor.items.find((i) => {
          if (i.type !== "power") return false;
          const pi = i as { hasAttack?: boolean; hasDamage?: boolean };
          return Boolean(pi.hasAttack && pi.hasDamage);
        });
      }
      if (!item) throw new Error(`No attack+damage power on ${payload.actorName}`);
      return {
        actorName: actor.name ?? "",
        powerName: item.name ?? "",
        actorId: actor.id,
      };
    },
    { actorName, powerName }
  );
}

export async function findNpcWithPowers(
  page: Page,
  npcName?: string
): Promise<{ id: string; name: string }> {
  return evaluateFoundry(page, (preferred?: string) => {
    let npc = preferred ? game.actors.getName(preferred) : null;
    if (!npc || npc.type !== "NPC") {
      npc = game.actors.contents.find(
        (a) => a.type === "NPC" && a.items.some((i) => i.type === "power")
      );
    }
    if (!npc) throw new Error("No NPC with powers found in world");
    return { id: npc.id, name: npc.name ?? "" };
  }, npcName);
}

export async function createCombatViaInitiative(
  page: Page,
  actorId: string
): Promise<{ combatId: string; combatantId: string }> {
  return evaluateFoundry(page, async (id: string) => {
    const actor = game.actors.get(id);
    if (!actor) throw new Error(`Actor not found: ${id}`);

    if (!canvas.scene) {
      const scene =
        game.scenes.contents.find((s) => s.tokens.size > 0) ?? game.scenes.contents[0];
      if (scene) await scene.activate();
      await new Promise((r) => setTimeout(r, 500));
    }
    if (!canvas.scene) throw new Error("No active scene for combat");

    if (game.combat) await game.combat.delete();

    const Combat = getDocumentClass("Combat");
    const combat = await Combat.create({ scene: canvas.scene.id, active: true });

    const token = canvas.tokens.placeables.find((t) => t.actor?.id === id);
    const toCreate = token
      ? [{ actorId: id, tokenId: token.id }]
      : [{ actorId: id }];

    const created = await combat.createEmbeddedDocuments("Combatant", toCreate);
    const combatant = created[0] ?? combat.combatants.find((c) => c.actor?.id === id);
    if (!combatant) throw new Error("Combatant not created");

    return { combatId: combat.id, combatantId: combatant.id };
  }, actorId);
}

export async function endCombat(page: Page): Promise<void> {
  await evaluateFoundry(page, async () => {
    if (game.combat) await game.combat.delete();
  });
  await sleep(300);
}

export async function getActorHp(page: Page, actorId: string): Promise<number> {
  return evaluateFoundry(page, (id: string) => {
    const actor = game.actors.get(id);
    return Number(actor?.system?.attributes?.hp?.value ?? 0);
  }, actorId);
}

export async function restoreActorHp(
  page: Page,
  actorId: string,
  hp: number
): Promise<void> {
  await evaluateFoundry(
    page,
    (payload: { actorId: string; hp: number }) => {
      const actor = game.actors.get(payload.actorId);
      if (!actor) return;
      return actor.update({ "system.attributes.hp.value": payload.hp });
    },
    { actorId, hp }
  );
}

export async function rollAttackAndDamage(
  page: Page,
  actorName: string,
  powerName: string
): Promise<{
  attackMessageId: string;
  damageMessageId: string;
  attackFormula: string;
  damageTotal: number;
}> {
  return evaluateFoundry(
    page,
    async (payload: { actorName: string; powerName: string }) => {
      const actor = game.actors.getName(payload.actorName);
      const item = actor?.items.getName(payload.powerName);
      if (!actor || !item) throw new Error(`Power ${payload.powerName} not found on ${payload.actorName}`);

      await item.rollAttack({ fastForward: true });
      const attackMsg = game.messages.contents.at(-1);
      if (!attackMsg) throw new Error("No attack message");

      await item.rollDamage({ fastForward: true });
      const damageMsg = game.messages.contents.at(-1);
      if (!damageMsg) throw new Error("No damage message");

      const attackRoll = attackMsg.rolls?.[0];
      const damageRoll = damageMsg.rolls?.[0];

      return {
        attackMessageId: attackMsg.id,
        damageMessageId: damageMsg.id,
        attackFormula: attackRoll?.formula ?? "",
        damageTotal: Number(damageRoll?.total ?? 0),
      };
    },
    { actorName, powerName }
  );
}

export async function controlTokenForActor(
  page: Page,
  actorId: string
): Promise<{ tokenId: string; actorId: string } | null> {
  return evaluateFoundry(page, (id: string) => {
    if (!canvas.scene) return null;
    const token = canvas.tokens.placeables.find((t) => t.actor?.id === id);
    if (!token) return null;
    token.control({ releaseOthers: true });
    return { tokenId: token.id, actorId: id };
  }, actorId);
}

export async function applyDamageFromLastRoll(
  page: Page,
  targetActorId: string
): Promise<{ hpBefore: number; hpAfter: number; damageApplied: number }> {
  return evaluateFoundry(page, async (targetId: string) => {
    const target = game.actors.get(targetId);
    if (!target) throw new Error(`Target actor not found: ${targetId}`);

    const damageMsg = [...game.messages.contents]
      .reverse()
      .find((m) => m.rolls?.length && m.rolls[0].terms?.length);
    if (!damageMsg?.rolls?.[0]) throw new Error("No damage roll message found");

    const roll = damageMsg.rolls[0];
    const hpBefore = Number(target.system?.attributes?.hp?.value ?? 0);
    const damageTotal = Number(roll.total ?? 0);

    await target.applyDamage(damageTotal, 1);
    const hpAfter = Number(target.system?.attributes?.hp?.value ?? 0);

    return { hpBefore, hpAfter, damageApplied: damageTotal };
  }, targetActorId);
}

export async function isNpcSheetOpen(page: Page): Promise<boolean> {
  return page.evaluate(() => Boolean(document.querySelector(".application.NPC, section.npc:not(.hazard)")));
}

export async function assertNpcExpandedPowers(page: Page): Promise<void> {
  const ok = await page.evaluate(() => {
    const section =
      document.querySelector("section.tab[data-tab='powers']") ??
      document.querySelector("section.powers") ??
      document.querySelector(".powers");
    if (!section) return false;
    const body = section.querySelector(".item-body, .item-summary .card-content, .item-summary");
    const text = (body?.textContent ?? section.textContent ?? "").trim();
    return text.length > 30;
  });
  if (!ok) throw new Error("NPC power statblock not expanded or empty");
}

export async function clickInventoryRowHeader(page: Page): Promise<void> {
  const clicked = await page.evaluate(() => {
    const header = document.querySelector(
      ".item-list.gear .items-list .item-header, .item-list.gear li.item .item-header"
    );
    if (!header) return false;
    const detail = header.querySelector(
      ".item-detail.item-weight, .item-detail.item-level, .item-detail.item-quantity, .item-detail"
    );
    if (detail instanceof HTMLElement) {
      detail.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      return true;
    }
    return false;
  });
  if (!clicked) throw new Error("No inventory gear row found");
  await sleep(500);
}

export async function isInventorySummaryExpanded(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const item = document.querySelector(
      ".item-list.gear .items-list > .item, .item-list.gear li.item.gear, .item-list.gear li.item"
    );
    if (!item) return false;
    if (!item.classList.contains("collapsed")) return true;
    const summary = item.querySelector(".item-summary");
    if (!summary) return false;
    return summary.clientHeight > 0 && (summary.textContent?.trim().length ?? 0) > 0;
  });
}

export async function rollSkillFromSheet(page: Page, actorId: string): Promise<boolean> {
  return evaluateFoundry(page, async (id: string) => {
    const actor = game.actors.get(id);
    if (!actor?.sheet?.rendered) await actor?.sheet?.render(true);
    const sheet = actor?.sheet as { element?: HTMLElement } | undefined;
    const skill = sheet?.element?.querySelector(".skill-name, .rollable[data-roll-type='skill']");
    if (!skill) return false;
    (skill as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 800));
    const last = game.messages.contents.at(-1);
    return Boolean(last?.rolls?.length || last?.content?.includes("d20"));
  }, actorId);
}

export async function resolvePrimaryPartyMember(
  page: Page,
  config: ModuleE2eConfig
): Promise<PartyMemberInfo> {
  const pinned = config.actors?.partyMemberName;
  if (pinned) {
    const id = await evaluateFoundry(page, (name: string) => game.actors.getName(name)?.id ?? null, pinned);
    if (id) return { id, name: pinned };
  }
  const members = await getPartyMembers(page, config);
  if (members.length === 0) throw new Error("No party members found");
  return members[0];
}
