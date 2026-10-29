"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, ButtonLink, EmptyState, Tabs, Thumb } from "@/components/ui";
import { PageShell } from "@/components/shop/PageShell";
import { coverPhoto, orders, orderTotal, type OrderStatus } from "@/lib/data";
import { fmt, formatDate, formatPrice } from "@/lib/i18n";
import { useShop } from "@/lib/store";
import s from "./orders.module.css";

export const statusTone = (st: OrderStatus) => (st === "preparing" ? "warn" : st === "ready" ? "ok" : "neutral");

export function OrdersView() {
  const { t, lang, user, hydrated } = useShop();
  const [tab, setTab] = useState<"active" | "completed">("active");
  const list = user ? orders.filter((o) => (tab === "active" ? o.status !== "completed" : o.status === "completed")) : [];

  return (
    <PageShell bar={{ title: t.myOrders, back: "/profile" }}>
      <div className={`wrap wrap--narrow ${s.page}`}>
        <h1 className="headline desktop-only">{t.myOrders}</h1>
        <Tabs
          label={t.myOrders}
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "active", label: t.active },
            { id: "completed", label: t.completed },
          ]}
        />
        {!hydrated ? null : list.length === 0 ? (
          <EmptyState
            icon="box"
            title={t.empty.orders.title}
            text={t.empty.orders.text}
            action={
              <ButtonLink href="/search" iconAfter="arrow">
                {t.empty.orders.cta}
              </ButtonLink>
            }
          />
        ) : (
          <ul className={s.list}>
            {list.map((o) => {
              const n = o.items.reduce((a, i) => a + i.qty, 0);
              return (
                <li key={o.id}>
                  <Link href={`/orders/${o.id}`} transitionTypes={["nav-forward"]} className={s.card}>
                    <div className={s.cardHead}>
                      <span className="meta">#{o.id}</span>
                      <Badge tone={statusTone(o.status)}>{t.status[o.status]}</Badge>
                    </div>
                    <div className={s.thumbs}>
                      {o.items.map((i) => (
                        <Thumb key={i.id} art={i.id} photo={coverPhoto(i.id)} size={52} />
                      ))}
                    </div>
                    <div className={s.cardFoot}>
                      <span className="stack">
                        <span className="body">{formatDate(o.placed, lang)}</span>
                        <span className="meta muted">{n === 1 ? t.item : fmt(t.items, { n })}</span>
                      </span>
                      <span className="price">{formatPrice(orderTotal(o))}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
