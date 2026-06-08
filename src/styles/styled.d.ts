import "styled-components";
import type { PartySheetTheme } from "./theme.js";

declare module "styled-components" {
  export interface DefaultTheme extends PartySheetTheme {}
}
