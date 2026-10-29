"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Button, ButtonLink, EmptyState, Icon, InfoBanner, SummaryRows, TextArea, TextInput, Thumb, cx } from "@/components/ui";
import { PageShell } from "@/components/shop/PageShell";
import { coverPhoto, cartLeadDays, getProduct, nextOrderId, selectionLabel, settings, unitPrice } from "@/lib/data";
import { deliveryWhen, fmt, formatPrice, formatShipping } from "@/lib/i18n";
import { useShop } from "@/lib/store";
import { useToday } from "@/lib/useToday";
import s from "./checkout.module.css";

type Pay = "qpay" | "socialpay" | "card" | "bank";
const PAYS: Pay[] = ["qpay", "socialpay", "card", "bank"];

export function CheckoutView() {
  const { t, lang, cart, subtotal, hydrated, clearCart } = useShop();
  const [form, setForm] = useState({ phone: "", city: settings.defaultCity, district: "", street: "", note: "" });
  const [pay, setPay] = useState<Pay>("qpay");
  const [tried, setTried] = useState(false);
  // Set on submit; the cart is cleared then, so the delivery estimate is kept with the number.
  const [done, setDone] = useState<{ no: string; when: string } | null>(null);
  const when = deliveryWhen(cartLeadDays(cart), useToday(), t, lang);

  const digits = form.phone.replace(/\D/g, "");
  const errors = {
    phone: digits.length === 0 ? t.required : digits.length !== 8 ? t.errPhone : "",
    city: form.city.trim() ? "" : t.required,
    district: form.district.trim() ? "" : t.required,
    street: form.street.trim() ? "" : t.required,
  };
  const valid = Object.values(errors).every((e) => !e);
  const err = (k: keyof typeof errors) => (tried ? errors[k] || undefined : undefined);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!valid) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setDone({ no: nextOrderId(), when });
    clearCart();
    window.scrollTo({ top: 0 });
  };

  const step = done ? 3 : 2;

  return (
    <PageShell bar={{ title: t.checkout, back: "/cart" }} footer={done || (hydrated && !cart.length) ? "always" : "desktop"}>
      <div className={`wrap wrap--narrow ${s.page}`}>
        <h1 className={`headline desktop-only ${s.deskTitle}`}>{t.checkout}</h1>
        <ol className={s.steps} aria-label={t.checkout}>
          {[t.stepCart, t.stepInfo, t.stepDone].map((label, i) => {
            const n = i + 1;
            const state = n < step ? "stepDone" : n === step ? "active" : "todo";
            return (
              <li key={label} className={cx(s.step, s[state])} aria-current={state === "active" ? "step" : undefined}>
                <span className={s.stepDot}>{state === "stepDone" ? <Icon name="check" size={14} strokeWidth={2.6} /> : n}</span>
                <span className="small">{label}</span>
              </li>
            );
          })}
        </ol>

        {done ? (
          <Done no={done.no} when={done.when} />
        ) : !hydrated ? null : !cart.length ? (
          <EmptyState icon="bag" title={t.empty.cart.title} text={t.empty.cart.text} action={<ButtonLink href="/search" iconAfter="arrow">{t.empty.cart.cta}</ButtonLink>} />
        ) : (
          <form className={s.form} onSubmit={submit} noValidate>
            <section className={s.section} aria-labelledby="c-h">
              <h2 id="c-h" className="title">
                {t.contact}
              </h2>
              <TextInput label={t.phone} required prefix="+976" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="9911 2233" value={form.phone} onChange={set("phone")} hint={t.phoneHint} error={err("phone")} />
            </section>

            <section className={s.section} aria-labelledby="d-h">
              <h2 id="d-h" className="title">
                {t.delivery}
              </h2>
              <TextInput label={t.city} required autoComplete="address-level1" value={form.city} onChange={set("city")} error={err("city")} />
              <TextInput label={t.district} required autoComplete="address-level2" value={form.district} onChange={set("district")} error={err("district")} />
              <TextInput label={t.street} required autoComplete="street-address" value={form.street} onChange={set("street")} error={err("street")} />
              <TextArea label={t.note} rows={3} value={form.note} onChange={set("note")} />
            </section>

            <section className={s.section} aria-labelledby="p-h">
              <h2 id="p-h" className="title">
                {t.payment}
              </h2>
              <div role="radiogroup" aria-labelledby="p-h" className={s.pays}>
                {PAYS.map((p) => (
                  <label key={p} className={cx(s.pay, pay === p && s.paySel)}>
                    <input type="radio" name="pay" value={p} checked={pay === p} onChange={() => setPay(p)} className={s.radio} />
                    <PayLogo kind={p} />
                    <span className={s.payText}>
                      <span className="body-strong">{t.pay[p].name}</span>
                      <span className="small muted">{t.pay[p].sub}</span>
                    </span>
                  </label>
                ))}
              </div>
              {pay === "qpay" || pay === "socialpay" ? <QrPanel key={pay} amount={subtotal} /> : <RedirectPanel />}
            </section>

            <section className={s.section} aria-labelledby="o-h">
              <div className={s.rowHead}>
                <h2 id="o-h" className="title">
                  {t.yourOrder}
                </h2>
                <Link href="/cart" className="small textlink">
                  {t.edit}
                </Link>
              </div>
              <ul className={s.items}>
                {cart.map((c) => {
                  const p = getProduct(c.id)!;
                  const each = unitPrice(c.id, c.sel);
                  const type = selectionLabel(c.id, c.sel, lang);
                  return (
                    <li key={c.key} className={s.item}>
                      <Thumb art={p.id} photo={coverPhoto(p.id)} size={52} />
                      <span className="stack" style={{ flex: 1, minWidth: 0 }}>
                        <span className="body-strong">{p.text[lang].title}</span>
                        <span className="meta muted">
                          {type && `${type} · `}
                          {c.qty} × {formatPrice(each)}
                        </span>
                      </span>
                      <span className="body-strong">{formatPrice(each * c.qty)}</span>
                    </li>
                  );
                })}
              </ul>
              <SummaryRows rows={[{ label: t.subtotal, value: formatPrice(subtotal) }, { label: t.shipping, value: formatShipping(settings.shippingFee, t) }]} total={{ label: t.total, value: formatPrice(subtotal + settings.shippingFee) }} />
              <InfoBanner>{fmt(t.readyBanner, { when })}</InfoBanner>
            </section>

            <div className={`buybar buybar--inline ${s.confirm}`}>
              <div className="buybar__row">
                <span className="body muted">{t.total}</span>
                <span className="price-lg">{formatPrice(subtotal)}</span>
              </div>
              <Button type="submit" fullWidth iconAfter="arrow">
                {t.confirm}
              </Button>
              <p className="small muted" style={{ textAlign: "center" }}>
                {t.confirmHint}
              </p>
            </div>
            <div className="buybar-spacer buybar-spacer--inline" style={{ height: 120 }} />
          </form>
        )}
      </div>
    </PageShell>
  );
}

