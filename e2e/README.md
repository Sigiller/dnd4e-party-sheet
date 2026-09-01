# E2E test world: Scales of War

Local Foundry world for automated smoke, regression, and perf tests for **dnd4e-party-sheet**.

Production-like copy: **Scales of War** (`scales-of-war`).

## Requirements

- Foundry **v14** (verified **14.367**)
- System **dnd4e** **0.9.2** (as in this world)
- Modules enabled:
  - **dnd4e-party-sheet**
  - **[Hook Macros (launchmacro)](https://foundryvtt.com/packages/launchmacro)** v3+

## World path

```
Foundry12/Data/worlds/scales-of-war/
```

Set in `Data/tools/foundry-e2e/.env` (copy from `.env.example`):

```
FVTT_WORLD=scales-of-war          # id мира (Scales of War)
E2E_PARTY_FOLDER=Party
E2E_USER_GM=Test_GM
E2E_USER_PLAYER=Nord
E2E_USER_PLAYER2=Gigil
E2E_ACTOR_PARTY_MEMBER=Nia
```

Full list of variables: [`Data/tools/foundry-e2e/.env.example`](../../../tools/foundry-e2e/.env.example).

Module [`e2e/config.ts`](config.ts) reads these via `loadPartySheetE2eConfig()` — no hardcoded names in source.

## Users (no passwords)

E2E uses only **GM** and **players**. Аккаунты `Test_*` (Assistant, Trusted, …) **не участвуют** в автотестах.

| Роль E2E | Кто на /join | В config |
|----------|--------------|----------|
| **gm** | `Test_GM` (или `Gamemaster`, если доступен) | `E2E_USER_GM` |
| **player** | `Nord`, `Gigil`, `Iuliia`, … — все, кроме GM и `Test_*` | `E2E_USER_PLAYER` |

```env
E2E_USER_GM=Test_GM
E2E_USER_PLAYER=Nord
E2E_USER_PLAYER2=Gigil
```

## World content (already present)

- Actor folder **Party** with multiple **Player Character** actors (Nia, Orana, …)
- Many NPCs outside Party — system regression and Foundry core smoke
- Active scene with tokens recommended for combat/damage tests
- Optional: fox-4e-styling for manual visual QA

## Hook Macros setup

Import macros from [`e2e/macros/`](macros/) into the world, then **Hook Macros → Settings**:

| Macro | Hook | Notes |
|-------|------|-------|
| `QA_SignalReady` | `ready` | Sets `window.__qa` for Playwright sync |
| `QA_OpenPartySheet` | *(invoked by tests)* | |
| `QA_ResetStash` | *(GM setup)* | |
| `QA_PerfMark` | *(perf only)* | |
| `QA_ActivateScene` | *(invoked by tests)* | Activates scene with tokens |
| `QA_CleanupCombat` | *(invoked by tests)* | Ends combat between runs |

## Test suites

| File | Tests | Purpose |
|------|-------|---------|
| `smoke.test.ts` | 8 | Party sheet module smoke |
| `system-regression.test.ts` | 4 | Module hooks vs dnd4e sheets |
| `foundry-core.test.ts` | 12 | Foundry/dnd4e core sanity (sheets, chat, combat, NPC) |

**Total:** 24 tests in `npm run e2e:smoke` (8 module + 4 regression + 12 foundry-core).

### Foundry core fixtures (`.env`)

Optional overrides; leave empty for auto-discovery in the world:

```env
E2E_ACTOR_PARTY_MEMBER=Nia
# E2E_SCENE_NAME=
# E2E_NPC_NAME=
# E2E_ATTACK_POWER_BY_ACTOR={"Nia":"Melee Basic Attack"}
# E2E_CHAT_SAMPLES=[{"actorName":"Nia","items":[{"name":"Melee Basic Attack","type":"power"}]}]
```

## Running tests

Foundry must be running at `http://localhost:30000` with **Scales of War** joinable.

Tests run in **two shared sessions** (one browser context per role): all **gm** tests, then all **player** tests. Only the first test in each session performs a full `/join`; the rest reuse the same page with cleanup between tests.

```bash
cd Data/tools/foundry-e2e && npm run setup   # once

cd Data/modules/dnd4e-party-sheet
npm run check
npm run e2e:smoke
npm run e2e:perf
```

## Pre-release

```bash
npm run check && npm run e2e:smoke
```

## Reports

- Perf: `e2e/reports/perf-<timestamp>.json`
- **Timing:** `e2e/reports/timing-<timestamp>.json` — длительность каждого теста (join / setup / test body), сортировка в консоли от самого медленного
- Baselines: [`baselines.json`](baselines.json)
