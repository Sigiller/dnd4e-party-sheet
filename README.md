# D&D 4e Party Sheet

Foundry VTT v13 module for the **dnd4e** system: party overview (skills, languages, member cards) and shared party stash.

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
npm install
npm run build      # outputs dist/main.js (styles via styled-components in bundle)
npm run dev        # watch mode
npm test
```

Commit `dist/` before tagging a release, or let GitHub Actions build on tag push.

## Release

```bash
# Bump version in module.json and package.json, then:
git tag v0.3.0
git push origin v0.3.0
```

## Recommended modules

- [fox-4e-styling](https://github.com/EndlesNights/fox-4e-styling) — fonts and 4e sheet palette
