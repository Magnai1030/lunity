"use server";

import { randomUUID } from "node:crypto";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import type { Category, CollectionItemKind, Localized, OrderStatus, ProductRow, ProductStatus, SetGroup, Tier } from "@/db/models";
import { readTable, updateTable } from "@/db/store";
import { requireAdmin } from "./guard";

export type ActionResult = { ok: boolean; message: string } | null;

const CATEGORIES: Category[] = ["sweets", "drinks", "home", "wear", "set"];
const STATUSES: OrderStatus[] = ["preparing", "ready", "completed"];

const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
/** Whole number ≥ 0, or null when the field is empty or invalid. */
function count(v: unknown) {
  const s = String(v ?? "").replace(/[\s,₮]/g, "");
  if (s === "") return null;
  const n = Number(s);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

/* Settings */

export async function saveSettings(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  requireAdmin();
  const nums = {
    shippingFee: count(fd.get("shippingFee")),
    deliveryDays: count(fd.get("deliveryDays")),
    backorderDays: count(fd.get("backorderDays")),
    lowStockThreshold: count(fd.get("lowStockThreshold")),
    qrPaymentSeconds: count(fd.get("qrPaymentMinutes")),
  };
  const bad = Object.entries(nums).find(([, v]) => v === null);
  if (bad) return { ok: false, message: "Use whole numbers of 0 or more in every number field." };
  if (nums.deliveryDays! < 1 || nums.backorderDays! < nums.deliveryDays!)
    return { ok: false, message: "Supplier delivery days must be at least the normal delivery days, and both at least 1." };
  const contactEmail = text(fd, "contactEmail");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) return { ok: false, message: "Enter a valid contact email." };

  updateTable("settings", ([row]) => [
    {
      ...row,
      contactEmail,
      contactPhone: text(fd, "contactPhone"),
      defaultCity: text(fd, "defaultCity"),
      shippingFee: nums.shippingFee!,
      deliveryDays: nums.deliveryDays!,
      backorderDays: nums.backorderDays!,
      lowStockThreshold: nums.lowStockThreshold!,
      qrPaymentSeconds: nums.qrPaymentSeconds! * 60,
    },
  ]);
  refresh();
  return { ok: true, message: "Settings saved" };
}

/* Products */

