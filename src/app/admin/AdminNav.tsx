"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, cx, type IconName } from "@/components/ui";
import { LogoMark } from "@/components/shop/Logo";
import s from "./admin.module.css";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Home", icon: "home" },
  { href: "/admin/orders", label: "Orders", icon: "receipt" },
  { href: "/admin/products", label: "Products", icon: "tag" },
  { href: "/admin/collections", label: "Collections", icon: "grid" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

/** Sidebar on desktop, scrollable tab row on mobile. Reads the URL to highlight the current page. */
export function AdminNav() {
  return <Nav path={usePathname()} />;
}

/** Same nav with nothing highlighted: the instant fallback while the URL is read at runtime. */
export function AdminNavFallback() {
  return <Nav path="" />;
}

function Nav({ path }: { path: string }) {
  const active = (href: string) => (href === "/admin" ? path === href : path.startsWith(href));
  return (
    <aside className={s.side}>
      <Link href="/admin" className={s.brand}>
        <LogoMark size={22} />
        <span>Lunity</span>
        <span className={s.brandTag}>Admin</span>
      </Link>
      <nav className={s.nav} aria-label="Admin">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={cx(s.navLink, active(n.href) && s.navActive)} aria-current={active(n.href) ? "page" : undefined}>
            <Icon name={n.icon} size={18} />
            <span>{n.label}</span>
          </Link>
        ))}
      </nav>
      <Link href="/" className={s.viewStore} target="_blank">
        <Icon name="external" size={16} />
        <span>View store</span>
      </Link>
    </aside>
  );
}
