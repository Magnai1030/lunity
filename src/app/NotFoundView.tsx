"use client";

import { ButtonLink } from "@/components/ui";
import { PageShell } from "@/components/shop/PageShell";
import { settings } from "@/lib/data";
import { useShop } from "@/lib/store";

export function NotFoundView() {
  const { t } = useShop();
  return (
    <PageShell footer="always">
      <div className="wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "48px var(--gutter) 64px", textAlign: "center" }}>
        <svg width="200" height="120" viewBox="0 0 200 120" aria-hidden="true">
          <circle cx="62" cy="62" r="40" fill="#2e7cc1" opacity="0.85" />
          <circle cx="104" cy="54" r="34" fill="#f1c232" opacity="0.85" />
          <circle cx="140" cy="72" r="30" fill="#cf3a2c" opacity="0.8" />
        </svg>
        <p className="muted" style={{ font: "800 88px/1 var(--font-sans)", letterSpacing: "-0.05em", opacity: 0.35 }} aria-hidden="true">
          404
        </p>
        <h1 className="headline">{t.notFound}</h1>
        <p className="body muted" style={{ maxWidth: 320 }}>
          {t.notFoundText}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 8 }}>
          <ButtonLink href="/" iconAfter="arrow">
            {t.goHome}
          </ButtonLink>
          <ButtonLink href="/search" variant="secondary">
            {t.browse}
          </ButtonLink>
        </div>
        <p className="small muted" style={{ marginTop: 16 }}>
          {t.helpFind}{" "}
          <a href={`mailto:${settings.contactEmail}`} className="textlink" style={{ color: "var(--ink)" }}>
            {t.contactUs}
          </a>
        </p>
      </div>
    </PageShell>
  );
}
