"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, IconButton, IconLink, cx } from "@/components/ui";
import { menuCategories } from "@/lib/data";
import { useShop } from "@/lib/store";
import { MenuDrawer } from "./MenuDrawer";
import { InfoSheet, type InfoKind } from "./InfoSheets";
import { Wordmark } from "./Logo";

/** Announcement bar + sticky main nav. On inner pages it is desktop-only. */
export function SiteHeader({ desktopOnly }: { desktopOnly?: boolean }) {
  const { t, lang, setLang, cartCount, fav, user } = useShop();
  const [menu, setMenu] = useState(false);
  const [info, setInfo] = useState<InfoKind | null>(null);

  const nav = [...menuCategories.map((c) => ({ href: `/search?cat=${c.id}`, label: c.name[lang] })), { href: "/sets", label: t.setsTitle }];

  return (
    <>
      <div className={cx("announce", desktopOnly && "desktop-only")}>
        <div className="wrap announce__in">
          <span className="small">{t.announce}</span>
          <button type="button" className="announce__link" onClick={() => setInfo("how")}>
            {t.howLink}
          </button>
        </div>
      </div>
      <header className={cx("site-header", desktopOnly && "desktop-only")}>
        <div className="wrap site-header__in">
          <div className="site-header__brand">
            <IconButton icon="menu" label={t.menu} className="menu-btn" onClick={() => setMenu(true)} />
            <Link href="/" className="wordmark">
              <Wordmark name={t.shop} />
            </Link>
          </div>
          <nav className="site-nav" aria-label={t.navLabel}>
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="site-nav__link">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="site-header__actions">
            <Button variant="ghost" size="sm" className="lang-desk" onClick={() => setLang(lang === "en" ? "mn" : "en")} aria-label={lang === "en" ? "Монгол хэл" : "English"}>
              {lang === "en" ? "МН" : "EN"}
            </Button>
            <IconLink href={user ? "/profile" : "/login"} icon="user" label={user ? t.profile : t.login} className="user-desk" />
            <IconLink href="/search" icon="search" label={t.search} />
            <IconLink href="/wishlist" icon="heart" label={t.wishlist} count={fav.length} />
            <IconLink href="/cart" icon="bag" label={t.cart} count={cartCount} />
          </div>
        </div>
      </header>
      <MenuDrawer open={menu} onClose={() => setMenu(false)} />
      <InfoSheet kind={info} onClose={() => setInfo(null)} onSwitch={setInfo} />
    </>
  );
}
