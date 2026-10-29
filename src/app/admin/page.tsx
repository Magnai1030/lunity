import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Icon, cx } from "@/components/ui";
import { readTable } from "@/db/store";
import { date, mnt } from "./format";
import { getOrders, getSettings, isLowStock } from "./queries";
import { Loading, PageHeader } from "./PageHeader";
import { StatusButton } from "./orders/StatusButton";
import s from "./admin.module.css";

export const metadata: Metadata = { title: "Home" };

export default function AdminHome() {
  return (
    <>
      <PageHeader title="Home" sub="What needs doing today." />
      <Suspense fallback={<Loading />}>
        <Overview />
      </Suspense>
    </>
  );
}

async function Overview() {
  await connection();
  const orders = getOrders();
  const { lowStockThreshold } = getSettings();
  const toPrepare = orders.filter((o) => o.status === "preparing");
  const ready = orders.filter((o) => o.status === "ready");
  const low = readTable("products").filter((p) => p.status === "active" && isLowStock(p, lowStockThreshold));
  const sales = orders.reduce((n, o) => n + o.total, 0);

  const stats = [
    { label: "To prepare", value: toPrepare.length, href: "/admin/orders?status=preparing", alert: toPrepare.length > 0 },
    { label: "Ready for pickup", value: ready.length, href: "/admin/orders?status=ready", alert: false },
    { label: "Low stock", value: low.length, href: "/admin/products?filter=low", alert: low.length > 0 },
    { label: "Total sales", value: mnt(sales), href: "/admin/orders", alert: false },
  ];

  return (
    <div className={s.stack}>
      <div className={s.stats}>
        {stats.map((x) => (
          <Link key={x.label} href={x.href} className={cx(s.stat, x.alert && s.statAlert)}>
            <span className="small muted">{x.label}</span>
            <span className={s.statValue}>{x.value}</span>
          </Link>
        ))}
      </div>

      <section className={s.card}>
        <div className={s.cardHead}>
          <h2 className="body-strong">Orders to prepare</h2>
          <Link href="/admin/orders" className="small textlink">
            All orders
          </Link>
        </div>
        {toPrepare.length === 0 ? (
          <p className="small muted">All caught up. New orders appear here.</p>
        ) : (
          <ul className={s.list}>
            {toPrepare.map((o) => (
              <li key={o.id} className={s.todoRow}>
                <Link href={`/admin/orders/${o.id}`} className={cx(s.productText, s.orderLink)}>
                  <span className="body-strong">
                    #{o.id} · {o.customer}
                  </span>
                  <span className="small muted">
                    {o.units} {o.units === 1 ? "item" : "items"} · {mnt(o.total)} · ready by {date(o.readyBy)}
                  </span>
                </Link>
                <StatusButton id={o.id} status={o.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={s.card}>
        <div className={s.cardHead}>
          <div className={s.cardTitle}>
            <h2 className="body-strong">Low stock</h2>
            <p className="small muted">
              {lowStockThreshold} or fewer left. These still sell, with the longer supplier delivery date.
            </p>
          </div>
          <Link href="/admin/products?filter=low" className="small textlink">
            Update stock
          </Link>
        </div>
        {low.length === 0 ? (
          <p className="small muted">Stock is fine everywhere.</p>
        ) : (
          <ul className={s.list}>
            {low.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/products/${p.id}`} className={s.todoRow}>
                  <span className={s.productText}>
                    <span className="body-strong">{p.text.en.title}</span>
                    <span className="small muted">{p.sku}</span>
                  </span>
                  <span className={cx("body-strong", p.stock === 0 && s.zero)}>{p.stock} left</span>
                  <Icon name="chevron" size={18} className="muted" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
