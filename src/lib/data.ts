/**
 * Read layer over the mock database (src/db). Rows are joined into the shapes the UI uses;
 * pages and components import from here, never from src/db directly.
 */
import { db, type SetItemRow, type CategoryRow, type CollectionItemKind, type Lang, type Localized, type OrderStatus, type Recipient, type SetGroup } from "@/db";

export type { CategoryRow, CollectionItemKind, Lang, OrderStatus, Recipient, SetGroup };
export type Tier = "classic" | "premium" | "";

export type Brand = {
  id: string;
  name: string;
  text: Localized<{ tag: string; about: string }>;
};

export type Product = {
  id: string;
  no: string;
  brand: string;
  /** categories.id */
  cat: string;
  recipients: Recipient[];
  tier: Tier;
  top?: boolean;
  isNew?: boolean;
  /** Regular price for the default options. */
  price: number;
  /** Lower price while on sale (see saleActive); null = no sale. */
  salePrice: number | null;
  /** Last day of the sale, ISO date; null = until turned off. */
  saleEndsAt: string | null;
  /** Units on hand; null = not tracked. Internal only — never shown to customers. */
  stock: number | null;
  text: Localized<{ title: string; size: string; note: string }>;
  /** Real product photos (URLs). When absent, the gallery uses the drawn views. */
  photos?: string[];
};

export type OptionValue = { id: string; label: Localized<string>; /** Price change vs. the default. */ delta?: number };

export type ProductOption = {
  id: string;
  name: Localized<string>;
  values: OptionValue[];
  /** Index of the value matching the catalog price. Defaults to 0. */
  default?: number;
  /** Which spec row the chosen value replaces. */
  spec?: "size" | "tier";
};

/** Chosen value id per option id. */
export type Selection = Record<string, string>;

export type SetInfo = {
  id: string;
  group: SetGroup;
  savings?: number;
  highlight: Localized<string>;
  includes: { art: string; qty: number; text: Localized<{ name: string; spec: string }> }[];
};

export type Order = {
  id: string;
  placed: string;
  readyBy: string;
  status: OrderStatus;
  address: string;
  contactPhone: string;
  shippingFee: number;
  items: { id: string; qty: number; unitPrice: number; regularUnitPrice: number; variant: Localized<string> | null }[];
};

/** Store-wide values: contact details, delivery promise, fees. */
export const settings = db.settings[0];

const byPosition = (a: { position: number }, b: { position: number }) => a.position - b.position;

export const brands: Brand[] = db.brands;

/* Categories: a tree up to 3 levels deep. */

export const categories: CategoryRow[] = [...db.categories].sort(byPosition);
export const getCategory = (id: string) => categories.find((c) => c.id === id);
export const categoryChildren = (parentId: string | null) => categories.filter((c) => c.parentId === parentId);
/** Top-level categories listed in the header and menu. */
export const menuCategories = categoryChildren(null).filter((c) => c.showInMenu);
export const categoryName = (id: string, lang: Lang) => getCategory(id)?.name[lang] ?? "";

/** Ancestors first, then the category itself: [Sweets, Aaruul, Smoked]. */
export function categoryPath(id: string): CategoryRow[] {
  const path: CategoryRow[] = [];
  for (let c = getCategory(id); c; c = c.parentId ? getCategory(c.parentId) : undefined) path.unshift(c);
  return path;
}

/** A category and everything beneath it, so choosing "Sweets" includes its subcategories. */
export function categoryAndBelow(id: string): Set<string> {
  const out = new Set([id]);
  for (let added = true; added; ) {
    added = false;
    for (const c of categories) {
      if (c.parentId && out.has(c.parentId) && !out.has(c.id)) {
        out.add(c.id);
        added = true;
      }
    }
  }
  return out;
}

/** Every product, archived ones included, so old orders and lookups still resolve. */
export const allProducts: Product[] = db.products.map((p) => ({
  id: p.id,
  no: p.sku,
  brand: p.brandId,
  cat: p.categoryId,
  recipients: p.recipients,
  tier: p.tier ?? "",
  top: p.isTop,
  isNew: p.isNew,
  price: p.price,
  salePrice: p.salePrice,
  saleEndsAt: p.saleEndsAt,
  stock: p.stock,
  text: p.text,
  photos: p.photos.length ? p.photos : undefined,
}));

const archived = new Set(db.products.filter((p) => p.status === "archived").map((p) => p.id));
/** Whether a product is shown in the store (not archived). */
export const isListed = (id: string) => !archived.has(id) && allProducts.some((p) => p.id === id);
/** Products shown in the store: everything that isn't archived. */
export const products: Product[] = allProducts.filter((p) => !archived.has(p.id));

