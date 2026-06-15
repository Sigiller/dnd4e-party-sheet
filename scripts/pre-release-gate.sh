#!/usr/bin/env bash
# Pre-release gate: run smoke E2E when pushing a version tag and Foundry is reachable.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ "${SKIP_E2E:-}" == "1" ]]; then
  echo "pre-release: SKIP_E2E=1 — skipping e2e:smoke"
  exit 0
fi

BASE="${FVTT_BASE:-http://localhost:30000}"
if ! curl -sf --max-time 3 "${BASE}/" >/dev/null 2>&1; then
  echo "pre-release: Foundry not reachable at ${BASE}" >&2
  echo "pre-release: Start Foundry, run: npm run e2e:smoke" >&2
  echo "pre-release: Or push with SKIP_E2E=1 to skip this check" >&2
  exit 1
fi

echo "pre-release: Foundry up — running npm run e2e:smoke"
npm run e2e:smoke
