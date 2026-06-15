performance.mark("party-sheet-perf-start");
const api = game.modules.get("dnd4e-party-sheet")?.api;
if (api?.openPartySheet) await api.openPartySheet();
performance.mark("party-sheet-perf-end");
performance.measure("party-sheet-open", "party-sheet-perf-start", "party-sheet-perf-end");
