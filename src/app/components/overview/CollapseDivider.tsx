import { useTheme } from "styled-components";
import { useElementSize } from "../chrome/useElementSize.js";
import {
  Badge,
  BadgeLabel,
  BadgeOutline,
  BadgeStack,
  DividerButton,
  Rule,
  TaperArrow,
} from "./CollapseDivider.styles.js";

interface CollapseDividerProps {
  expanded: boolean;
  onToggle: () => void;
  collapseLabel: string;
  expandLabel: string;
  controlsId: string;
}

/**
 * Figma divider (nodes 440:788/440:1112): fading hairlines flanking a pointed
 * lozenge outline with a two-line taper arrow — above the badge while
 * expanded (collapse points up), below it while collapsed (expand points
 * down). The lozenge is generated from the measured badge width so localized
 * labels keep the designed 4.6:6 point slope.
 */
export function CollapseDivider({
  expanded,
  onToggle,
  collapseLabel,
  expandLabel,
  controlsId,
}: CollapseDividerProps) {
  const theme = useTheme();
  const [badgeRef, { width }] = useElementSize<HTMLSpanElement>();
  const h = 13;
  const points =
    width > 0
      ? `5.25,0.5 ${width - 5.25},0.5 ${width - 0.63},6.5 ${width - 5.25},12.5 5.25,12.5 0.63,6.5`
      : "";

  return (
    <DividerButton
      type="button"
      aria-expanded={expanded}
      aria-controls={controlsId}
      data-testid="overview-collapse-divider"
      onClick={onToggle}
    >
      <Rule $edge="left" aria-hidden="true" />
      <BadgeStack $expanded={expanded}>
        <TaperArrow aria-hidden="true" />
        <Badge ref={badgeRef}>
          {points && (
            <BadgeOutline
              viewBox={`0 0 ${width} ${h}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points={points} fill="none" stroke={theme.colourFrameLine} />
            </BadgeOutline>
          )}
          <BadgeLabel>{expanded ? collapseLabel : expandLabel}</BadgeLabel>
        </Badge>
      </BadgeStack>
      <Rule $edge="right" aria-hidden="true" />
    </DividerButton>
  );
}
