"use client";

import { useId } from "react";
import { cx } from "./cx";

type Option = { id: string; label: string; /** Secondary line, e.g. a price difference. */ note?: string };

/** Single-choice product option (size, edition…). Native radios styled as selectable tiles. */
export function OptionGroup({ label, options, value, onChange }: { label: string; options: Option[]; value: string; onChange: (id: string) => void }) {
  const name = useId();
  const current = options.find((o) => o.id === value);
  return (
    <fieldset className="at-options">
      <legend className="at-options__legend">
        <span className="label muted">{label}</span>
        {current && <span className="small at-options__value">{current.label}</span>}
      </legend>
      <div className="at-options__row">
        {options.map((o) => (
          <label key={o.id} className={cx("at-option", o.id === value && "is-selected")}>
            <input type="radio" className="sr-only" name={name} value={o.id} checked={o.id === value} onChange={() => onChange(o.id)} />
            <span className="at-option__label">{o.label}</span>
            {o.note && <span className="at-option__note">{o.note}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
