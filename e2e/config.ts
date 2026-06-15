import type { ModuleE2eConfig } from "../../../tools/foundry-e2e/src/types.js";
import { loadPartySheetE2eConfig } from "../../../tools/foundry-e2e/src/module-config.js";

/** Values come from `Data/tools/foundry-e2e/.env` (see `.env.example`). */
export const config: ModuleE2eConfig = loadPartySheetE2eConfig();
