"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Badge,
  Button,
  Chip,
  IconButton,
  ImageMat,
  QuantityStepper,
  Sheet,
  SpecList,
} from "@/components/ui";
import {
  coverPhoto,
  defaultSelection,
  getBrand,
  getProduct,
  leadDays,
  productHref,
  regularUnitPrice,
  saleActive,
  unitPrice,
  type Selection,
} from "@/lib/data";
import { deliveryWhen, fmt, formatPrice } from "@/lib/i18n";
import { MAX_CART_QTY, useShop } from "@/lib/store";
import { useToday } from "@/lib/useToday";
import { Price } from "./Price";
import { productInfo } from "./productInfo";
import { ProductOptions } from "./ProductOptions";

export function QuickView({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const { t, lang } = useShop();
  const p = id ? getProduct(id) : undefined;
  return (
    <Sheet
      open={!!p}
      onClose={onClose}
      title={p ? p.text[lang].title : t.quick}
      wide
      closeLabel={t.close}
      head={<span className="label muted">{p?.no}</span>}
    >
      {p && <QuickViewBody key={p.id} id={p.id} onClose={onClose} />}
    </Sheet>
  );
}

function QuickViewBody({ id, onClose }: { id: string; onClose: () => void }) {
  const { t, lang, isFav, toggleFav, addToCart, showToast } = useShop();
  const [qty, setQty] = useState(1);
  const [sel, setSel] = useState<Selection>(() => defaultSelection(id));
  const p = getProduct(id)!;
  const today = useToday();
  const when = deliveryWhen(leadDays(p.id, qty), today, t, lang);
  const { L, chips, specs } = productInfo(p, t, lang, sel, when);
  const fav = isFav(p.id);

  return (
    <div className="qv">
      <ImageMat
        art={p.id}
        photo={coverPhoto(p.id)}
        action={
          <IconButton
            icon="heart"
            label={fav ? t.unsave : t.save}
            pressed={fav}
            onClick={() => toggleFav(p.id)}
          />
        }
      />
      <div className="qv__info">
        {(p.isNew || p.top || saleActive(p)) && (
          <div className="chiprow">
            {saleActive(p) && <Badge tone="error">{t.sale}</Badge>}
            {p.isNew && <Badge tone="new">{t.newLabel}</Badge>}
            {p.top && <Badge>{t.topLong}</Badge>}
          </div>
        )}
        <h2 className="headline">{L.title}</h2>
        <div className="meta muted">{getBrand(p.brand)?.name}</div>
        <p className="body">{L.note}</p>
        <div className="chiprow">
          {chips.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </div>
        <ProductOptions id={p.id} value={sel} onChange={setSel} />
        <SpecList items={specs} />
        <div className="qv__buy">
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
            onClose();
          }}
        >
          {t.addToCart}
        </Button>
        <Link
          href={productHref(p.id)}
          className="small textlink"
          onClick={onClose}
        >
          {L.title} →
        </Link>
      </div>
    </div>
  );
}
