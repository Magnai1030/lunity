"use client";

import { cx } from "./cx";
import { Icon } from "./Icon";

type Props = {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label?: string;
  decrementLabel?: string;
  incrementLabel?: string;
  size?: "md" | "sm";
  className?: string;
};

export function QuantityStepper({ value, onChange, min = 1, max = 99, label = "Quantity", decrementLabel = "Decrease quantity", incrementLabel = "Increase quantity", size = "md", className }: Props) {
  const set = (n: number) => onChange(Math.max(min, Math.min(max, n)));
  return (
    <div className={cx("at-stepper", size === "sm" && "at-stepper--sm", className)} role="group" aria-label={label}>
      <button type="button" className="at-stepper__btn" aria-label={decrementLabel} disabled={value <= min} onClick={() => set(value - 1)}>
        <Icon name="minus" size={18} />
      </button>
      <span className="body-strong at-stepper__value" aria-live="polite">
        {value}
      </span>
      <button type="button" className="at-stepper__btn" aria-label={incrementLabel} disabled={value >= max} onClick={() => set(value + 1)}>
        <Icon name="plus" size={18} />
      </button>
    </div>
  );
}
