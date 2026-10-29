import type { ReactNode } from "react";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";

type ChipProps = {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  /** "outline" is the larger, bordered filter chip used in filter groups. */
  variant?: "fill" | "outline";
  className?: string;
};

export function Chip({ children, selected, onClick, variant = "fill", className }: ChipProps) {
  const cls = cx("at-chip", `at-chip--${variant}`, selected && "is-selected", onClick && "at-chip--action", className);
  if (onClick) {
    return (
      <button type="button" className={cls} onClick={onClick} aria-pressed={!!selected}>
        {children}
      </button>
    );
  }
  return <span className={cls}>{children}</span>;
}

export type BadgeTone = "neutral" | "new" | "ok" | "warn" | "error";

export function Badge({ children, tone = "neutral", icon, className }: { children: ReactNode; tone?: BadgeTone; icon?: IconName; className?: string }) {
  return (
    <span className={cx("at-badge", `at-badge--${tone}`, className)}>
      {icon && <Icon name={icon} size={14} strokeWidth={2.4} />}
      <span>{children}</span>
    </span>
  );
}
