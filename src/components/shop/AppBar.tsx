"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { IconButton, IconLink, cx } from "@/components/ui";
import { useShop } from "@/lib/store";

type Props = {
  /** Large title (e.g. "Cart"). */
  title?: string;
  /** Small mono label instead of a title (e.g. "N° 012", "ORDER #1042"). */
  label?: string;
  /** Text on the right, e.g. "4 items". */
  aside?: ReactNode;
  /** Icon actions on the right. Defaults to none. */
  actions?: ("search" | "wishlist" | "cart")[];
  back?: string;
  /** Show only below the desktop breakpoint (desktop uses SiteHeader). */
  mobileOnly?: boolean;
  leading?: ReactNode;
  /** Replaces the title area (e.g. a search field). */
  center?: ReactNode;
  /** Custom controls placed before the standard actions. */
  end?: ReactNode;
};

/** Mobile top bar for inner pages: back, title, actions. */
export function AppBar({ title, label, aside, actions = [], back = "/", mobileOnly = true, leading, center, end }: Props) {
  const router = useRouter();
  const { t, cartCount, fav } = useShop();

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(back);
  };

  return (
    <header className={cx("appbar", mobileOnly && "mobile-only")}>
      {leading ?? <IconButton icon="back" label={t.back} onClick={goBack} className="appbar__back" />}
      {center ?? (title ? <h1 className="appbar__title">{title}</h1> : <span className="label muted appbar__label">{label}</span>)}
      <div className="appbar__end">
        {aside && <span className="small muted appbar__aside">{aside}</span>}
        {end}
        {actions.includes("search") && <IconLink href="/search" icon="search" label={t.search} />}
        {actions.includes("wishlist") && <IconLink href="/wishlist" icon="heart" label={t.wishlist} count={fav.length} />}
        {actions.includes("cart") && <IconLink href="/cart" icon="bag" label={t.cart} count={cartCount} />}
      </div>
    </header>
  );
}