/** One-field edits from the products table: price, stock, top pick, new. */
export async function updateProductQuick(id: string, patch: Partial<Pick<ProductRow, "price" | "stock" | "isTop" | "isNew">>) {
  requireAdmin();
  if (patch.price !== undefined && count(patch.price) === null) return { ok: false, message: "Price must be a whole number." };
  if (patch.stock !== undefined && patch.stock !== null && count(patch.stock) === null) return { ok: false, message: "Stock must be a whole number." };
  updateTable("products", (rows) => rows.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  refresh();
  return { ok: true, message: "Saved" };
}

export async function saveProduct(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  requireAdmin();
  const id = text(fd, "id");
  const price = count(fd.get("price"));
  const track = fd.get("trackStock") === "on";
  const stock = track ? count(fd.get("stock")) : null;
  const onSale = fd.get("onSale") === "on";
  const salePrice = onSale ? count(fd.get("salePrice")) : null;
  const saleEndsAt = onSale ? text(fd, "saleEndsAt") || null : null;
  const category = text(fd, "category") as Category;
  const tier = text(fd, "tier") as Tier | "";
  const brands = readTable("brands");
  const recipients = new Set(readTable("recipients").map((r) => r.id));

  if (!text(fd, "title_en") || !text(fd, "title_mn")) return { ok: false, message: "Add a title in both English and Mongolian." };
  if (price === null || price === 0) return { ok: false, message: "Enter a price above 0." };
  if (track && stock === null) return { ok: false, message: "Enter how many are in stock, or turn off stock tracking." };
  if (onSale && (salePrice === null || salePrice === 0 || salePrice >= price))
    return { ok: false, message: "The sale price must be above 0 and below the regular price." };
  if (saleEndsAt && !/^\d{4}-\d{2}-\d{2}$/.test(saleEndsAt)) return { ok: false, message: "Pick a valid sale end date, or leave it empty." };
  if (!CATEGORIES.includes(category)) return { ok: false, message: "Choose a category." };
  if (!brands.some((b) => b.id === text(fd, "brandId"))) return { ok: false, message: "Choose a brand." };

  updateTable("products", (rows) =>
    rows.map((p) =>
      p.id === id
        ? {
            ...p,
            salePrice,
            saleEndsAt,
            brandId: text(fd, "brandId"),
            category,
            recipients: fd.getAll("recipients").map(String).filter((r) => recipients.has(r)),
            tier: tier === "classic" || tier === "premium" ? tier : null,
            price,
            stock,
            isTop: fd.get("isTop") === "on",
            isNew: fd.get("isNew") === "on",
            text: {
              en: { title: text(fd, "title_en"), size: text(fd, "size_en"), note: text(fd, "note_en") },
              mn: { title: text(fd, "title_mn"), size: text(fd, "size_mn"), note: text(fd, "note_mn") },
            },
          }
        : p,
    ),
  );
  refresh();
  return { ok: true, message: "Product saved" };
}

/** Adds a draft product with safe defaults and opens it for editing. */
export async function createProduct() {
  requireAdmin();
  const rows = readTable("products");
  const n = Math.max(0, ...rows.map((p) => Number(p.id.replace(/\D/g, "")) || 0)) + 1;
  const id = `p${n}`;
  const brandId = readTable("brands")[0].id;
  updateTable("products", (all) => [
    ...all,
    {
      id,
      status: "active",
      sku: `N° ${String(n).padStart(3, "0")}`,
      brandId,
      category: "sweets",
      recipients: [],
      tier: null,
      price: 10000,
      salePrice: null,
      saleEndsAt: null,
      stock: 0,
      isTop: false,
      isNew: true,
      text: { en: { title: "New product", size: "", note: "" }, mn: { title: "Шинэ бүтээгдэхүүн", size: "", note: "" } },
      photos: [],
    },
  ]);
  redirect(`/admin/products/${id}`);
}

/* Product photos — files live in public/uploads/products, URLs in products.photos (first = cover). */

const PHOTO_DIR = path.join(process.cwd(), "public/uploads/products");
const PHOTO_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
const PHOTO_MAX = 5 * 1024 * 1024;

const setPhotos = (id: string, fn: (photos: string[]) => string[]) =>
  updateTable("products", (rows) => rows.map((p) => (p.id === id ? { ...p, photos: fn(p.photos) } : p)));

export async function uploadProductPhoto(id: string, fd: FormData) {
  requireAdmin();
  const file = fd.get("photo");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Choose a photo to upload." };
  const ext = PHOTO_TYPES[file.type];
  if (!ext) return { ok: false, message: `${file.name}: use a JPG, PNG, WebP or AVIF image.` };
  if (file.size > PHOTO_MAX) return { ok: false, message: `${file.name} is over 5 MB. Export it smaller and try again.` };
  if (!readTable("products").some((p) => p.id === id)) return { ok: false, message: "This product no longer exists." };

  mkdirSync(PHOTO_DIR, { recursive: true });
  const name = `${id}-${randomUUID().slice(0, 8)}.${ext}`;
  writeFileSync(path.join(PHOTO_DIR, name), Buffer.from(await file.arrayBuffer()));
  setPhotos(id, (photos) => [...photos, `/uploads/products/${name}`]);
  refresh();
  return { ok: true, message: "Photo added" };
}

export async function removeProductPhoto(id: string, src: string) {
  requireAdmin();
  setPhotos(id, (photos) => photos.filter((x) => x !== src));
  // Only delete files we uploaded; external URLs are just unlinked from the product.
  if (src.startsWith("/uploads/products/")) {
    try {
      unlinkSync(path.join(PHOTO_DIR, path.basename(src)));
    } catch {
      // already gone
    }
  }
  refresh();
}

/** Moves a photo to a new position; position 0 makes it the cover. */
export async function moveProductPhoto(id: string, src: string, to: number) {
  requireAdmin();
  setPhotos(id, (photos) => {
    const rest = photos.filter((x) => x !== src);
    if (rest.length === photos.length) return photos;
    rest.splice(Math.max(0, Math.min(to, rest.length)), 0, src);
    return rest;
  });
  refresh();
}

/* Variants — product_options + option_values. Prices are changes relative to the default value. */

export type VariantInput = {
  key?: string;
  name: Localized<string>;
  spec: "size" | "tier" | null;
  values: { key?: string; label: Localized<string>; priceDelta: number; isDefault: boolean }[];
};

/** URL-safe key from an English label, unique among `taken`: "500 g" → "500-g". */
function keyFrom(label: string, taken: Set<string>, fallback: string) {
  const base = label.toLowerCase().normalize("NFKD").replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "") || fallback;
  let k = base;
  for (let i = 2; taken.has(k); i++) k = `${base}-${i}`;
  taken.add(k);
  return k;
}

