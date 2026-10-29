# Lunar Gift Shop — Lunar New Year (Tsagaan Sar) gifts

Next.js 16 (App Router, TypeScript). Same Atelier theme and structure as `prime-shop`, with a gift catalog and no gallery / play / studio.

```bash
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Structure

- `src/app/globals.css` — **Atelier** tokens (colors light/dark, type scale, spacing, radii, shadows).
- `src/components/ui/` — design-system components (`Button`, `IconButton`, `Chip`, `Badge`, `ImageMat`, `Thumb`, `ProductCard`, `SpecList`, `SummaryRows`, `TextInput`, `TextArea`, `QuantityStepper`, `Sheet`, `Tabs`, `Toggle`, `RangeSlider`, `ChipGroup`, `InfoBanner`, `EmptyState`, `ListRow`, `Gallery`, `OptionGroup`, `Icon`) + `atelier.css`.
- `src/components/art/ProductArt.tsx` — product illustrations as SVG (placeholders until real photos are added).
- `src/components/shop/` — header, app bar, menu drawer, footer, quick view, filter sheet, info sheets, product detail.
- `src/lib/` — catalog/orders data, EN/MN dictionary, client store (cart, wishlist, language, demo user) persisted in localStorage.

## Routes

`/` landing (mobile + web) · `/search` (filter sheet: category, recipient, brand, price, top gifts) · `/products/[id]` · `/sets` · `/sets/[id]` · `/cart` · `/checkout` · `/orders` · `/orders/[id]` · `/wishlist` · `/profile` · `/login` · `/design-system` · 404.

Product types (weight, layers, edition, colour…) live in `OPTIONS` in `src/lib/data.ts`; prices are deltas from the catalog price, and each product + type is its own cart line. Add real photos per product via `photos: string[]` — the gallery uses them instead of the drawn views.

Auth, payments and orders are front-end mocks.
