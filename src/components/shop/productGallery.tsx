import type { GallerySlide } from "@/components/ui";
import { ProductArt, type ArtView } from "@/components/art/ProductArt";
import { getProduct, getSet, type Lang, type Product } from "@/lib/data";
import { fmt, type Dict } from "@/lib/i18n";

const art = (id: string, view: ArtView, key: string, label: string): GallerySlide => ({
  key,
  label,
  image: <ProductArt id={id} view={view} />,
  thumb: <ProductArt id={id} view={view} />,
});

/**
 * Gallery slides for a product. Real photos (`product.photos`) win; otherwise
 * the drawn views: product, close-up, gift wrap — and for sets, each included item.
 */
export function gallerySlides(p: Product, t: Dict, lang: Lang): GallerySlide[] {
  const title = p.text[lang].title;
  if (p.photos?.length) {
    return p.photos.map((src, i) => ({
      key: src,
      label: `${title} ${i + 1}`,
      // eslint-disable-next-line @next/next/no-img-element -- arbitrary remote photos, sized by the mat
      image: <img src={src} alt={`${title} ${i + 1}`} />,
      // eslint-disable-next-line @next/next/no-img-element
      thumb: <img src={src} alt="" />,
    }));
  }
  const slides = [art(p.id, "main", "main", t.views.main), art(p.id, "detail", "detail", t.views.detail)];
  const set = getSet(p.id);
  if (set) {
    for (const it of set.includes) {
      if (it.art === p.id || !getProduct(it.art)) continue;
      slides.push(art(it.art, "main", `inc-${it.art}`, fmt(t.views.item, { n: it.text[lang].name })));
    }
  }
  slides.push(art(p.id, "swatch", "swatch", t.views.swatch));
  return slides;
}
