#!/usr/bin/env node
/**
 * Verify pinned dnd4e still exposes symbols used by dnd4e-party-sheet (libWrapper / hooks).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const moduleRoot = path.resolve(__dirname, "..");
const systemRoot = path.resolve(moduleRoot, "../../systems/dnd4e");
const pkg = JSON.parse(fs.readFileSync(path.join(moduleRoot, "package.json"), "utf8"));
const EXPECTED_VERSION = pkg.dnd4eSystem.version;
const ACTOR_SHEET_REL = "module/applications/sheets/actor-sheet.mjs";

function read(rel) {
	return fs.readFileSync(path.join(systemRoot, rel), "utf8");
}

function systemExists() {
	return fs.existsSync(path.join(systemRoot, "system.json"));
}

const checks = [];

function ok(name, pass, detail = "") {
	checks.push({ name, pass, detail });
}

if (!systemExists()) {
	ok("systems/dnd4e present", false, `Expected ${systemRoot} (clone dnd4e ${EXPECTED_VERSION} for local verify)`);
	console.log(JSON.stringify({ systemVersion: null, allPass: false, checks }, null, 2));
	process.exit(1);
}

const systemJson = JSON.parse(fs.readFileSync(path.join(systemRoot, "system.json"), "utf8"));
const actorSheet = read(ACTOR_SHEET_REL);

ok("system.version", systemJson.version === EXPECTED_VERSION, systemJson.version);
ok("ActorSheet4e class", /class ActorSheet4e/.test(actorSheet));
ok(
	"ActorSheet4e uses ActorSheetV2",
	/ActorSheetV2/.test(actorSheet) && /class ActorSheet4e/.test(actorSheet)
);
ok("ActorSheet4e._onDropItem", /async _onDropItem\s*\(/.test(actorSheet));
ok("ActorSheet4e._onDropItemCreate", /async _onDropItemCreate\s*\(/.test(actorSheet));
ok("Actor sheet inventory tab", /inventory/.test(actorSheet) && /TABS/.test(actorSheet));

const allPass = checks.every((c) => c.pass);
console.log(JSON.stringify({ systemVersion: systemJson.version, allPass, checks }, null, 2));
process.exit(allPass ? 0 : 1);
