"use client";

import Link from "next/link";
import { Button, cx } from "@/components/ui";
import { settings } from "@/lib/data";
import { useShop } from "@/lib/store";
import { Wordmark } from "./Logo";

export function SiteFooter({ desktopOnly }: { desktopOnly?: boolean }) {
  const { t, lang, setLang } = useShop();
  return (
    <footer className={cx("site-footer", desktopOnly && "desktop-only")}>
      <div className="site-footer__inner">
        <Link href="/" className="wordmark">
          <Wordmark name={t.shop} />
        </Link>
        <p className="body muted">{t.footAbout}</p>
        <div className="site-footer__contact">
          <a className="small muted" href={`mailto:${settings.contactEmail}`}>
            {settings.contactEmail}
          </a>
          <span className="small muted" aria-hidden="true">
            ·
          </span>
          <a className="small muted" href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}>
            {settings.contactPhone}
          </a>
        </div>
        <div className="langswitch" role="group" aria-label={t.langH}>
          <Button size="sm" variant={lang === "en" ? "primary" : "secondary"} onClick={() => setLang("en")} lang="en" aria-pressed={lang === "en"}>
            English
          </Button>
          <Button size="sm" variant={lang === "mn" ? "primary" : "secondary"} onClick={() => setLang("mn")} lang="mn" aria-pressed={lang === "mn"}>
            Монгол
          </Button>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span className="small muted">{t.rights}</span>
        <span className="small muted" aria-hidden="true">
          ·
        </span>
        <span className="small muted">{t.currency}</span>
      </div>
    </footer>
  );
}
