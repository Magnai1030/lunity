import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Badge, cx } from "@/components/ui";
import type { OrderStatus } from "@/db/models";
import { date, mnt, STATUS_LABEL, STATUS_TONE } from "../format";
import { getOrders } from "../queries";
import { Loading, PageHeader } from "../PageHeader";
import { StatusButton } from "./StatusButton";
import s from "../admin.module.css";

export const metadata: Metadata = { title: "Orders" };

const TABS: { id: OrderStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "preparing", label: "To prepare" },
  { id: "ready", label: "Ready for pickup" },
  { id: "completed", label: "Completed" },
];

export default function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  return (
    <>
      <PageHeader title="Orders" sub="Move each order along with one tap: prepare it, then hand it over." />
      <Suspense fallback={<Loading />}>
        <Orders searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Orders({ searchParams }: Pick<PageProps<"/admin/orders">, "searchParams">) {
  await connection();
  const status = (await searchParams).status;
  const tab = TABS.find((t) => t.id === status)?.id ?? "all";
  const all = getOrders();
  const list = tab === "all" ? all : all.filter((o) => o.status === tab);

  return (
    <div className={s.stack}>
      <nav className={s.tabs} aria-label="Order status">
        {TABS.map((t) => {
          const n = t.id === "all" ? all.length : all.filter((o) => o.status === t.id).length;
          return (
            <Link key={t.id} href={t.id === "all" ? "/admin/orders" : `/admin/orders?status=${t.id}`} className={cx(s.tab, tab === t.id && s.tabActive)} aria-current={tab === t.id ? "page" : undefined}>
              {t.label}
              <span className={s.tabCount}>{n}</span>
            </Link>
          );
        })}
      </nav>

      {list.length === 0 ? (
        <p className={cx("body muted", s.empty)}>No orders here.</p>
      ) : (
        <ul className={s.list}>
          {list.map((o) => (
            <li key={o.id} className={s.orderRow}>
              <Link href={`/admin/orders/${o.id}`} className={cx(s.orderMain, s.orderLink)}>
                <div className={s.orderTop}>
                  <span className="body-strong">#{o.id}</span>
                  <Badge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Badge>
                </div>
                <span className="small muted">
                  {date(o.placedAt)} · {o.customer} · {o.contactPhone}
                </span>
                <span className="small">
                  {o.lines.map((l) => `${l.title} ×${l.qty}`).join(", ")}
                </span>
              </Link>
              <div className={s.orderSide}>
                <span className="body-strong">{mnt(o.total)}</span>
                <span className="small muted">Ready by {date(o.readyBy)}</span>
                <StatusButton id={o.id} status={o.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