/** A set item's name (its product's title) and detail (its note, else the chosen variant, else the product size). */
function setItemText(x: SetItemRow): Localized<{ name: string; spec: string }> {
  const p = db.products.find((y) => y.id === x.productId);
  const options = db.productOptions.filter((o) => o.productId === x.productId).sort(byPosition);
  const spec = (lang: Lang) => {
    if (x.note) return x.note[lang];
    if (!options.length) return p?.text[lang].size ?? "";
    return options
      .map((o) => {
        const values = db.optionValues.filter((v) => v.optionId === o.id);
        return (values.find((v) => v.key === x.selection[o.key]) ?? values.find((v) => v.isDefault) ?? values[0])?.label[lang];
      })
      .filter(Boolean)
      .join(" · ");
  };
  return {
    en: { name: p?.text.en.title ?? x.productId, spec: spec("en") },
    mn: { name: p?.text.mn.title ?? x.productId, spec: spec("mn") },
  };
}

/** Bundle contents for every set product, archived ones included. */
const allSets: SetInfo[] = db.sets.map((s) => ({
  id: s.productId,
  group: s.group,
  savings: s.savings ?? undefined,
  highlight: s.highlight,
  includes: db.setItems
    .filter((x) => x.setId === s.productId)
    .sort(byPosition)
    .map((x) => ({ art: x.productId, qty: x.qty, text: setItemText(x) })),
}));
/** Sets shown in the store. */
export const sets: SetInfo[] = allSets.filter((s) => !archived.has(s.id));

export const orders: Order[] = db.orders.map((o) => ({
  id: o.id,
  placed: o.placedAt,
  readyBy: o.readyBy,
  status: o.status,
  address: o.address,
  contactPhone: o.contactPhone,
  shippingFee: o.shippingFee,
  items: db.orderItems
    .filter((it) => it.orderId === o.id)
    .map((it) => ({ id: it.productId, qty: it.qty, unitPrice: it.unitPrice, regularUnitPrice: it.regularUnitPrice, variant: it.variant })),
}));

/** Signed-in demo account until real auth exists. */
export const demoUser = (({ name, phone, email }) => ({ name, phone, email }))(db.users[0]);

export const PRICE_MIN = Math.min(...products.map((p) => p.price));
export const PRICE_MAX = Math.max(...products.map((p) => p.price));

export const getProduct = (id: string) => allProducts.find((p) => p.id === id);
export const getBrand = (id: string) => brands.find((b) => b.id === id);
export const getSet = (id: string) => allSets.find((s) => s.id === id);
export const getOrder = (id: string) => orders.find((o) => o.id === id);
/** First photo of a product, if it has any; cards and thumbnails fall back to the drawing. */
export const coverPhoto = (id: string) => getProduct(id)?.photos?.[0];

/**
 * Days until `qty` of a product is delivered: the usual promise while stock covers it,
 * otherwise the supplier lead time. Customers only ever see the resulting date.
 */
export function leadDays(id: string, qty = 1) {
  const stock = getProduct(id)?.stock;
  return stock == null || stock >= qty ? settings.deliveryDays : settings.backorderDays;
}

/** Delivery days for a whole cart — the slowest line wins. Quantities of the same product add up across option lines. */
export function cartLeadDays(lines: { id: string; qty: number }[]) {
  const qty = new Map<string, number>();
  for (const l of lines) qty.set(l.id, (qty.get(l.id) ?? 0) + l.qty);
  return Math.max(settings.deliveryDays, ...[...qty].map(([id, n]) => leadDays(id, n)));
}

/** Products and sets in a named collection, in curated order. Unknown ids are skipped. */
export function getCollection(id: string): (Product & { kind: CollectionItemKind })[] {
  return db.collectionItems
    .filter((x) => x.collectionId === id)
    .sort(byPosition)
    .flatMap((x) => {
      const p = getProduct(x.itemId);
      if (!p || !isListed(x.itemId) || (x.kind === "set" && !getSet(x.itemId))) return [];
      return [{ ...p, kind: x.kind }];
    });
}

/** Choosable types per product. Deltas are relative to the catalog price. */
const OPTIONS: Record<string, ProductOption[]> = {};
for (const o of [...db.productOptions].sort(byPosition)) {
  const values = db.optionValues.filter((v) => v.optionId === o.id).sort(byPosition);
  const def = values.findIndex((v) => v.isDefault);
  (OPTIONS[o.productId] ??= []).push({
    id: o.key,
    name: o.name,
    spec: o.spec ?? undefined,
    default: def > 0 ? def : undefined,
    values: values.map((v) => ({ id: v.key, label: v.label, delta: v.priceDelta || undefined })),
  });
}

export const getOptions = (id: string) => OPTIONS[id] ?? [];

export function defaultSelection(id: string): Selection {
  return Object.fromEntries(getOptions(id).map((o) => [o.id, o.values[o.default ?? 0].id]));
}

const chosen = (id: string, sel: Selection | undefined) => {
  const full = { ...defaultSelection(id), ...sel };
  return getOptions(id).map((o) => ({ option: o, value: o.values.find((v) => v.id === full[o.id]) ?? o.values[o.default ?? 0] }));
};