export async function saveVariants(productId: string, options: VariantInput[]): Promise<ActionResult> {
  requireAdmin();
  const product = readTable("products").find((p) => p.id === productId);
  if (!product) return { ok: false, message: "This product no longer exists." };

  for (const o of options) {
    if (!o.name.en.trim() || !o.name.mn.trim()) return { ok: false, message: "Give every option a name in English and Mongolian." };
    if (o.values.length === 0) return { ok: false, message: `Add at least one value to “${o.name.en}”, or remove the option.` };
    for (const v of o.values) {
      if (!v.label.en.trim() || !v.label.mn.trim()) return { ok: false, message: `Give every value of “${o.name.en}” a label in both languages.` };
      if (!Number.isInteger(v.priceDelta)) return { ok: false, message: "Price changes must be whole numbers." };
    }
  }

  const optionKeys = new Set<string>();
  const optionRows: ReturnType<typeof readTable<"product_options">> = [];
  const valueRows: ReturnType<typeof readTable<"option_values">> = [];
  options.forEach((o, i) => {
    const key = o.key && !optionKeys.has(o.key) ? (optionKeys.add(o.key), o.key) : keyFrom(o.name.en, optionKeys, `option-${i + 1}`);
    const optionId = `${productId}.${key}`;
    optionRows.push({ id: optionId, productId, key, position: i, name: trimLoc(o.name), spec: o.spec });
    // Exactly one default; its price change becomes 0 and the others shift with it.
    const def = Math.max(0, o.values.findIndex((v) => v.isDefault));
    const shift = o.values[def].priceDelta;
    const valueKeys = new Set<string>();
    o.values.forEach((v, j) => {
      const vk = v.key && !valueKeys.has(v.key) ? (valueKeys.add(v.key), v.key) : keyFrom(v.label.en, valueKeys, `value-${j + 1}`);
      valueRows.push({ id: `${optionId}.${vk}`, optionId, key: vk, position: j, label: trimLoc(v.label), priceDelta: v.priceDelta - shift, isDefault: j === def });
    });
  });

  // No combination may cost 0 or less.
  const cheapest = product.price + optionRows.reduce((n, o) => n + Math.min(...valueRows.filter((v) => v.optionId === o.id).map((v) => v.priceDelta)), 0);
  if (cheapest <= 0) return { ok: false, message: "Some combinations would cost ₮0 or less. Lower the discounts on the values." };

  const oldIds = new Set(readTable("product_options").filter((o) => o.productId === productId).map((o) => o.id));
  updateTable("product_options", (rows) => [...rows.filter((o) => o.productId !== productId), ...optionRows]);
  updateTable("option_values", (rows) => [...rows.filter((v) => !oldIds.has(v.optionId)), ...valueRows]);
  refresh();
  return { ok: true, message: "Variants saved" };
}

const trimLoc = (l: Localized<string>) => ({ en: l.en.trim(), mn: l.mn.trim() });

/* Gift sets — sets + set_items. null removes the set (the product stays as a normal product). */

export type SetInput = {
  group: SetGroup;
  savings: number | null;
  highlight: Localized<string>;
  items: { artProductId: string; qty: number; text: Localized<{ name: string; spec: string }> }[];
} | null;

