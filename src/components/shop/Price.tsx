import type { ReactNode } from "react";
import { currentPrice, priceRange, saleActive, type Product } from "@/lib/data";
import { fmt, formatPrice, type Dict } from "@/lib/i18n";

/** A price, plus the regular price struck through when it's on sale. `children` replaces the formatted price (e.g. "From ₮30,000"). */
export function Price({
  now,
  was,
  wasLabel,
  className,
  children,
}: {
  now: string;
  was?: string;
  wasLabel?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span className={className}>
      {children ?? now}
      {was && (
        <>
          {" "}
          <s className="price-was" aria-label={wasLabel}>
            {was}
          </s>
        </>
      )}
    </span>
  );
}

/**
 * A product's price as the store shows it everywhere: the lowest price right now ("From ₮50,000"
 * when variants cost more), plus the regular price struck through while a sale runs.
 */
export function ProductPrice({
  product: p,
  t,
  className,
}: {
  product: Product;
  t: Dict;
  className?: string;
}) {
  const { min, max } = priceRange(p.id);
  // Same options at the regular price: a sale only lowers the base.
  const was = min - currentPrice(p) + p.price;
  const now =
    min === max ? formatPrice(min) : fmt(t.from, { p: formatPrice(min) });
  return (
    <Price
      className={className}
      now={now}
      was={saleActive(p) ? formatPrice(was) : undefined}
      wasLabel={fmt(t.regularPrice, { p: formatPrice(was) })}
    />
  );
}
