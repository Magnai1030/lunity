/**
 * Table schema for the mock database in ./data. Each type is one row of the JSON file
 * with the same name. Ids are strings; `*Id` fields are foreign keys.
 * Mirror these when the real database schema is written.
 */

export type Lang = "en" | "mn";
/** Translated column — one value per language (a jsonb column, or a translations table). */
export type Localized<T> = Record<Lang, T>;

/** recipients.id */
export type Recipient = string;
export type Tier = "classic" | "premium";
export type SetGroup = "food" | "home" | "wear";
export type OrderStatus = "preparing" | "ready" | "completed";
export type PaymentMethod = "qpay" | "socialpay" | "card" | "bank";
export type CollectionItemKind = "product" | "set";
/** archived: hidden from the store, kept for order history. */
export type ProductStatus = "active" | "archived";

/** recipients.json — who a gift is for (dad, mom, kids…). Products list the ids they suit. */
export type RecipientRow = {
  id: string;
  position: number;
  name: Localized<string>;
  /** One line under the name, e.g. "Tea, a fine bowl and warm cashmere." */
  line: Localized<string>;
  /** Longer advice shown in the gift guide. */
  intro: Localized<string>;
};

/**
 * categories.json — a tree up to 3 levels deep (parentId null = top level). Choosing a category
 * in the store includes everything beneath it.
 */
export type CategoryRow = {
  /** Also the URL value: /search?cat=<id>. */
  id: string;
  parentId: CategoryRow["id"] | null;
  /** Order among siblings. */
  position: number;
  name: Localized<string>;
  /** Icon in the mobile menu (an Icon name); null = default. */
  icon: string | null;
  /** Listed in the header and menu. Only top-level categories appear there. */
  showInMenu: boolean;
};
export const MAX_CATEGORY_DEPTH = 3;

/** brands.json */
export type BrandRow = {
  id: string;
  name: string;
  text: Localized<{ tag: string; about: string }>;
};

/** products.json */
export type ProductRow = {
  id: string;
  status: ProductStatus;
  /** Display number, e.g. "N° 001". */
  sku: string;
  brandId: BrandRow["id"];
  categoryId: CategoryRow["id"];
  /** recipients.id values this product suits. */
  recipients: RecipientRow["id"][];
  tier: Tier | null;
  /** Regular price in MNT, for the default option values. */
  price: number;
  /** Lower price while on sale; null = not on sale. Option price changes apply on top. */
  salePrice: number | null;
  /** Last day of the sale (ISO date, inclusive); null = until turned off. */
  saleEndsAt: string | null;
  /**
   * Units on hand; null = not tracked (always available). Running out never blocks a sale —
   * the order is sourced from the supplier and takes settings.backorderDays instead.
   */
  stock: number | null;
  isTop: boolean;
  isNew: boolean;
  text: Localized<{ title: string; size: string; note: string }>;
  /** Product photo URLs. Empty means the gallery uses drawn views. */
  photos: string[];
};

/** product_options.json — a choosable attribute of a product (size, colour, edition). */
export type ProductOptionRow = {
  /** `${productId}.${key}` */
  id: string;
  productId: ProductRow["id"];
  key: string;
  position: number;
  name: Localized<string>;
  /** Which spec row the chosen value replaces on the detail page. */
  spec: "size" | "tier" | null;
};

/** option_values.json */
export type OptionValueRow = {
  /** `${optionId}.${key}` */
  id: string;
  optionId: ProductOptionRow["id"];
  key: string;
  position: number;
  label: Localized<string>;
  /** Price change vs. the default value of this option. */
  priceDelta: number;
  /** Exactly one value per option is the default; it matches the catalog price. */
  isDefault: boolean;
};

/** sets.json — products sold as bundles. One-to-one with products. */
export type SetRow = {
  productId: ProductRow["id"];
  group: SetGroup;
  /** MNT saved vs. buying the contents separately. */
  savings: number | null;
  highlight: Localized<string>;
};

/**
 * set_items.json — what's inside a set: a product, which variant of it, and how many.
 * Name, detail and picture come from the product; `note` replaces the detail when the
 * variant alone doesn't say it (e.g. "Plain, sweet, berry").
 */
export type SetItemRow = {
  id: string;
  setId: SetRow["productId"];
  position: number;
  productId: ProductRow["id"];
  qty: number;
  /** Chosen value key per option key (product_options.key → option_values.key); missing = default. */
  selection: Record<string, string>;
  note: Localized<string> | null;
};

/** collections.json — a named, ordered list of products and sets (home hero, teasers, campaigns). */
export type CollectionRow = {
  id: string;
  /** Internal name for whoever curates it; pages use their own headings. */
  name: Localized<string>;
};

/** collection_items.json */
export type CollectionItemRow = {
  id: string;
  collectionId: CollectionRow["id"];
  position: number;
  kind: CollectionItemKind;
  /** products.id for "product", sets.productId for "set". */
  itemId: string;
};

/** settings.json — a single row of store-wide values. */
export type SettingsRow = {
  id: "store";
  contactEmail: string;
  contactPhone: string;
  /** Days from order to delivery when stock covers it; fills `{days}` in general copy. */
  deliveryDays: number;
  /** Days when stock doesn't cover the order and it's sourced from the supplier. */
  backorderDays: number;
  /** Admin flags tracked products at or below this many units as low stock. */
  lowStockThreshold: number;
  /** MNT per order. 0 shows as "Free". */
  shippingFee: number;
  /** How long a payment QR code stays valid. */
  qrPaymentSeconds: number;
  /** Prefilled city on the checkout form. */
  defaultCity: string;
};

/** users.json */
export type UserRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

/** orders.json */
export type OrderRow = {
  id: string;
  /** null = guest checkout. */
  userId: UserRow["id"] | null;
  /** ISO date. */
  placedAt: string;
  /** ISO date. */
  readyBy: string;
  /** preparing → ready (out for delivery) → completed (delivered). Every order is delivered; there's no store pickup. */
  status: OrderStatus;
  address: string;
  /** Phone to reach the customer about this order. */
  contactPhone: string;
  /** MNT charged for shipping on this order. */
  shippingFee: number;
  /** How the customer chose to pay; null on orders from before it was recorded. */
  paymentMethod: PaymentMethod | null;
  /** Delivery note from checkout ("Call when outside"). */
  note: string;
};

/** order_items.json */
export type OrderItemRow = {
  id: string;
  orderId: OrderRow["id"];
  productId: ProductRow["id"];
  qty: number;
  /** Variant bought, as option key → value key (product_options.key → option_values.key). */
  selection: Record<string, string>;
  /** That variant's labels when ordered ("800 g · Premium"), kept even if variants change later; null = no variants. */
  variant: Localized<string> | null;
  /** Price paid per unit, sale included. */
  unitPrice: number;
  /** Regular price per unit for the same variant; above unitPrice when bought on sale. */
  regularUnitPrice: number;
};
