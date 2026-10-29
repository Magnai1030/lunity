"use client";

import { ButtonLink, EmptyState, InfoBanner, SummaryRows } from "@/components/ui";
import { CartLine } from "@/components/shop/CartLine";
import { PageShell } from "@/components/shop/PageShell";
import { cartLeadDays, settings } from "@/lib/data";
import { deliveryWhen, fmt, formatPrice, formatShipping } from "@/lib/i18n";
import { useShop } from "@/lib/store";
import { useToday } from "@/lib/useToday";
import s from "./cart.module.css";

export function CartView() {
  const { t, lang, cart, cartCount, subtotal, hydrated } = useShop();
  const when = deliveryWhen(cartLeadDays(cart), useToday(), t, lang);
  const count = cartCount === 1 ? t.item : fmt(t.items, { n: cartCount });
  const empty = hydrated && cart.length === 0;

  return (
    <PageShell bar={{ title: t.cart, aside: cart.length ? count : undefined }} footer={empty ? "always" : "desktop"}>
      <div className={`wrap ${s.page}`}>
        <h1 className={`headline desktop-only ${s.deskTitle}`}>
          {t.cart} {cart.length > 0 && <span className="small muted">{count}</span>}
        </h1>

        {!hydrated ? null : empty ? (
          <EmptyState
            icon="bag"
            title={t.empty.cart.title}
            text={t.empty.cart.text}
            action={
              <ButtonLink href="/search" iconAfter="arrow">
                {t.empty.cart.cta}
              </ButtonLink>
            }
          />
        ) : (
          <div className={s.layout}>
            <ul className={s.lines}>
              {cart.map((c) => (
                <CartLine key={c.key} line={c} />
              ))}
            </ul>
            <aside className={s.summary}>
              <InfoBanner>{fmt(t.readyBanner, { when })}</InfoBanner>
              <SummaryRows
                rows={[
                  { label: t.subtotal, value: formatPrice(subtotal) },
                  { label: t.shipping, value: formatShipping(settings.shippingFee, t) },
                ]}
                total={{ label: t.total, value: formatPrice(subtotal + settings.shippingFee) }}
              />
              <div className={`buybar buybar--inline ${s.cta}`}>
                <ButtonLink href="/checkout" fullWidth>
                  {t.placeOrder}
                </ButtonLink>
                <ButtonLink href="/search" variant="ghost" fullWidth>
                  {t.continueShopping}
                </ButtonLink>
              </div>
            </aside>
          </div>
        )}
      </div>
      {!empty && <div className="buybar-spacer buybar-spacer--inline" />}
    </PageShell>
  );
}
