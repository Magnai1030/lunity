"use client";

import { useState } from "react";
import { Badge, Button, SectionLabel, SummaryRows, Thumb, cx } from "@/components/ui";
import { InfoSheet } from "@/components/shop/InfoSheets";
import { PageShell } from "@/components/shop/PageShell";
import { coverPhoto, getOrder, getProduct, orderSavings, orderSubtotal, orderTotal } from "@/lib/data";
import { fmt, formatDate, formatDateShort, formatPrice, formatShipping } from "@/lib/i18n";
import { useShop } from "@/lib/store";
import { useToday } from "@/lib/useToday";
import { statusTone } from "../OrdersView";
import s from "../orders.module.css";

const daysBetween = (a: string, b: string) => Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000));

export function OrderDetailView({ id }: { id: string }) {
  const { t, lang } = useShop();
  const today = useToday();
  const [help, setHelp] = useState(false);
  const o = getOrder(id)!;
  const subtotal = orderSubtotal(o);
  const savings = orderSavings(o);
  const total = orderTotal(o);
  const n = o.items.reduce((a, i) => a + i.qty, 0);

  // One step per status; every order is delivered (there's no store pickup).
  const reached = { preparing: 1, ready: 2, completed: 3 }[o.status]; // index of the current step
  const deliverBy = formatDate(o.readyBy, lang);
  const steps = [
    { label: t.timeline.placed, sub: formatDate(o.placed, lang) },
    { label: t.timeline.preparing, sub: o.status === "preparing" && today ? fmt(t.estDays, { n: daysBetween(today, o.readyBy) }) : "" },
    { label: t.timeline.shipped, sub: o.status === "ready" ? fmt(t.est, { d: deliverBy }) : "" },
    { label: t.timeline.delivered, sub: o.status === "completed" ? deliverBy : fmt(t.est, { d: deliverBy }) },
  ];

  return (
    <PageShell bar={{ label: fmt(t.orderNo, { n: o.id }), back: "/orders" }}>
      <div className={`wrap wrap--narrow ${s.detail}`}>
        <h1 className="headline desktop-only" style={{ paddingTop: 32 }}>
          {fmt(t.orderNo, { n: o.id })}
        </h1>

        <section className={s.status} aria-label={t.status[o.status]}>
          <div className={s.statusHead}>
            <span className="stack">
              <span className="body-strong">{t.status[o.status]}</span>
              <span className="small muted">{o.status === "preparing" ? fmt(t.estReady, { d: formatDateShort(o.readyBy, lang) }) : formatDate(o.readyBy, lang)}</span>
            </span>
            <Badge tone={statusTone(o.status)}>{t.status[o.status]}</Badge>
          </div>
          <ol className={s.timeline}>
            {steps.map((st, i) => {
              const cls = i < reached || o.status !== "preparing" ? s.tlDone : i === reached ? s.tlActive : s.tlPending;
              return (
                <li key={st.label} className={cx(s.tl, cls)} aria-current={cls === s.tlActive ? "step" : undefined}>
                  <span className={s.dot} aria-hidden="true" />
                  <span className="stack">
                    <span className={cx("body-strong", cls === s.tlPending && "muted")}>{st.label}</span>
                    <span className="meta muted">{st.sub}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <section className={s.block}>
          <SectionLabel aside={n === 1 ? t.item : fmt(t.items, { n })}>{t.itemsH}</SectionLabel>
          <ul>
            {/* Keyed by position: one product can appear twice in different variants. */}
            {o.items.map((it, i) => {
              const p = getProduct(it.id)!;
              const sale = it.regularUnitPrice > it.unitPrice;
              return (
                <li key={`${i}-${it.id}`} className={s.item}>
                  <Thumb art={p.id} photo={coverPhoto(p.id)} size={56} />
                  <span className="stack" style={{ flex: 1, minWidth: 0 }}>
                    <span className="body-strong">{p.text[lang].title}</span>
                    <span className="meta muted">{[it.variant?.[lang], `×${it.qty}`].filter(Boolean).join(" · ")}</span>
                    {sale && (
                      <span className="small muted">
                        <Badge tone="error">{t.sale}</Badge> {fmt(t.wasEach, { p: formatPrice(it.regularUnitPrice) })}
                      </span>
                    )}
                  </span>
                  <span className="body-strong">{formatPrice(it.unitPrice * it.qty)}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={s.block}>
          <SectionLabel>{t.summary}</SectionLabel>
          <SummaryRows rows={[
              { label: t.subtotal, value: formatPrice(subtotal) },
              ...(savings ? [{ label: t.saleSavings, value: `−${formatPrice(savings)}` }] : []),
              { label: t.shipping, value: formatShipping(o.shippingFee, t) },
            ]} total={{ label: t.total, value: formatPrice(total) }} />
        </section>

        <section className={s.block}>
          <SectionLabel>{t.deliveryH}</SectionLabel>
          <SummaryRows
            rows={[
              { label: t.address, value: o.address },
              { label: t.helpPhone, value: o.contactPhone },
            ]}
          />
        </section>

        <div className={s.help}>
          <Button variant="ghost" fullWidth icon="help" onClick={() => setHelp(true)}>
            {t.needHelp}
          </Button>
        </div>
      </div>
      <InfoSheet kind={help ? "help" : null} onClose={() => setHelp(false)} />
    </PageShell>
  );
}
