import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";

/** Tinted note, e.g. "All items are prepared to order…". */
export function InfoBanner({ children, tone = "ok", icon = "shield" }: { children: ReactNode; tone?: "ok" | "warn" | "error"; icon?: IconName }) {
  return (
    <div className={cx("at-banner", `at-banner--${tone}`)} role="note">
      <Icon name={icon} size={18} />
      <p className="small">{children}</p>
    </div>
  );
}

/** Centered empty state: icon → headline → text → action. */
export function EmptyState({ icon, title, text, action }: { icon: IconName; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="at-empty">
      <span className="at-empty__icon">
        <Icon name={icon} size={48} strokeWidth={1.4} />
      </span>
      <h2 className="title">{title}</h2>
      {text && <p className="body muted">{text}</p>}
      {action}
    </div>
  );
}

/** Tappable list row: optional icon, title, subtitle, trailing slot, chevron. */
export function ListRow({ href, onClick, icon, title, sub, trailing, chevron = true }: {
  href?: string;
  onClick?: () => void;
  icon?: IconName;
  title: ReactNode;
  sub?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
}) {
  const inner = (
    <>
      {icon && (
        <span className="at-row__icon">
          <Icon name={icon} />
        </span>
      )}
      <span className="at-row__text">
        <span className="body-strong">{title}</span>
        {sub && <span className="small muted">{sub}</span>}
      </span>
      {trailing}
      {chevron && <Icon name="chevron" size={18} className="at-row__chev" />}
    </>
  );
  if (href)
    return (
      <Link href={href} className="at-row">
        {inner}
      </Link>
    );
  return (
    <button type="button" className="at-row" onClick={onClick}>
      {inner}
    </button>
  );
}

/** Mono uppercase heading above a group of rows. */
export function SectionLabel({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="at-seclabel">
      <h2 className="label muted">{children}</h2>
      {aside && <span className="small muted">{aside}</span>}
    </div>
  );
}
