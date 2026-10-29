"use client";

import { useRef, useState, type ReactNode } from "react";
import { cx } from "./cx";
import { IconButton } from "./IconButton";

export type GallerySlide = { key: string; label: string; image: ReactNode; thumb: ReactNode };

type Props = {
  slides: GallerySlide[];
  /** Accessible name for the whole gallery, e.g. the product title. */
  label: string;
  prevLabel?: string;
  nextLabel?: string;
  /** Mono label on the first slide, e.g. "N° 012". */
  index?: string;
  /** Extra class for each slide's mat (sizing). */
  matClassName?: string;
};

/** Swipeable image gallery: scroll-snap track, arrows (desktop), counter, thumbnail strip. */
export function Gallery({ slides, label, prevLabel = "Previous image", nextLabel = "Next image", index, matClassName }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const n = slides.length;

  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const next = Math.max(0, Math.min(n - 1, i));
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: next * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
    setActive(next);
  };

  return (
    <section className="at-gallery" aria-roledescription="carousel" aria-label={label}>
      <div className="at-gallery__viewport">
        <div
          ref={track}
          className="at-gallery__track"
          tabIndex={0}
          aria-label={label}
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== active) setActive(i);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              goTo(active + 1);
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              goTo(active - 1);
            }
          }}
        >
          {slides.map((s, i) => (
            <div key={s.key} className="at-gallery__slide" role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${n}: ${s.label}`} aria-hidden={i !== active}>
              <div className={cx("at-mat", "at-mat--hero", matClassName)}>
                <div className="at-mat__stage">{s.image}</div>
                {i === 0 && index && <span className="at-mat__index label">{index}</span>}
              </div>
            </div>
          ))}
        </div>
        {n > 1 && (
          <>
            <span className="at-gallery__count small" aria-hidden="true">
              {active + 1} / {n}
            </span>
            <IconButton icon="back" label={prevLabel} tone="surface" className="at-gallery__nav at-gallery__nav--prev" onClick={() => goTo(active - 1)} disabled={active === 0} />
            <IconButton icon="arrow" label={nextLabel} tone="surface" className="at-gallery__nav at-gallery__nav--next" onClick={() => goTo(active + 1)} disabled={active === n - 1} />
          </>
        )}
      </div>
      {n > 1 && (
        <div className="at-gallery__thumbs">
          {slides.map((s, i) => (
            <button key={s.key} type="button" className={cx("at-gallery__thumb", i === active && "is-active")} aria-label={s.label} aria-current={i === active} onClick={() => goTo(i)}>
              {s.thumb}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
