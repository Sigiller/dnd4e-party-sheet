import { HpFill, HpLabel, HpSurgeBar as Bar } from "./HpSurgeBar.styles.js";

interface HpSurgeBarProps {
  hp: { value: number; max: number };
  surges: { value: number; max: number };
}

export function HpSurgeBar({ hp, surges }: HpSurgeBarProps) {
  const raw = hp.max > 0 ? (hp.value / hp.max) * 100 : 0;
  const pct = Math.min(100, Math.max(0, raw));

  return (
    <Bar>
      <HpFill style={{ width: `${pct}%` }} />
      <HpLabel $side="left">
        <i className="fas fa-heart" /> {hp.value} / {hp.max}
      </HpLabel>
      <HpLabel $side="right">
        {surges.value} / {surges.max} <i className="fas fa-briefcase-medical" />
      </HpLabel>
    </Bar>
  );
}
