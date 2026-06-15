const api = game.modules.get("dnd4e-party-sheet")?.api;
if (!api?.openPartySheet) {
  throw new Error("dnd4e-party-sheet API missing");
}
await api.openPartySheet();
