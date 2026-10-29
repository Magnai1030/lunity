/**
 * Mock database: the JSON tables in ./data, typed by ./models.
 * Everything else reads data through lib/data.ts, so swapping this file for a real
 * database client is the only change needed there (plus making the reads async).
 */
import brands from "./data/brands.json";
import collectionItems from "./data/collection_items.json";
import collections from "./data/collections.json";
import optionValues from "./data/option_values.json";
import orderItems from "./data/order_items.json";
import orders from "./data/orders.json";
import productOptions from "./data/product_options.json";
import products from "./data/products.json";
import recipients from "./data/recipients.json";
import settings from "./data/settings.json";
import setItems from "./data/set_items.json";
import sets from "./data/sets.json";
import users from "./data/users.json";
import type {
  BrandRow,
  CollectionItemRow,
  CollectionRow,
  OptionValueRow,
  OrderItemRow,
  OrderRow,
  ProductOptionRow,
  ProductRow,
  RecipientRow,
  SetItemRow,
  SetRow,
  SettingsRow,
  UserRow,
} from "./models";

// JSON imports widen literal unions to string, so each table is asserted to its row type.
export const db = {
  brands: brands as BrandRow[],
  products: products as ProductRow[],
  recipients: recipients as RecipientRow[],
  productOptions: productOptions as ProductOptionRow[],
  optionValues: optionValues as OptionValueRow[],
  sets: sets as SetRow[],
  setItems: setItems as SetItemRow[],
  users: users as UserRow[],
  orders: orders as OrderRow[],
  orderItems: orderItems as OrderItemRow[],
  collections: collections as CollectionRow[],
  collectionItems: collectionItems as CollectionItemRow[],
  settings: settings as SettingsRow[],
};

export type * from "./models";
