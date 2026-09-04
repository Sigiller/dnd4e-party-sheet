# D&D 4e Party Sheet

Foundry VTT v14 module for the **dnd4e** system: party overview (skills, languages, member cards) and shared party stash.

## Install

Manifest URL (always use **latest** for updates):

```
https://github.com/Sigiller/dnd4e-party-sheet/releases/latest/download/module.json
```

## Setup

1. Enable the module on a **dnd4e** world.
2. Create an Actor folder named **Party** (or change **Party Folder Name** in module settings).
3. Click the scroll icon on that folder to open the Party Sheet.

Party members are Player Characters with an active **Player** or **Trusted Player** user at **Owner** ownership.

A hidden **Party Stash** NPC is created in the Party folder for shared inventory.

## Development

```bash
cd Data/modules/dnd4e-party-sheet
npm install        # installs Husky pre-push hook via prepare
npm run build      # outputs dist/main.js (styles via styled-components in bundle)
npm run dev        # watch mode
npm run test
```

### E2E (local Foundry)

Requires a running Foundry instance and a configured **dnd4e** world. Configuration lives in **`Data/tools/foundry-e2e/.env`** (copy from `.env.example`).

```env
FVTT_WORLD=your-world-id          # world id from Foundry setup
E2E_PARTY_FOLDER=Party            # actor folder name (module setting)
E2E_USER_GM=Gamemaster            # GM account on /join
E2E_USER_PLAYER=Player            # player account (party member)
E2E_USER_PLAYER2=Player2          # second player (optional)
E2E_ACTOR_PARTY_MEMBER=YourPC     # PC in party folder (optional; auto-discover if empty)
```

Full details: [`e2e/README.md`](e2e/README.md).

```bash
cd Data/tools/foundry-e2e && npm run setup   # once

cd Data/modules/dnd4e-party-sheet
npm run check
npm run e2e:smoke   # 24 tests: smoke + regression + foundry-core (~2–3 min)
npm run e2e:perf    # performance baselines (advisory)
npm run e2e         # build + smoke + perf
```

Timing report after smoke: `e2e/reports/timing-<timestamp>.json`.

Before release:

```bash
npm run check && npm run e2e:smoke
```

Commit `dist/` before tagging a release, or let GitHub Actions build on tag push.

## Release

```bash
# Bump version in module.json, then:
git tag v0.7.2
git push origin v0.7.2
```

Husky pre-push blocks tag pushes when the tag (`vX.Y.Z`) does not match
`module.json` `version`, and runs **e2e:smoke** when Foundry is reachable
(`SKIP_E2E=1` to skip). Manual check:

```bash
npm run verify-tag-version -- refs/tags/v0.6.2 push
```

## Recommended modules

- [fox-4e-styling](https://github.com/EndlesNights/fox-4e-styling) — fonts and 4e sheet palette
