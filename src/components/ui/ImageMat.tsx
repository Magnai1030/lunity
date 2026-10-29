import type { ReactNode } from "react";
import { ProductArt } from "../art/ProductArt";
import { cx } from "./cx";

type Props = {
  /** Product id to draw, or pass custom children. */
  art?: string;
  /** Real photo URL; shown instead of the drawing when set. */
  photo?: string;
  children?: ReactNode;
  /** Mono index label in the top-left corner, e.g. "N° 001". */
  index?: string;
  /** Element pinned to the top-right corner (usually a wishlist button). */
  action?: ReactNode;
  size?: "card" | "hero" | "feature";
  className?: string;
};

/** Neutral mat that holds a product image. Never crops the artwork. */
export function ImageMat({ art, photo, children, index, action, size = "card", className }: Props) {
  return (
    <div className={cx("at-mat", `at-mat--${size}`, className)}>
      <div className="at-mat__stage">{photo ? <Photo src={photo} /> : art ? <ProductArt id={art} /> : children}</div>
      {index && <span className="at-mat__index label">{index}</span>}
      {action && <div className="at-mat__action">{action}</div>}
    </div>
  );
}

/** Small square mat for list rows (cart, orders, wishlist). */
export function Thumb({ art, photo, size = 72, className }: { art: string; photo?: string; size?: number; className?: string }) {
  return (
    <span className={cx("at-thumb", className)} style={{ width: size, height: size, padding: Math.round(size * 0.12) }}>
      {photo ? <Photo src={photo} /> : <ProductArt id={art} />}
    </span>
  );
}

// Decorative here: the product name is always next to the image.
// eslint-disable-next-line @next/next/no-img-element -- uploaded photos of unknown size, fitted by the mat
const Photo = ({ src }: { src: string }) => <img src={src} alt="" loading="lazy" decoding="async" />;
