"use client";

import { useState } from "react";
import { Button, Chip, ChipGroup, RangeSlider, Sheet, Toggle } from "@/components/ui";
import { activeFilterCount, brands, defaultFilters, filterProducts, PRICE_MAX, PRICE_MIN, categoryChildren, categoryName, type Filters, RECIPIENTS, recipientName } from "@/lib/data";
import { fmt, formatPrice } from "@/lib/i18n";
import { useShop } from "@/lib/store";

const CATS = ["all", ...categoryChildren(null).map((c) => c.id)];
const TO = ["all", ...RECIPIENTS] as const;

/** Bottom-sheet filter. Edits a draft and applies it on "Show N items". */
export function FilterSheet({ open, value, onApply, onClose }: { open: boolean; value: Filters; onApply: (f: Filters) => void; onClose: () => void }) {
  const { t } = useShop();
  return (
    <Sheet open={open} onClose={onClose} title={t.filter} closeLabel={t.close} head={<FilterHead count={activeFilterCount(value)} />}>
      {open && <FilterBody initial={value} onApply={onApply} />}
    </Sheet>
  );
}

function FilterHead({ count }: { count: number }) {
  const { t } = useShop();
  return (
    <h2 className="title filter-head">
      {t.filter}
      {count > 0 && <span className="pill-count">{count}</span>}
    </h2>
  );
}

function FilterBody({ initial, onApply }: { initial: Filters; onApply: (f: Filters) => void }) {
  const { t, lang } = useShop();
  const [f, setF] = useState<Filters>(initial);
  const patch = (p: Partial<Filters>) => setF((cur) => ({ ...cur, ...p }));
  const n = filterProducts(f, lang).length;

  return (
    <>
      <ChipGroup label={t.filterCat}>
        {CATS.map((c) => (
          <Chip key={c} variant="outline" selected={f.cat === c} onClick={() => patch({ cat: c })}>
            {c === "all" ? t.allCats : categoryName(c, lang)}
          </Chip>
        ))}
      </ChipGroup>
      <ChipGroup label={t.filterTo}>
        {TO.map((r) => (
          <Chip key={r} variant="outline" selected={f.to === r} onClick={() => patch({ to: r })}>
            {r === "all" ? t.any : recipientName(r, lang)}
          </Chip>
        ))}
      </ChipGroup>
      <ChipGroup label={t.filterBrand}>
        <Chip variant="outline" selected={!f.brand} onClick={() => patch({ brand: "" })}>
          {t.all}
        </Chip>
        {brands.map((b) => (
          <Chip key={b.id} variant="outline" selected={f.brand === b.id} onClick={() => patch({ brand: b.id })}>
            {b.name}
          </Chip>
        ))}
      </ChipGroup>
      <fieldset className="at-chipgroup">
        <legend className="label muted">{t.filterPrice}</legend>
        <RangeSlider
          min={PRICE_MIN}
          max={PRICE_MAX}
          low={f.min}
          high={f.max}
          onChange={(min, max) => patch({ min, max })}
          format={formatPrice}
          minLabel={t.minPrice}
          maxLabel={t.maxPrice}
        />
      </fieldset>
      <Toggle checked={f.top} onChange={(top) => patch({ top })} label={t.topFilter} description={t.topFilterText} />

      <div className="filter-foot">
        <Button variant="ghost" onClick={() => setF({ ...defaultFilters, q: f.q })}>
          {t.reset}
        </Button>
        <Button onClick={() => onApply(f)} disabled={n === 0}>
          {fmt(t.showN, { n })}
        </Button>
      </div>
    </>
  );
}
