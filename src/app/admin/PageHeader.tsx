import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui";
import s from "./admin.module.css";

export function PageHeader({ title, sub, back, actions }: { title: string; sub?: string; back?: { href: string; label: string }; actions?: ReactNode }) {
  return (
    <header className={s.head}>
      <div className={s.headText}>
        {back && (
          <Link href={back.href} className={s.back}>
            <Icon name="back" size={16} />
            {back.label}
          </Link>
        )}
        <h1 className="headline">{title}</h1>
        {sub && <p className="body muted">{sub}</p>}
      </div>
      {actions && <div className={s.headActions}>{actions}</div>}
    </header>
  );
}

/** Placeholder while a page's live data loads. */
export function Loading() {
  return <div className={s.loading} aria-busy="true" aria-label="Loading" />;
}