/*
 * Sales. A sale's end date needs today's date, which only exists in the browser: Next refuses
 * the current time during prerendering. The store sets it when it hydrates (setToday) and
 * re-renders. Until then a dated sale counts as running, so prerendered pages show it.
 */
let today: string | null = null;
export const setToday = (iso: string) => {
  today = iso;
};

export function saleActive(p: Pick<Product, "price" | "salePrice" | "saleEndsAt">) {
  if (p.salePrice == null || p.salePrice >= p.price) return false;
  return !p.saleEndsAt || today === null || today <= p.saleEndsAt;
}

/** What the default options cost right now: the sale price while a sale runs. */
export const currentPrice = (p: Product) => (saleActive(p) ? p.salePrice! : p.price);

/** Regular price for a selection, ignoring any sale; shown struck through next to the sale price. */
export function regularUnitPrice(id: string, sel?: Selection) {
  const p = getProduct(id);
  return p ? unitPrice(id, sel) - currentPrice(p) + p.price : 0;
}

export function unitPrice(id: string, sel?: Selection) {
  const p = getProduct(id);
  const base = p ? currentPrice(p) : 0;
  const def = getOptions(id).reduce((n, o) => n + (o.values[o.default ?? 0].delta ?? 0), 0);
  return base - def + chosen(id, sel).reduce((n, c) => n + (c.value.delta ?? 0), 0);
}

export function priceRange(id: string) {
  const p = getProduct(id);
  const base = p ? currentPrice(p) : 0;
  let min = base;
  let max = base;
  for (const o of getOptions(id)) {
    const d0 = o.values[o.default ?? 0].delta ?? 0;
    const ds = o.values.map((v) => (v.delta ?? 0) - d0);
    min += Math.min(...ds);
    max += Math.max(...ds);
  }
  return { min, max };
}

/** "500 g · Premium" — empty when the product has no options. */
export function selectionLabel(id: string, sel: Selection | undefined, lang: Lang) {
  return chosen(id, sel).map((c) => c.value.label[lang]).join(" · ");
}

export const selectionFor = (id: string, sel: Selection | undefined) => chosen(id, sel);

/** Stable cart key: same product + same options = same line. */
export function lineKey(id: string, sel?: Selection) {
  const full = { ...defaultSelection(id), ...sel };
  const parts = Object.keys(full).sort().map((k) => `${k}=${full[k]}`);
  return parts.length ? `${id}|${parts.join(";")}` : id;
}

/** Sets open the set detail page; everything else opens product detail. */
export const productHref = (id: string) => (getSet(id) ? `/sets/${id}` : `/products/${id}`);

export const orderSubtotal = (o: Order) => o.items.reduce((sum, it) => sum + it.unitPrice * it.qty, 0);
export const orderTotal = (o: Order) => orderSubtotal(o) + o.shippingFee;
/** What sale prices saved on this order versus regular prices. */
export const orderSavings = (o: Order) => o.items.reduce((sum, it) => sum + (it.regularUnitPrice - it.unitPrice) * it.qty, 0);

/** Who gifts are for, in display order. */
export const recipients = [...db.recipients].sort(byPosition);
export const RECIPIENTS: Recipient[] = recipients.map((r) => r.id);
export const getRecipient = (id: string) => recipients.find((r) => r.id === id);
export const recipientName = (id: string, lang: Lang) => getRecipient(id)?.name[lang] ?? id;

/** Products that suit a recipient, top picks first, otherwise catalog order. */
export const giftsFor = (id: Recipient) =>
  products.filter((p) => p.recipients.includes(id)).sort((a, b) => Number(!!b.top) - Number(!!a.top));

export type Filters = {
  q: string;
  /** categories.id, or "all". */
  cat: string;
  to: Recipient | "all";
  brand: string;
  top: boolean;
  min: number;
  max: number;
};

export const defaultFilters: Filters = { q: "", cat: "all", to: "all", brand: "", top: false, min: PRICE_MIN, max: PRICE_MAX };

export function filterProducts(f: Filters, lang: Lang) {
  const q = f.q.trim().toLowerCase();
  return products.filter((p) => {
    if (f.cat !== "all" && !categoryAndBelow(f.cat).has(p.cat)) return false;
    if (f.to !== "all" && !p.recipients.includes(f.to)) return false;
    if (f.brand && p.brand !== f.brand) return false;
    if (f.top && !p.top) return false;
    if (currentPrice(p) < f.min || currentPrice(p) > f.max) return false;
    if (q) {
      const hay = [p.text.en.title, p.text.mn.title, p.text[lang].note, getBrand(p.brand)?.name ?? "", ...p.recipients.flatMap((r) => Object.values(getRecipient(r)?.name ?? {}))].join(" ").toLowerCase();
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  });
}

export function activeFilterCount(f: Filters) {
  return [f.cat !== "all", f.to !== "all", !!f.brand, f.top, f.min !== PRICE_MIN || f.max !== PRICE_MAX].filter(Boolean).length;
}
