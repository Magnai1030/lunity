import type { ReactNode } from "react";
import { cx } from "./cx";

export function SpecList({ items, className }: { items: { label: string; value: ReactNode }[]; className?: string }) {
  return (
    <dl className={cx("at-spec", className)}>
      {items.map((it) => (
        <div key={it.label} className="at-spec__row">
          <dt className="label at-spec__k">{it.label}</dt>
          <dd className="meta at-spec__v">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Label/value rows for money summaries (subtotal, shipping, total). */
export function SummaryRows({ rows, total }: { rows: { label: string; value: ReactNode }[]; total?: { label: string; value: ReactNode } }) {
  return (
    <dl className="at-summary">
      {rows.map((r) => (
        <div key={r.label} className="at-summary__row">
          <dt className="body muted">{r.label}</dt>
          <dd className="body">{r.value}</dd>
        </div>
      ))}
      {total && (
        <div className="at-summary__row at-summary__total">
          <dt className="title">{total.label}</dt>
          <dd className="price-lg">{total.value}</dd>
        </div>
      )}
    </dl>
  );
}
