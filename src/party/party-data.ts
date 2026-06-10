import { TRAINING_TRAINED } from "../constants.js";
import { getPartyMembers } from "./party-members.js";
import { currencyToGp } from "./wealth.js";
import {
  type ActorWithLegacyEffects,
  getDnd4eSystem,
  readActorLevel,
  requireActorId,
} from "../types/dnd4e.js";
import { localize } from "../i18n.js";

export interface PartySkillCompact {
  key: string;
  label: string;
  bonus: number;
  owners: string[];
}

export interface PartySkillDetailed {
  key: string;
  label: string;
  byMember: { memberId: string; memberName: string; bonus: number }[];
}

export interface LanguageEntry {
  key: string;
  label: string;
  owners: string[];
}

export interface MemberSummary {
  id: string;
  name: string;
  img: string;
  hp: { value: number; max: number };
  surges: { value: number; max: number };
  subtitle: string;
  defences: { ac: number; fort: number; ref: number; wil: number };
  senses: string[];
  effects: { name: string; img: string }[];
  trainedSkills: { key: string; label: string; total: number }[];
  gp: number;
  load: { value: number; max: number };
}

export interface PartySnapshot {
  partyLevel: number;
  members: MemberSummary[];
  skillsCompact: PartySkillCompact[];
  skillsDetailed: PartySkillDetailed[];
  languages: { spoken: LanguageEntry[]; script: LanguageEntry[] };
}

function detailsLine(actor: Actor.Implementation): string {
  const d = getDnd4eSystem(actor).details;
  if (!d) return "";
  const parts = [d.race, d.class, d.paragon, d.epic].filter((p) => p && String(p).trim());
  return parts.join(" / ");
}

function getSenseLabels(actor: Actor.Implementation): string[] {
  const senses = getDnd4eSystem(actor).senses;
  const special = senses?.special;
  if (!special) return [];
  const config = CONFIG.DND4E.special;
  const values = Array.isArray(special.value) ? special.value : special.value ? [special.value] : [];
  const labels: string[] = [];
  for (const key of values) {
    const label = config[key];
    if (label) labels.push(localize(label));
  }
  if (special.custom) {
    special.custom.split(";").forEach((c) => {
      const t = c.trim();
      if (t) labels.push(t);
    });
  }
  return labels;
}

async function getEffectIcons(
  actor: Actor.Implementation
): Promise<{ name: string; img: string }[]> {
  const legacy = actor as ActorWithLegacyEffects;
  let effects: { name: string; img: string }[] = [];
  if (typeof legacy.allApplicableEffects === "function") {
    const list = await legacy.allApplicableEffects();
    effects = Array.from(list as Iterable<{ name: string; img: string }>).map((e) => ({
      name: e.name,
      img: e.img || "icons/svg/aura.svg",
    }));
  } else if (typeof legacy.getActiveEffects === "function") {
    effects = legacy.getActiveEffects().map((e: { name: string; img: string }) => ({
      name: e.name,
      img: e.img || "icons/svg/aura.svg",
    }));
  }
  return effects;
}

function buildMember(
  actor: Actor.Implementation,
  effects: { name: string; img: string }[]
): MemberSummary {
  const sys = getDnd4eSystem(actor);
  const attrs = sys.attributes as { hp?: { value: number; max: number } } | undefined;
  const details = sys.details as { surges?: { value: number; max: number } } | undefined;
  const defences = sys.defences as Record<string, { value: number }> | undefined;
  const enc = sys.encumbrance as { value: number; max: number } | undefined;
  const skills = sys.skills as Record<string, { label?: string; total?: number; training?: number }> | undefined;

  const trainedSkills: MemberSummary["trainedSkills"] = [];
  if (skills) {
    for (const [key, sk] of Object.entries(skills)) {
      if ((sk.training ?? 0) < TRAINING_TRAINED) continue;
      const skillLabel = CONFIG.DND4E.skills[key]?.label;
      const label = sk.label ?? (skillLabel ? localize(skillLabel) : key);
      trainedSkills.push({ key, label, total: Number(sk.total) || 0 });
    }
    trainedSkills.sort((a, b) => a.label.localeCompare(b.label));
  }

  return {
    id: requireActorId(actor),
    name: actor.name,
    img: String(actor.img ?? ""),
    hp: {
      value: attrs?.hp?.value ?? 0,
      max: attrs?.hp?.max ?? 0,
    },
    surges: {
      value: details?.surges?.value ?? 0,
      max: details?.surges?.max ?? 0,
    },
    subtitle: detailsLine(actor),
    defences: {
      ac: defences?.ac?.value ?? 0,
      fort: defences?.fort?.value ?? 0,
      ref: defences?.ref?.value ?? 0,
      wil: defences?.wil?.value ?? 0,
    },
    senses: getSenseLabels(actor),
    effects,
    trainedSkills,
    gp: currencyToGp(sys.currency ?? {}),
    load: { value: enc?.value ?? 0, max: enc?.max ?? 0 },
  };
}

