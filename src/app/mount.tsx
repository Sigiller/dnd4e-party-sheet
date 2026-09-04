import { createRoot, type Root } from "react-dom/client";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "../styles/GlobalStyles.js";
import { FoxInventoryStyles } from "../styles/foxInventoryStyles.js";
import { partySheetTheme } from "../styles/theme.js";
import { PartySheetRoot, type PartySheetProps } from "./PartySheetRoot.js";

let root: Root | null = null;
let host: HTMLElement | null = null;

export function mountPartySheet(element: HTMLElement, props: PartySheetProps): void {
  if (host !== element) {
    unmountPartySheet();
    host = element;
    root = createRoot(element);
    root.render(
      <ThemeProvider theme={partySheetTheme}>
        <GlobalStyles />
        <FoxInventoryStyles />
        <PartySheetRoot {...props} />
      </ThemeProvider>
    );
    return;
  }
  root?.render(
    <ThemeProvider theme={partySheetTheme}>
      <GlobalStyles />
      <FoxInventoryStyles />
      <PartySheetRoot {...props} />
    </ThemeProvider>
  );
}

/** Passing an owner element only unmounts when the mounted host still lives inside it. */
export function unmountPartySheet(owner?: HTMLElement): void {
  if (owner && host && !owner.contains(host)) return;
  root?.unmount();
  root = null;
  host = null;
}
