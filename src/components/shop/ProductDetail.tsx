"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Badge,
  Button,
  Chip,
  Gallery,
  IconButton,
  QuantityStepper,
  SpecList,
  Thumb,
} from "@/components/ui";
import {
  coverPhoto,
  defaultSelection,
  getBrand,
  getProduct,
  getSet,
  leadDays,
  products,
  selectionFor,
  regularUnitPrice,
  saleActive,
  unitPrice,
  type Selection,
} from "@/lib/data";
import { deliveryWhen, fmt, formatPrice } from "@/lib/i18n";
import { MAX_CART_QTY, useShop } from "@/lib/store";
import { useToday } from "@/lib/useToday";
import { Price } from "./Price";
import { PageShell } from "./PageShell";
import { gallerySlides } from "./productGallery";
import { productInfo } from "./productInfo";
import { ProductOptions } from "./ProductOptions";
import { ShopCard } from "./ShopCard";
import s from "./detail.module.css";

/** Product detail and set detail. `set` mode adds savings + "What's included". */
export function ProductDetail({
  id,
  mode,
}: {
  id: string;
  mode: "product" | "set";
}) {
  const { t, lang, isFav, toggleFav, addToCart, showToast } = useShop();
  const [qty, setQty] = useState(1);
  const [sel, setSel] = useState<Selection>(() => defaultSelection(id));
  const p = getProduct(id)!;
  const set = mode === "set" ? getSet(id) : undefined;
  const brand = getBrand(p.brand)!;
  const today = useToday();
  const when = deliveryWhen(leadDays(p.id, qty), today, t, lang);
  const { L, chips, specs } = productInfo(p, t, lang, sel, when);
  const fav = isFav(p.id);
  // A pack's own item follows the chosen size (e.g. aaruul 1 kg).
  const sizeChoice = selectionFor(p.id, sel).find(
    (c) => c.option.spec === "size",
  )?.value.label[lang];

  const related = products
    .filter(
      (x) =>
        x.id !== p.id &&
        (x.cat === p.cat || x.recipients.some((r) => p.recipients.includes(r))),
    )
    .slice(0, 4);

  const heart = (
    <IconButton
      icon="heart"
      label={fav ? t.unsave : t.save}
      pressed={fav}
      onClick={() => toggleFav(p.id)}
    />
  );

  return (
    <PageShell
      bar={{
        label: set ? t.setLabel : p.no,
        end: heart,
        actions: ["cart"],
        back: set ? "/sets" : "/search",
      }}
    >
      <div className={s.layout}>
        <div className={s.media}>
          <Gallery
            slides={gallerySlides(p, t, lang)}
            label={L.title}
            index={set ? undefined : p.no}
            matClassName={s.mat}
            prevLabel={t.prevImg}
            nextLabel={t.nextImg}
          />
        </div>

        <div className={s.info}>
          <div className={s.block}>
            {(p.isNew || p.top || saleActive(p)) && (
              <div className="chiprow">
                {saleActive(p) && <Badge tone="error">{t.sale}</Badge>}
                {p.isNew && <Badge tone="new">{t.newLabel}</Badge>}
                {p.top && <Badge>{t.topLong}</Badge>}
              </div>
            )}
            <h1 className="headline">{L.title}</h1>
            <Link
              href={`/search?brand=${brand.id}`}
              className={`meta ${s.brand}`}
            >
              {brand.name}
            </Link>
            {set?.savings && (
              <div>
                <Badge tone="ok" icon="check">
                  {fmt(t.saveVs, { p: formatPrice(set.savings) })}
                </Badge>
              </div>
            )}
          </div>

          <ProductOptions id={p.id} value={sel} onChange={setSel} />

          {set && (
            <section className={s.block} aria-labelledby="inc-h">
              <div className={s.incHead}>
                <h2 id="inc-h" className="title">
                  {t.included}
                </h2>
                <span className="small muted">
                  {set.includes.length === 1
                    ? t.types_1
                    : fmt(t.types_n, { n: set.includes.length })}
                </span>
              </div>
              <ul className={s.incList}>
                {/* Keyed by position: a set can hold the same product twice (aaruul ×3 + its tin). */}
                {set.includes.map((it, i) => (
                  <li key={`${i}-${it.art}`} className={s.incRow}>
                    <Thumb art={it.art} photo={coverPhoto(it.art)} size={64} />
                    <span className="stack" style={{ flex: 1, minWidth: 0 }}>
                      <span className="body-strong">{it.text[lang].name}</span>
                      <span className="meta muted">
                        {it.art === p.id && sizeChoice
                          ? sizeChoice
                          : it.text[lang].spec}
                      </span>
                    </span>
                    <span className={s.qtyBadge}>×{it.qty}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className={s.block}>
            <p className="body">{L.note}</p>
            <div className="chiprow">
              {chips.map((c) => (
                <Chip key={c}>{c}</Chip>
              ))}
            </div>
            <SpecList items={specs} />
          </div>

          <div className="buybar buybar--inline">
            <div className="buybar__row">
              <Price
                className="price-lg"
                now={formatPrice(unitPrice(p.id, sel))}
                was={
                  saleActive(p)
                    ? formatPrice(regularUnitPrice(p.id, sel))
                    : undefined
                }
                wasLabel={fmt(t.regularPrice, {
                  p: formatPrice(regularUnitPrice(p.id, sel)),
                })}
              />
              <QuantityStepper
                value={qty}
                onChange={setQty}
                max={MAX_CART_QTY}
                label={t.qty}
                decrementLabel={t.dec}
                incrementLabel={t.inc}
              />
            </div>
            <Button
              icon="plus"
              fullWidth
              onClick={() => {
                addToCart(p.id, qty, sel);
                showToast(t.added);
              }}
            >
              {set ? t.addSet : t.addToCart}
            </Button>
            <p className={`small muted ${s.note}`}>
              {fmt(t.preparedNote, { when })}
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className={`wrap ${s.related}`} aria-labelledby="rel-h">
          <h2 id="rel-h" className="title">
            {t.related}
          </h2>
          <div className={s.relGrid}>
            {related.map((r) => (
              <ShopCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
      <div className="buybar-spacer buybar-spacer--inline" />
    </PageShell>
  );
}
