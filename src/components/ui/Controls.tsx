"use client";

import { useId, type ReactNode } from "react";
import { cx } from "./cx";

/** Underlined tab bar. Controlled. */
export function Tabs<T extends string>({ tabs, value, onChange, label }: { tabs: { id: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="at-tabs" role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          className={cx("at-tab", value === t.id && "is-active")}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** On/off switch with a label and optional description. */
export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  const id = useId();
  return (
    <div className="at-toggle">
      <span className="stack">
        <label htmlFor={id} className="body-strong">
          {label}
        </label>
        {description && <span className="small muted">{description}</span>}
      </span>
      <button id={id} type="button" role="switch" aria-checked={checked} className="at-toggle__switch" onClick={() => onChange(!checked)}>
        <span className="at-toggle__thumb" />
      </button>
    </div>
  );
}

/** Two-thumb range built from two overlaid native range inputs. */
export function RangeSlider({ min, max, step = 1000, low, high, onChange, format, minLabel, maxLabel }: {
  min: number;
  max: number;
  step?: number;
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
  format: (n: number) => string;
  minLabel: string;
  maxLabel: string;
}) {
  const pct = (n: number) => ((n - min) / (max - min)) * 100;
  return (
    <div className="at-range">
      <div className="at-range__track">
        <span className="at-range__fill" style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }} />
        <input type="range" aria-label={minLabel} min={min} max={max} step={step} value={low} onChange={(e) => onChange(Math.min(Number(e.target.value), high - step), high)} />
        <input type="range" aria-label={maxLabel} min={min} max={max} step={step} value={high} onChange={(e) => onChange(low, Math.max(Number(e.target.value), low + step))} />
      </div>
      <div className="at-range__values">
        <span className="body-strong">{format(low)}</span>
        <span className="muted" aria-hidden="true">—</span>
        <span className="body-strong">{format(high)}</span>
      </div>
    </div>
  );
}

/** Group heading + wrapping chips row used in filters. */
export function ChipGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="at-chipgroup">
      <legend className="label muted">{label}</legend>
      <div className="at-chipgroup__row">{children}</div>
    </fieldset>
  );
}
