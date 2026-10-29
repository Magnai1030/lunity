"use client";

import Link from "next/link";
import { Button, ButtonLink, EmptyState, IconButton, Thumb } from "@/components/ui";
import { PageShell } from "@/components/shop/PageShell";
import { coverPhoto, getBrand, getProduct, productHref } from "@/lib/data";
import { fmt, formatPrice } from "@/lib/i18n";
import { useShop } from "@/lib/store";
import s from "./wishlist.module.css";

export function WishlistView() {
  const { t, lang, fav, toggleFav, addToCart, showToast, hydrated } = useShop();
  const items = fav.map(getProduct).filter((p) => !!p);
  const count = items.length === 1 ? t.item : fmt(t.items, { n: items.length });

  return (
    <PageShell bar={{ title: t.saved, aside: items.length ? count : undefined, actions: ["cart"] }}>
      <div className={`wrap wrap--narrow ${s.page}`}>
        <h1 className={`headline desktop-only ${s.deskTitle}`}>
          {t.saved} {items.length > 0 && <span className="small muted">{count}</span>}
        </h1>
        {!hydrated ? null : items.length === 0 ? (
          <EmptyState icon="heart" title={t.empty.wishlist.title} text={t.empty.wishlist.text} action={<ButtonLink href="/search" variant="secondary">{t.empty.wishlist.cta}</ButtonLink>} />
        ) : (
          <ul>
            {items.map((p) => {
              const title = p.text[lang].title;
              return (
                <li key={p.id} className={s.row}>
                  <Link href={productHref(p.id)} tabIndex={-1} aria-hidden="true">
                    <Thumb art={p.id} photo={coverPhoto(p.id)} size={88} />
                  </Link>
                  <div className={s.main}>
                    <Link href={productHref(p.id)} className="body-strong">
                      {title}
                    </Link>
                    <span className="meta muted">{getBrand(p.brand)?.name}</span>
                    <span className="price">{formatPrice(p.price)}</span>
                    <div>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon="plus"
                        onClick={() => {
                          addToCart(p.id);
                          showToast(t.added);
                        }}
                        aria-label={`${t.addToCart}: ${title}`}
                      >
                        {t.addToCart}
                      </Button>
                    </div>
                  </div>
                  <IconButton icon="close" label={`${t.unsave}: ${title}`} onClick={() => toggleFav(p.id)} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
