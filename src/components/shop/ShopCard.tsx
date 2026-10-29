"use client";

import { Badge, Button, IconButton, ProductCard } from "@/components/ui";
import { coverPhoto, getBrand, priceRange, productHref, saleActive, type Product } from "@/lib/data";
import { fmt, formatPrice } from "@/lib/i18n";
import { useShop } from "@/lib/store";
import { Price } from "./Price";

/** ProductCard wired to the store: wishlist heart, badges, localized text. */
export function ShopCard({ product: p, onQuickView, className }: { product: Product; onQuickView?: (id: string) => void; className?: string }) {
  const { t, lang, isFav, toggleFav } = useShop();
  const fav = isFav(p.id);
  const L = p.text[lang];
  const { min, max } = priceRange(p.id);
  const onSale = saleActive(p);
  // Same options, regular price: the sale only lowers the base.
  const wasMin = min - (p.salePrice ?? p.price) + p.price;
  const now = min === max ? formatPrice(min) : fmt(t.from, { p: formatPrice(min) });
  return (
    <ProductCard
      className={className}
      href={productHref(p.id)}
      art={p.id} photo={coverPhoto(p.id)}
      index={p.no}
      title={L.title}
      brand={getBrand(p.brand)?.name}
      price={<Price now={now} was={onSale ? formatPrice(wasMin) : undefined} wasLabel={fmt(t.regularPrice, { p: formatPrice(wasMin) })} />}
      badges={
        <>
          {onSale && <Badge tone="error">{t.sale}</Badge>}
          {p.isNew && <Badge tone="new">{t.newLabel}</Badge>}
          {p.top && !p.isNew && !onSale && <Badge>{t.top}</Badge>}
        </>
      }
      matAction={<IconButton icon="heart" label={fav ? t.unsave : t.save} pressed={fav} onClick={() => toggleFav(p.id)} />}
      action={
        onQuickView && (
          <Button variant="secondary" fullWidth onClick={() => onQuickView(p.id)} aria-label={`${t.quick}: ${L.title}`}>
            {t.quick}
          </Button>
        )
      }
    />
  );
}
