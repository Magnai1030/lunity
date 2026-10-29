import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type Common = {
  variant?: ButtonVariant;
  size?: "md" | "sm";
  icon?: IconName;
  iconAfter?: IconName;
  fullWidth?: boolean;
  children: ReactNode;
};

const classes = ({ variant = "primary", size = "md", fullWidth }: Common, className?: string) =>
  cx("at-btn", `at-btn--${variant}`, size === "sm" && "at-btn--sm", fullWidth && "at-btn--full", className);

const content = ({ icon, iconAfter, children }: Common) => (
  <>
    {icon && <Icon name={icon} size={16} strokeWidth={2.2} />}
    <span>{children}</span>
    {iconAfter && <Icon name={iconAfter} size={16} strokeWidth={2.2} />}
  </>
);

type ButtonProps = Common & Omit<ComponentProps<"button">, "children">;

export function Button({ variant, size, icon, iconAfter, fullWidth, children, className, type = "button", ...rest }: ButtonProps) {
  const c = { variant, size, icon, iconAfter, fullWidth, children };
  return (
    <button type={type} className={classes(c, className)} {...rest}>
      {content(c)}
    </button>
  );
}

type LinkProps = Common & Omit<ComponentProps<typeof Link>, "children">;

/** A link styled as a button — use for navigation. */
export function ButtonLink({ variant, size, icon, iconAfter, fullWidth, children, className, ...rest }: LinkProps) {
  const c = { variant, size, icon, iconAfter, fullWidth, children };
  return (
    <Link className={classes(c, className)} {...rest}>
      {content(c)}
    </Link>
  );
}
