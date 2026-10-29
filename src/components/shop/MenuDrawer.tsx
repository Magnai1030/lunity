"use client";

import Link from "next/link";
import { Button, Icon, Sheet, isIconName, type IconName } from "@/components/ui";
import { menuCategories, orders } from "@/lib/data";
import { useShop } from "@/lib/store";
import { Wordmark } from "./Logo";

export function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang, setLang, user, fav } = useShop();

  const shop: { href: string; icon: IconName; label: string }[] = [
    { href: "/search", icon: "grid", label: t.menuAll },
    ...menuCategories.map((c) => ({ href: `/search?cat=${c.id}`, icon: isIconName(c.icon) ? c.icon : "tag", label: c.name[lang] })),
    { href: "/sets", icon: "box", label: t.setsTitle },
    { href: "/search?top=1", icon: "star", label: t.topPicks },
    { href: "/#brands", icon: "tag", label: t.menuBrands },
  ];
  const account: { href: string; icon: IconName; label: string; count?: number }[] = [
    { href: "/orders", icon: "receipt", label: t.myOrders, count: user ? orders.length : 0 },
    { href: "/wishlist", icon: "heart", label: t.wishlist, count: fav.length },
  ];

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="left"
      title={t.menu}
      closeLabel={t.close}
      head={
        <span className="wordmark">
          <Wordmark name={t.shop} />
        </span>
      }
      footer={
        <>
          <div className="langswitch" role="group" aria-label={t.langH}>
            <Button variant={lang === "en" ? "primary" : "secondary"} onClick={() => setLang("en")} lang="en" aria-pressed={lang === "en"}>
              English
            </Button>
            <Button variant={lang === "mn" ? "primary" : "secondary"} onClick={() => setLang("mn")} lang="mn" aria-pressed={lang === "mn"}>
              Монгол
            </Button>
          </div>
          <span className="small muted">{t.rights}</span>
        </>
      }
    >
      <Link href={user ? "/profile" : "/login"} className="drawer-user" onClick={onClose}>
        <span className="avatar">{user ? user.name[0] : <Icon name="user" size={20} />}</span>
        <span className="stack">
          <span className="body-strong">{user ? user.name : t.guestTitle}</span>
          <span className="small muted">{user ? user.email : t.guestText}</span>
        </span>
        <Icon name="chevron" size={18} className="muted" />
      </Link>

      <nav aria-label={t.menuShop} className="drawer-nav">
        <h2 className="label muted">{t.menuShop}</h2>
        {shop.map((n) => (
          <Link key={n.href} href={n.href} className="drawer-link" onClick={onClose}>
            <Icon name={n.icon} />
            <span>{n.label}</span>
          </Link>
        ))}
      </nav>
      <nav aria-label={t.account} className="drawer-nav">
        <h2 className="label muted">{t.account}</h2>
        {account.map((n) => (
          <Link key={n.href} href={n.href} className="drawer-link" onClick={onClose}>
            <Icon name={n.icon} />
            <span>{n.label}</span>
            {!!n.count && <span className="pill-count">{n.count}</span>}
          </Link>
        ))}
      </nav>
    </Sheet>
  );
}
