"use client";

import Link from "next/link";
import { useState } from "react";
import { ButtonLink, Chip, Icon, Sheet, Thumb } from "@/components/ui";
import { coverPhoto, getRecipient, productHref, products, RECIPIENTS, recipientName, settings, type Recipient } from "@/lib/data";
import { fmt } from "@/lib/i18n";
import { useShop } from "@/lib/store";
import { ProductPrice } from "./Price";

export type InfoKind = "how" | "help" | "guide";

/** Content sheets opened from the header, home and footer: guide, how-it-works, help. */
export function InfoSheet({ kind, onClose }: { kind: InfoKind | null; onClose: () => void; onSwitch?: (k: InfoKind) => void }) {
  const { t } = useShop();
  const title = kind === "how" ? t.howTitle : kind === "help" ? t.helpTitle : t.guideTitle;
  return (
    <Sheet open={!!kind} onClose={onClose} title={title} closeLabel={t.close}>
      {kind === "how" && <How />}
      {kind === "help" && <Help />}
      {kind === "guide" && <Guide onNavigate={onClose} />}
    </Sheet>
  );
}

function How() {
  const { t } = useShop();
  return (
    <ol className="steps">
      {t.steps.map((s) => (
        <li key={s.n} className="steps__item">
          <span className="label muted">{s.n}</span>
          <span className="stack">
            <span className="body-strong">{s.t}</span>
            <span className="body muted">{s.b}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function Help() {
  const { t } = useShop();
  return (
    <>
      <p className="body">{t.helpText}</p>
      <dl className="stack" style={{ gap: 12 }}>
        <div className="help-row">
          <Icon name="phone" />
          <dt className="small muted">{t.helpPhone}</dt>
          <dd className="body-strong">
            <a href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}>{settings.contactPhone}</a>
          </dd>
        </div>
        <div className="help-row">
          <Icon name="mail" />
          <dt className="small muted">{t.helpEmail}</dt>
          <dd className="body-strong">
            <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
          </dd>
        </div>
        <div className="help-row">
          <Icon name="clock" />
          <dt className="small muted">{t.helpHours}</dt>
          <dd className="body-strong">{t.helpHoursValue}</dd>
        </div>
      </dl>
    </>
  );
}

export function Guide({ onNavigate, initial = RECIPIENTS[0] }: { onNavigate?: () => void; initial?: Recipient }) {
  const { t, lang } = useShop();
  const [to, setTo] = useState<Recipient>(initial);
  const picks = products.filter((p) => p.top && p.recipients.includes(to));
  return (
    <>
      <p className="body muted">{t.guideIntro}</p>
      <div className="chiprow" role="group" aria-label={t.filterTo}>
        {RECIPIENTS.map((r) => (
          <Chip key={r} variant="outline" selected={r === to} onClick={() => setTo(r)}>
            {recipientName(r, lang)}
          </Chip>
        ))}
      </div>
      <p className="body">{getRecipient(to)?.intro[lang]}</p>
      <section className="stack" style={{ gap: 4 }}>
        <h3 className="label muted">{t.youNeed}</h3>
        {picks.map((p) => (
          <Link key={p.id} href={productHref(p.id)} className="line-link" onClick={onNavigate}>
            <Thumb art={p.id} photo={coverPhoto(p.id)} size={56} />
            <span className="stack" style={{ flex: 1, minWidth: 0 }}>
              <span className="body-strong">{p.text[lang].title}</span>
              <ProductPrice className="meta muted" product={p} t={t} />
            </span>
            <Icon name="chevron" size={18} className="muted" />
          </Link>
        ))}
      </section>
      <ButtonLink href={`/search?to=${to}`} iconAfter="arrow" fullWidth onClick={onNavigate}>
        {fmt(t.showTo, { m: recipientName(to, lang) })}
      </ButtonLink>
    </>
  );
}