function PayLogo({ kind }: { kind: Pay }) {
  if (kind === "qpay") return <span className={cx(s.logo, s.logoQ)}>QP</span>;
  if (kind === "socialpay") return <span className={cx(s.logo, s.logoS)}>SP</span>;
  return (
    <span className={s.logo}>
      <Icon name={kind === "card" ? "card" : "bank"} size={18} />
    </span>
  );
}

/** Decorative QR placeholder with a countdown. A real integration would render the provider's QR image. */
function QrPanel({ amount }: { amount: number }) {
  const { t } = useShop();
  const [left, setLeft] = useState(settings.qrPaymentSeconds);
  useEffect(() => {
    const id = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  const cells = Array.from({ length: 121 }, (_, i) => {
    const x = i % 11;
    const y = Math.floor(i / 11);
    const finder = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
    return finder || (x * 7 + y * 13 + x * y) % 3 === 0;
  });
  return (
    <div className={s.qr}>
      <p className="body-strong">{t.scanQr}</p>
      <div className={s.qrCode} role="img" aria-label="QR">
        {cells.map((on, i) => (
          <span key={i} className={on ? s.qrOn : undefined} />
        ))}
      </div>
      <div className={s.timer}>
        <span className="small muted">{fmt(t.timeLeft, { t: `${mm}:${ss}` })}</span>
        <span className={s.timerBar}>
          <span style={{ width: `${(left / settings.qrPaymentSeconds) * 100}%` }} />
        </span>
      </div>
      <span className="body-strong">{formatPrice(amount)}</span>
    </div>
  );
}

function RedirectPanel() {
  const { t } = useShop();
  return (
    <div className={s.qr}>
      <p className="body muted">{t.redirectText}</p>
      <Button variant="secondary" iconAfter="external">
        {t.goPay}
      </Button>
    </div>
  );
}

function Done({ no, when }: { no: string; when: string }) {
  const { t } = useShop();
  return (
    <div className={s.doneView}>
      <span className={s.doneIcon}>
        <Icon name="check" size={36} strokeWidth={2.4} />
      </span>
      <h2 className="headline">{t.doneTitle}</h2>
      <p className="body muted">{fmt(t.doneText, { n: no, when })}</p>
      <div className={s.doneCta}>
        <ButtonLink href="/orders" iconAfter="arrow">
          {t.viewOrder}
        </ButtonLink>
        <ButtonLink href="/" variant="secondary">
          {t.continueShopping}
        </ButtonLink>
      </div>
    </div>
  );
}
