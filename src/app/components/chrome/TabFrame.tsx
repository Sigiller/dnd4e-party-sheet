import { useId, useRef } from "react";
import { useTheme } from "styled-components";
import {
  ACTIVE_SHADOW,
  INACTIVE_SHADOW,
  TAB_RAISE,
  tabBorderPath,
  tabPanelPath,
  tabUnderline,
  type TabSide,
} from "./tabFrameGeometry.js";
import { useElementSize } from "./useElementSize.js";
import { ChromeSvg, Frame, ScrollRegion, TabHit, TabList } from "./TabFrame.styles.js";

export type SheetTabId = "overview" | "stash";

/** Left→right order from the design: STASH on the left, OVERVIEW on the right. */
const TABS: readonly { id: SheetTabId; side: TabSide }[] = [
  { id: "stash", side: "left" },
  { id: "overview", side: "right" },
];

interface TabFrameProps {
  activeTab: SheetTabId;
  onTabChange: (tab: SheetTabId) => void;
  labels: Record<SheetTabId, string>;
  ariaLabel: string;
  children: React.ReactNode;
}

/**
 * The parchment scroll panel with ribbon tabs. The chrome (panel silhouette,
 * damask texture, decorative border, tucked-behind inactive tongue) is drawn
 * by runtime-generated SVG paths — see tabFrameGeometry.ts. Interaction lives
 * in real <button role="tab"> elements layered on top; content scrolls in an
 * HTML region so the chrome never repaints on scroll.
 *
 * Path data is passed as JSX attributes on purpose: routing measured values
 * through styled-components would mint a new class per resize tick.
 */
export function TabFrame({ activeTab, onTabChange, labels, ariaLabel, children }: TabFrameProps) {
  const theme = useTheme();
  const [frameRef, { width: w, height: h }] = useElementSize<HTMLDivElement>();
  const buttonRefs = useRef<Partial<Record<SheetTabId, HTMLButtonElement | null>>>({});
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const clipId = `ptf-clip-${uid}`;
  const patternId = `ptf-damask-${uid}`;
  const sheenId = `ptf-sheen-${uid}`;
  const stripId = `ptf-strip-${uid}`;
  const fadeId = `ptf-fade-${uid}`;
  const panelId = `ptf-panel-${uid}`;

  const activeSide: TabSide = activeTab === "stash" ? "left" : "right";
  const inactiveTab: SheetTabId = activeTab === "stash" ? "overview" : "stash";
  const inactiveSide: TabSide = activeSide === "left" ? "right" : "left";
  const ready = w > 0 && h > TAB_RAISE + 4;

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    let next: SheetTabId | null = null;
    if (event.key === "ArrowLeft" || event.key === "Home") next = "stash";
    else if (event.key === "ArrowRight" || event.key === "End") next = "overview";
    if (next === null || next === activeTab) return;
    event.preventDefault();
    onTabChange(next);
    buttonRefs.current[next]?.focus();
  };

  const panelD = ready ? tabPanelPath(w, h, activeSide) : "";
  const borderD = ready ? tabBorderPath(w, h, activeSide) : "";
  const underline = ready ? tabUnderline(w, activeSide) : null;

  return (
    <Frame ref={frameRef}>
      {ready && (
        <ChromeSvg
          width={w}
          height={h - 4}
          viewBox={`0 0 ${w} ${h - 4}`}
          style={{ top: 4, filter: INACTIVE_SHADOW }}
          aria-hidden="true"
        >
          <path d={tabPanelPath(w, h - 4, inactiveSide)} fill={theme.tabInactiveBase} />
        </ChromeSvg>
      )}
      {ready && (
        <ChromeSvg
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          style={{ filter: ACTIVE_SHADOW }}
          aria-hidden="true"
        >
          <defs>
            <clipPath id={clipId}>
              <path d={panelD} />
            </clipPath>
            <pattern id={patternId} width={375} height={325} patternUnits="userSpaceOnUse">
              <image
                href={theme.textureDamask}
                width={375}
                height={325}
                preserveAspectRatio="none"
              />
            </pattern>
            <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={stripId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#cfc3aa" stopOpacity="1" />
              <stop offset="1" stopColor="#cfc3aa" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={fadeId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={theme.colourFrameLine} stopOpacity="0" />
              <stop offset="0.5" stopColor={theme.colourFrameLine} stopOpacity="1" />
              <stop offset="1" stopColor={theme.colourFrameLine} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={panelD} fill={theme.tabActiveBase} />
          <g clipPath={`url(#${clipId})`}>
            <rect
              x={0}
              y={TAB_RAISE}
              width={w}
              height={h - TAB_RAISE}
              fill={`url(#${patternId})`}
              opacity={0.05}
              style={{ mixBlendMode: "darken" }}
            />
            <rect
              x={0}
              y={TAB_RAISE}
              width={w * 0.818}
              height={h - TAB_RAISE}
              fill={`url(#${sheenId})`}
              opacity={0.25}
            />
            <rect x={0} y={TAB_RAISE} width={w} height={34} fill={`url(#${stripId})`} />
          </g>
          {underline && (
            <rect
              x={underline.x}
              y={underline.y}
              width={underline.width}
              height={1}
              fill={`url(#${fadeId})`}
            />
          )}
          <path d={borderD} fill="none" stroke={theme.colourFrameLine} strokeWidth={1} />
        </ChromeSvg>
      )}
      <TabList role="tablist" aria-label={ariaLabel}>
        {TABS.map(({ id }) => (
          <TabHit
            key={id}
            ref={(el) => {
              buttonRefs.current[id] = el;
            }}
            type="button"
            role="tab"
            id={`ptf-tab-${id}-${uid}`}
            aria-selected={activeTab === id}
            aria-controls={panelId}
            tabIndex={activeTab === id ? 0 : -1}
            data-testid={`sheet-tab-${id}`}
            $active={activeTab === id}
            style={id === inactiveTab ? { paddingTop: 8 } : undefined}
            onClick={() => onTabChange(id)}
            onKeyDown={onKeyDown}
          >
            {labels[id]}
          </TabHit>
        ))}
      </TabList>
      <ScrollRegion
        role="tabpanel"
        id={panelId}
        aria-labelledby={`ptf-tab-${activeTab}-${uid}`}
      >
        {children}
      </ScrollRegion>
    </Frame>
  );
}
