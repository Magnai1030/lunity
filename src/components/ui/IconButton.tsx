import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";

type Common = {
  icon: IconName;
  label: string;
  tone?: "surface" | "plain";
  /** Optional count shown as a small pill (cart, wishlist). */
  count?: number;
};

const inner = (icon: IconName, filled: boolean, count?: number) => (
  <>
    <Icon name={icon} filled={filled} />
    {!!count && (
      <span className="at-count" aria-hidden="true">
        {count > 99 ? "99+" : count}
      </span>
    )}
  </>
);

type ButtonProps = Common & { pressed?: boolean } & Omit<ComponentProps<"button">, "children">;

export function IconButton({ icon, label, tone = "plain", pressed, count, className, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      aria-label={count ? `${label} (${count})` : label}
      aria-pressed={typeof pressed === "boolean" ? pressed : undefined}
      className={cx("at-iconbtn", `at-iconbtn--${tone}`, pressed && "is-pressed", className)}
      {...rest}
    >
      {inner(icon, !!pressed, count)}
    </button>
  );
}

type LinkProps = Common & Omit<ComponentProps<typeof Link>, "children">;

export function IconLink({ icon, label, tone = "plain", count, className, ...rest }: LinkProps) {
  return (
    <Link
      aria-label={count ? `${label} (${count})` : label}
      className={cx("at-iconbtn", `at-iconbtn--${tone}`, className)}
      {...rest}
    >
      {inner(icon, false, count)}
    </Link>
  );
}
