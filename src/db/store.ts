/**
 * Server-side read/write access to the JSON tables, used by the admin.
 * Reads hit the disk every time, so admin pages always show the latest saved data.
 * Replace this file with real database queries when the backend exists; the admin only
 * calls readTable / writeTable / updateTable.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  BrandRow,
  CategoryRow,
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

type Tables = {
  brands: BrandRow;
  categories: CategoryRow;
  recipients: RecipientRow;
  products: ProductRow;
  product_options: ProductOptionRow;
  option_values: OptionValueRow;
  sets: SetRow;
  set_items: SetItemRow;
  users: UserRow;
  orders: OrderRow;
  order_items: OrderItemRow;
  collections: CollectionRow;
  collection_items: CollectionItemRow;
  settings: SettingsRow;
};
export type TableName = keyof Tables;

const file = (name: TableName) => path.join(process.cwd(), "src/db/data", `${name}.json`);

export function readTable<T extends TableName>(name: T): Tables[T][] {
  return JSON.parse(readFileSync(file(name), "utf8"));
}

/** Writes one row per line, matching the seed-file format so diffs stay readable. */
export function writeTable<T extends TableName>(name: T, rows: Tables[T][]) {
  writeFileSync(file(name), "[\n" + rows.map((r) => "  " + JSON.stringify(r)).join(",\n") + "\n]\n");
}

export function updateTable<T extends TableName>(name: T, fn: (rows: Tables[T][]) => Tables[T][]) {
  writeTable(name, fn(readTable(name)));
}
