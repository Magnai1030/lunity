"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Chip, EmptyState, Icon, IconButton, cx } from "@/components/ui";
import { FilterSheet } from "@/components/shop/FilterSheet";
import { PageShell } from "@/components/shop/PageShell";
import { QuickView } from "@/components/shop/QuickView";
import { ShopCard } from "@/components/shop/ShopCard";
import { activeFilterCount, brands, defaultFilters, filterProducts, type Category, type Filters, type Recipient, RECIPIENTS, recipients } from "@/lib/data";
import { fmt } from "@/lib/i18n";
import { useShop } from "@/lib/store";
import s from "./search.module.css";

const CATS: (Category | "all")[] = ["all", "sweets", "drinks", "home", "wear", "set"];

function fromParams(sp: URLSearchParams): Filters {
  const cat = sp.get("cat") as Category | null;
  const to = sp.get("to") as Recipient | null;
  const brand = sp.get("brand");
  return {
    ...defaultFilters,
    q: sp.get("q") ?? "",
    cat: cat && CATS.includes(cat) ? cat : "all",
    to: to && RECIPIENTS.includes(to) ? to : "all",
    brand: brand && brands.some((b) => b.id === brand) ? brand : "",
    top: sp.get("top") === "1",
  };
}

/** Remounts when the URL changes (e.g. header nav to another category). */
export function SearchView() {
  const sp = useSearchParams();
  return <Search key={sp.toString()} initial={fromParams(sp)} />;
}

function Search({ initial }: { initial: Filters }) {
  const { t, lang } = useShop();
  const [f, setF] = useState<Filters>(initial);
  const [filterOpen, setFilterOpen] = useState(false);
  const [quick, setQuick] = useState<string | null>(null);

  const results = filterProducts(f, lang);
  // Category and person have their own chip rows, so the Filter badge counts only the rest.
  const nFilters = activeFilterCount({ ...f, cat: "all", to: "all" });
  const idle = !f.q && activeFilterCount(f) === 0;

  const field = (id: string, className?: string) => (
    <div className={cx(s.field, className)}>
      <Icon name="search" size={18} />
      <label htmlFor={id} className="sr-only">
        {t.search}
      </label>
      <input id={id} type="search" value={f.q} placeholder={t.searchPh} onChange={(e) => setF({ ...f, q: e.target.value })} autoComplete="off" enterKeyHint="search" />
      {f.q && <IconButton icon="close" label={t.empty.search.cta} onClick={() => setF({ ...f, q: "" })} className={s.clear} />}
    </div>
  );

  return (
    <PageShell bar={{ center: field("q-mobile"), actions: ["cart"] }}>
      <div className={`wrap ${s.page}`}>
        <div className="desktop-only">
          <div className={s.deskHead}>
            <h1 className="headline">{t.search}</h1>
            {field("q-desk", s.fieldDesk)}
          </div>
        </div>

        <div className={s.toolbar}>
          <div className="chiprail" role="group" aria-label={t.filterCat}>
            {CATS.map((c) => (
              <Chip key={c} variant="outline" selected={f.cat === c} onClick={() => setF({ ...f, cat: c })}>
                {t.cats[c]}
              </Chip>
            ))}
          </div>
          <Button variant="secondary" icon="filter" onClick={() => setFilterOpen(true)} className={s.filterBtn}>
            {t.filter}
            {nFilters > 0 && <span className="pill-count">{nFilters}</span>}
          </Button>
        </div>
        <div className={cx("chiprail", s.toRail)} role="group" aria-label={t.filterTo}>
          <Chip variant="outline" selected={f.to === "all"} onClick={() => setF({ ...f, to: "all" })}>
            {t.anyTo}
          </Chip>
          {recipients.map((r) => (
            <Chip key={r.id} variant="outline" selected={f.to === r.id} onClick={() => setF({ ...f, to: r.id })}>
              {r.name[lang]}
            </Chip>
          ))}
        </div>

        {idle && (
          <section className={s.popular} aria-labelledby="pop-h">
            <h2 id="pop-h" className="label muted">
              {t.popular}
            </h2>
            <ul>
              {t.popularTerms.map((term) => (
                <li key={term}>
                  <button type="button" className={s.popRow} onClick={() => setF({ ...f, q: term })}>
                    <Icon name="search" size={18} className="muted" />
                    <span className="body">{term}</span>
                    <Icon name="arrow" size={18} className="muted" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className={s.count}>
          <span className="small muted" aria-live="polite">
            {results.length === 1 ? t.item : fmt(t.items, { n: results.length })}
          </span>
        </div>

        {results.length > 0 ? (
          <div className={s.grid}>
            {results.map((p) => (
              <ShopCard key={p.id} product={p} onQuickView={setQuick} />
            ))}
          </div>
        ) : f.q ? (
          <EmptyState
            icon="search"
            title={t.empty.search.title}
            text={t.empty.search.text}
            action={
              <Button variant="secondary" onClick={() => setF({ ...f, q: "" })}>
                {t.empty.search.cta}
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon="filter"
            title={t.empty.filter.title}
            text={t.empty.filter.text}
            action={
              <Button variant="secondary" onClick={() => setF(defaultFilters)}>
                {t.empty.filter.cta}
              </Button>
            }
          />
        )}
      </div>

      <FilterSheet
        open={filterOpen}
        value={f}
        onClose={() => setFilterOpen(false)}
        onApply={(next) => {
          setF(next);
          setFilterOpen(false);
        }}
      />
      <QuickView id={quick} onClose={() => setQuick(null)} />
    </PageShell>
  );
}
