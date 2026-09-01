import { MODULE_ID } from "./constants.js";

/** Resolve a module asset path for use in img/src and CSS url(). */
export function moduleAsset(relativePath: string): string {
  return `modules/${MODULE_ID}/${relativePath.replace(/^\//, "")}`;
}

export const UI_ASSETS = {
  headerWood: moduleAsset("assets/ui/header-wood.png"),
  tabDamask: moduleAsset("assets/ui/tab-damask.jpg"),
} as const;
