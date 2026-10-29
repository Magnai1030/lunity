"use client";

import Link from "next/link";
import { Button, QuantityStepper, Thumb } from "@/components/ui";
import { coverPhoto, getBrand, getProduct, productHref, selectionLabel, unitPrice } from "@/lib/data";
import { formatPrice } from "@/lib/i18n";
import { MAX_CART_QTY, useShop, type CartLine as Line } from "@/lib/store";

export function CartLine({ line }: { line: Line }) {
  const { t, lang, setQty, remove } = useShop();
  const p = getProduct(line.id);
  if (!p) return null;
  const title = p.text[lang].title;
  const type = selectionLabel(p.id, line.sel, lang);
  return (
    <li className="cartline">
      <Link href={productHref(p.id)} tabIndex={-1} aria-hidden="true">
        <Thumb art={p.id} photo={coverPhoto(p.id)} size={80} />
      </Link>
      <div className="cartline__main">
        <Link href={productHref(p.id)} className="body-strong cartline__title">
          {title}
        </Link>
        <span className="meta muted">
          {getBrand(p.brand)?.name}
          {type && ` · ${type}`}
        </span>
        <div className="cartline__row">
          <QuantityStepper size="sm" value={line.qty} onChange={(n) => setQty(line.key, n)} max={MAX_CART_QTY} label={`${t.qty}: ${title}`} decrementLabel={t.dec} incrementLabel={t.inc} />
          <span className="price">{formatPrice(unitPrice(p.id, line.sel) * line.qty)}</span>
        </div>
        <div>
          <Button variant="danger" icon="close" onClick={() => remove(line.key)} aria-label={`${t.remove}: ${title}`}>
            {t.remove}
          </Button>
        </div>
      </div>
    </li>
  );
}
