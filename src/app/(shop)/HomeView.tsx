"use client";

import Link from "next/link";
import { startTransition, useState, ViewTransition } from "react";
import { Badge, Button, ButtonLink, Chip, Icon, ProductCard, Sheet } from "@/components/ui";
import { ProductArt } from "@/components/art/ProductArt";
import { Guide, InfoSheet, type InfoKind } from "@/components/shop/InfoSheets";
import { PageShell } from "@/components/shop/PageShell";
import { QuickView } from "@/components/shop/QuickView";
import { ShopCard } from "@/components/shop/ShopCard";
import { coverPhoto, brands, defaultFilters, filterProducts, getBrand, getCollection, getRecipient, giftsFor, productHref, products, RECIPIENTS, recipientName, recipients, type Category, type Recipient } from "@/lib/data";
import { fmt, formatPrice } from "@/lib/i18n";
import { useShop } from "@/lib/store";
import s from "./home.module.css";

const CATS: (Category | "all")[] = ["all", "sweets", "drinks", "home", "wear", "set"];

export function HomeView() {
  const { t, lang } = useShop();
  const [quick, setQuick] = useState<string | null>(null);
  const [info, setInfo] = useState<InfoKind | null>(null);
  const [guideTo, setGuideTo] = useState<Recipient | null>(null);
  const [cat, setCat] = useState<Category | "all">("all");
  const [to, setTo] = useState<Recipient | "all">("all");
  const [top, setTop] = useState(false);

  const items = filterProducts({ ...defaultFilters, cat, to, top }, lang);
  const topItems = products.filter((p) => p.top);
  const hasFilters = cat !== "all" || to !== "all" || top;
  const clear = () => {
    setCat("all");
    setTo("all");
    setTop(false);
  };

  return (
    <PageShell footer="always">
      <section className={s.heroBand}>
        <div className={`wrap ${s.hero}`}>
          <div className={s.heroCopy}>
            <h1 className="display">{t.heroTitle}</h1>
            <p className="body muted">{t.heroText}</p>
            <div className={s.cta}>
              <ButtonLink href="#items" iconAfter="arrow">
                {t.browse}
              </ButtonLink>
              <Button variant="secondary" onClick={() => setGuideTo(RECIPIENTS[0])}>
                {t.guideTitle}
              </Button>
            </div>
          </div>
          <div className={s.heroVis}>
            {getCollection("home-hero").map((p) => (
              <button key={p.id} type="button" className={s.heroItem} onClick={() => setQuick(p.id)} aria-label={`${t.quick}: ${p.text[lang].title}`}>
                <ProductArt id={p.id} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className={s.sections}>
        <section id="gifts-for" className={`wrap ${s.sec}`} aria-labelledby="for-h">
          <div className={s.secHead}>
            <h2 id="for-h" className="title">
              {t.newTitle}
            </h2>
            <p className="body muted">{t.newText}</p>
          </div>
          <GiftsFor onQuickView={setQuick} />
        </section>

        <section className={`wrap ${s.sec} mobile-only`} aria-labelledby="beg-h">
          <div className={s.secRow}>
            <h2 id="beg-h" className="title">
              {t.topPicks}
            </h2>
            <Link href="/search?top=1" className="small textlink">
              {fmt(t.items, { n: topItems.length })}
            </Link>
          </div>
          <div className={s.rail}>
            {topItems.map((p) => (
              <ShopCard key={p.id} product={p} onQuickView={setQuick} className={s.railCard} />
            ))}
          </div>
        </section>

        <section id="items" className={`wrap ${s.sec}`} aria-labelledby="all-h">
          <div className={s.secRow}>
            <h2 id="all-h" className="title">
              {t.allItems}
            </h2>
            <span className="small muted">{fmt(t.items, { n: items.length })}</span>
          </div>
          <div className={s.filters}>
            <div className={s.filterRow} role="group" aria-label={t.filterCat}>
              {CATS.map((c) => (
                <Chip key={c} variant="outline" selected={cat === c} onClick={() => setCat(c)}>
                  {t.cats[c]}
                </Chip>
              ))}
            </div>
            <div className={s.filterRow} role="group" aria-label={t.filterTo}>
              <Chip variant="outline" selected={to === "all"} onClick={() => setTo("all")}>
                {t.anyTo}
              </Chip>
              {RECIPIENTS.map((r) => (
                <Chip key={r} variant="outline" selected={to === r} onClick={() => setTo(r)}>
                  {recipientName(r, lang)}
                </Chip>
              ))}
              <Chip variant="outline" selected={top} onClick={() => setTop(!top)}>
                {t.topLong}
              </Chip>
            </div>
          </div>
          {items.length > 0 ? (
            <div className={s.grid}>
              {items.map((p) => (
                <ShopCard key={p.id} product={p} onQuickView={setQuick} />
              ))}
            </div>
          ) : (
            <div className={s.noMatch}>
              <p className="body">{t.noMatch}</p>
              <Button variant="secondary" onClick={clear}>
                {t.clearFilters}
              </Button>
            </div>
          )}
          {hasFilters && items.length > 0 && (
            <div>
              <Button variant="ghost" icon="close" onClick={clear}>
                {t.clearFilters}
              </Button>
            </div>
          )}
        </section>

        <section id="sets" className={`wrap ${s.sec}`} aria-labelledby="sets-h">
          <div className={s.secRow}>
            <h2 id="sets-h" className="title">
              {t.setsTitle}
            </h2>
            <Link href="/sets" className="small textlink">
              {t.setGroups.all}
            </Link>
          </div>
          <SetsTeaser />
        </section>

        <section id="brands" className={`wrap ${s.sec}`} aria-labelledby="brands-h">
          <div className={s.secHead}>
            <h2 id="brands-h" className="title">
              {t.brandsTitle}
            </h2>
            <p className="body muted">{t.brandsText}</p>
          </div>
          <div className={s.brandGrid}>
            {brands.map((b) => {
              const n = products.filter((p) => p.brand === b.id).length;
              return (
                <Link key={b.id} href={`/search?brand=${b.id}`} className={`${s.bar} ${s.brand}`}>
                  <span className={s.barText}>
                    <span className="label muted">{fmt(t.items, { n })}</span>
                    <span className="title">{b.name}</span>
                    <span className="small muted">{b.text[lang].tag}</span>
                  </span>
                  <Icon name="arrow" />
                </Link>
              );
            })}
          </div>
        </section>

        <section className={`wrap ${s.sec}`} aria-labelledby="support-h">
          <div className={s.secHead}>
            <h2 id="support-h" className="title">
              {t.supportTitle}
            </h2>
          </div>
          <div className={s.barGrid}>
            {(
              [
                ["how", t.howTitle, t.howSub],
                ["help", t.helpTitle, t.helpSub],
              ] as const
            ).map(([k, title, sub]) => (
              <button key={k} type="button" className={s.bar} onClick={() => setInfo(k)}>
                <span className={s.barText}>
                  <span className="body-strong">{title}</span>
                  <span className="small muted">{sub}</span>
                </span>
                <Icon name="arrow" />
              </button>
            ))}
          </div>
        </section>
      </div>

      <QuickView id={quick} onClose={() => setQuick(null)} />
      <InfoSheet kind={info} onClose={() => setInfo(null)} />
      <Sheet open={!!guideTo} onClose={() => setGuideTo(null)} title={t.guideTitle} closeLabel={t.close}>
        {guideTo && <Guide key={guideTo} initial={guideTo} onNavigate={() => setGuideTo(null)} />}
      </Sheet>
    </PageShell>
  );
}

/** Most cards shown per person; the button leads to the full list in search. */
const GIFTS_FOR_MAX = 8;

/** Person chips + matching products. Switching person crossfades the row. */
function GiftsFor({ onQuickView }: { onQuickView: (id: string) => void }) {
  const { t, lang } = useShop();
  const [who, setWho] = useState<Recipient>(RECIPIENTS[0]);
  const r = getRecipient(who)!;
  const picks = giftsFor(who).slice(0, GIFTS_FOR_MAX);
  return (
    <>
      <div className={s.filterRow} role="group" aria-label={t.filterTo}>
        {recipients.map((x) => (
          <Chip key={x.id} variant="outline" selected={who === x.id} onClick={() => startTransition(() => setWho(x.id))}>
            {x.name[lang]}
          </Chip>
        ))}
      </div>
      <ViewTransition key={who} name="gifts-for" share="auto" enter="auto" default="none">
        <div className={s.giftsFor}>
          <p className={`body muted ${s.giftsLine}`}>{r.line[lang]}</p>
          <div className={`${s.rail} ${s.railDeskGrid}`}>
            {picks.map((p) => (
              <ShopCard key={p.id} product={p} onQuickView={onQuickView} className={s.railCard} />
            ))}
          </div>
          <ButtonLink href={`/search?to=${who}`} variant="secondary" iconAfter="arrow" className={s.giftsMore}>
            {fmt(t.showTo, { m: r.name[lang] })}
          </ButtonLink>
        </div>
      </ViewTransition>
    </>
  );
}

function SetsTeaser() {
  const { t, lang } = useShop();
  return (
    <div className={s.rail + " " + s.railDesk3}>
      {getCollection("home-sets").map((p) => {
        return (
          <ProductCard
            key={p.id}
            className={s.railCard}
            href={productHref(p.id)}
            art={p.id} photo={coverPhoto(p.id)}
            title={p.text[lang].title}
            brand={getBrand(p.brand)?.name}
            price={formatPrice(p.price)}
            extra={<span className="small muted">{p.text[lang].size}</span>}
            badges={p.isNew ? <Badge tone="new">{t.newLabel}</Badge> : null}
          />
        );
      })}
    </div>
  );
}
