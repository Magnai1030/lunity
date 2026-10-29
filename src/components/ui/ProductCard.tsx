import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "./cx";
import { ImageMat } from "./ImageMat";

type Props = {
  href: string;
  art: string;
  /** Cover photo URL; the drawing is used when absent. */
  photo?: string;
  title: string;
  brand?: string;
  price: ReactNode;
  index?: string;
  /** Badges row. Always reserves its height so titles line up across a row. */
  badges?: ReactNode;
  /** Extra line under the brand (e.g. set contents). */
  extra?: ReactNode;
  /** Pinned to the top-right of the image (wishlist). */
  matAction?: ReactNode;
  /** Pinned to the bottom of the card (quick view / add). */
  action?: ReactNode;
  className?: string;
};

/**
 * Product tile. The card is a flex column whose body grows, so the price and
 * action line up across every card in a grid row regardless of title length.
 */
export function ProductCard({ href, art, photo, title, brand, price, index, badges, extra, matAction, action, className }: Props) {
  return (
    <article className={cx("at-card", className)}>
      <div className="at-card__media">
        <Link href={href} transitionTypes={["nav-forward"]} tabIndex={-1} aria-hidden="true" className="at-card__medialink">
          <ImageMat art={art} photo={photo} index={index} />
        </Link>
        {matAction && <div className="at-card__fav">{matAction}</div>}
      </div>
      <div className="at-card__body">
        <div className="at-card__badges">{badges}</div>
        <h3 className="at-card__title">
          <Link href={href} transitionTypes={["nav-forward"]} className="at-card__link">
            {title}
          </Link>
        </h3>
        {brand && <div className="meta muted">{brand}</div>}
        {extra}
        <div className="at-card__price">{price}</div>
      </div>
      {action && <div className="at-card__action">{action}</div>}
    </article>
  );
}