export async function saveSet(productId: string, input: SetInput): Promise<ActionResult> {
  requireAdmin();
  const products = new Set(readTable("products").map((p) => p.id));
  if (!products.has(productId)) return { ok: false, message: "This product no longer exists." };

  if (input) {
    if (input.items.length === 0) return { ok: false, message: "Add at least one item to the set." };
    for (const it of input.items) {
      if (!it.text.en.name.trim() || !it.text.mn.name.trim()) return { ok: false, message: "Name every item in English and Mongolian." };
      if (!Number.isInteger(it.qty) || it.qty < 1) return { ok: false, message: "Item quantities must be 1 or more." };
      if (!products.has(it.artProductId)) return { ok: false, message: "Pick a picture for every item." };
    }
    if (input.savings !== null && (!Number.isInteger(input.savings) || input.savings < 0)) return { ok: false, message: "Savings must be a whole number of 0 or more." };
  }

  updateTable("sets", (rows) => [
    ...rows.filter((s) => s.productId !== productId),
    ...(input ? [{ productId, group: input.group, savings: input.savings || null, highlight: trimLoc(input.highlight) }] : []),
  ]);
  updateTable("set_items", (rows) => [
    ...rows.filter((x) => x.setId !== productId),
    ...(input?.items ?? []).map((it, i) => ({
      id: `${productId}.${i}`,
      setId: productId,
      position: i,
      artProductId: it.artProductId,
      qty: it.qty,
      text: { en: { name: it.text.en.name.trim(), spec: it.text.en.spec.trim() }, mn: { name: it.text.mn.name.trim(), spec: it.text.mn.spec.trim() } },
    })),
  ]);
  // A product that stops being a set can't stay in a collection as a "set".
  if (!input) updateTable("collection_items", (rows) => rows.map((r) => (r.itemId === productId && r.kind === "set" ? { ...r, kind: "product" } : r)));
  refresh();
  return { ok: true, message: input ? "Set saved" : "No longer a set" };
}

/* Archive and delete */

export async function setProductStatus(id: string, status: ProductStatus) {
  requireAdmin();
  updateTable("products", (rows) => rows.map((p) => (p.id === id ? { ...p, status } : p)));
  refresh();
}

/** Deletes a product nobody depends on. Products with orders must be archived instead. */
export async function deleteProduct(id: string): Promise<ActionResult> {
  requireAdmin();
  const product = readTable("products").find((p) => p.id === id);
  if (!product) return { ok: false, message: "This product no longer exists." };
  const orders = new Set(readTable("order_items").filter((it) => it.productId === id).map((it) => it.orderId));
  if (orders.size) return { ok: false, message: `It’s in ${orders.size} ${orders.size === 1 ? "order" : "orders"} (#${[...orders].join(", #")}), so it can’t be deleted. Archive it instead.` };
  const usedBy = readTable("set_items").filter((x) => x.artProductId === id && x.setId !== id);
  if (usedBy.length) return { ok: false, message: `Its picture is used inside the set ${usedBy[0].setId}. Change that set first, or archive this product.` };

  const optionIds = new Set(readTable("product_options").filter((o) => o.productId === id).map((o) => o.id));
  updateTable("option_values", (rows) => rows.filter((v) => !optionIds.has(v.optionId)));
  updateTable("product_options", (rows) => rows.filter((o) => o.productId !== id));
  updateTable("set_items", (rows) => rows.filter((x) => x.setId !== id));
  updateTable("sets", (rows) => rows.filter((s) => s.productId !== id));
  updateTable("collection_items", (rows) => rows.filter((r) => r.itemId !== id).map((r, _i, all) => ({ ...r, position: all.filter((x) => x.collectionId === r.collectionId).indexOf(r) })));
  updateTable("products", (rows) => rows.filter((p) => p.id !== id));
  for (const src of product.photos) {
    if (!src.startsWith("/uploads/products/")) continue;
    try {
      unlinkSync(path.join(PHOTO_DIR, path.basename(src)));
    } catch {
      // already gone
    }
  }
  redirect("/admin/products");
}

/* Orders */

export async function setOrderStatus(id: string, status: OrderStatus) {
  requireAdmin();
  if (!STATUSES.includes(status)) return;
  updateTable("orders", (rows) => rows.map((o) => (o.id === id ? { ...o, status } : o)));
  refresh();
}

/* Collections */

export async function saveCollection(id: string, items: { kind: CollectionItemKind; itemId: string }[]): Promise<ActionResult> {
  requireAdmin();
  const products = new Set(readTable("products").map((p) => p.id));
  const sets = new Set(readTable("sets").map((s) => s.productId));
  const valid = items.filter((x) => (x.kind === "set" ? sets.has(x.itemId) : products.has(x.itemId)));
  updateTable("collection_items", (rows) => [
    ...rows.filter((r) => r.collectionId !== id),
    ...valid.map((x, i) => ({ id: `${id}.${i}`, collectionId: id, position: i, kind: x.kind, itemId: x.itemId })),
  ]);
  refresh();
  return { ok: true, message: "Collection saved" };
}