interface LanguageTrait {
  value?: Iterable<string> | string[] | string;
  custom?: string;
}

function languageTraitKeys(trait: LanguageTrait | undefined): string[] {
  if (!trait?.value) return [];
  const raw = trait.value;
  if (raw instanceof Set) return [...raw].map(String);
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") return [raw];
  return [...raw];
}

function languageTraitCustom(trait: LanguageTrait | undefined): string[] {
  const text = trait?.custom?.trim();
  if (!text) return [];
  return text
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
}

function collectLanguages(
  actors: Actor.Implementation[],
  kind: "spoken" | "script"
): LanguageEntry[] {
  const config = kind === "spoken" ? CONFIG.DND4E.spoken : CONFIG.DND4E.script;
  const map = new Map<string, { label: string; owners: Set<string> }>();

  const add = (mapKey: string, label: string, owner: string) => {
    let entry = map.get(mapKey);
    if (!entry) {
      entry = { label, owners: new Set() };
      map.set(mapKey, entry);
    }
    entry.owners.add(owner);
  };

  for (const actor of actors) {
    const lang = getDnd4eSystem(actor).languages;
    const trait = lang?.[kind];
    if (!trait) continue;

    for (const key of languageTraitKeys(trait)) {
      const label = config[key] ? localize(config[key]) : key;
      add(key, label, actor.name);
    }

    for (const customLabel of languageTraitCustom(trait)) {
      const mapKey = `custom:${customLabel.toLowerCase()}`;
      add(mapKey, customLabel, actor.name);
    }
  }

  return [...map.entries()]
    .map(([key, { label, owners }]) => {
      const ownerList = [...owners].sort();
      const count = ownerList.length;
      return {
        key,
        label: count > 1 ? `${label} (${count})` : label,
        owners: ownerList,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

function buildSkills(actors: Actor.Implementation[]): {
  compact: PartySkillCompact[];
  detailed: PartySkillDetailed[];
} {
  const skillKeys = new Set<string>();
  for (const actor of actors) {
    const skills = getDnd4eSystem(actor).skills;
    if (skills) Object.keys(skills).forEach((k) => skillKeys.add(k));
  }

  const compact: PartySkillCompact[] = [];
  const detailed: PartySkillDetailed[] = [];

  for (const key of [...skillKeys].sort()) {
    const entries: { memberId: string; memberName: string; bonus: number }[] = [];
    let maxBonus = -Infinity;
    const configLabel = CONFIG.DND4E.skills[key]?.label;

    for (const actor of actors) {
      const sk = getDnd4eSystem(actor).skills?.[key];
      const bonus = Number(sk?.total) || 0;
      entries.push({ memberId: requireActorId(actor), memberName: actor.name, bonus });
      if (bonus > maxBonus) maxBonus = bonus;
    }

    const sample = actors
      .map((a) => getDnd4eSystem(a).skills?.[key]?.label)
      .find(Boolean);
    const label = sample
      ? localize(sample)
      : configLabel
        ? localize(configLabel)
        : key;

    const owners = entries.filter((e) => e.bonus === maxBonus).map((e) => e.memberName);
    compact.push({ key, label, bonus: maxBonus, owners });
    detailed.push({ key, label, byMember: entries });
  }

  compact.sort((a, b) => a.label.localeCompare(b.label));
  detailed.sort((a, b) => a.label.localeCompare(b.label));

  return { compact, detailed };
}

export async function buildPartySnapshot(partyFolderId: string): Promise<PartySnapshot> {
  const actors = getPartyMembers(partyFolderId);
  const members: MemberSummary[] = [];

  for (const actor of actors) {
    const effects = await getEffectIcons(actor);
    members.push(buildMember(actor, effects));
  }

  const levels = actors.map((a) => readActorLevel(a));
  const partyLevel =
    levels.length > 0
      ? Math.floor(levels.reduce((s, l) => s + l, 0) / levels.length)
      : 0;

  const { compact, detailed } = buildSkills(actors);

  return {
    partyLevel,
    members,
    skillsCompact: compact,
    skillsDetailed: detailed,
    languages: {
      spoken: collectLanguages(actors, "spoken"),
      script: collectLanguages(actors, "script"),
    },
  };
}
