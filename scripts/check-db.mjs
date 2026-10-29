// Integrity check for the mock database in src/db/data — the constraints a real
// database would enforce: unique ids, foreign keys, one default per option.
// Run with `npm run db:check`.
import { readFileSync } from "node:fs";

const dir = new URL("../src/db/data/", import.meta.url);
const table = (name) => JSON.parse(readFileSync(new URL(`${name}.json`, dir), "utf8"));

const t = Object.fromEntries(
  ["brands", "recipients", "products", "product_options", "option_values", "sets", "set_items", "users", "orders", "order_items", "collections", "collection_items", "settings"].map((n) => [n, table(n)]),
);

const errors = [];
const ids = (rows, key = "id") => new Set(rows.map((r) => r[key]));

function unique(name, key = "id") {
  const seen = new Set();
  for (const r of t[name]) {
    if (seen.has(r[key])) errors.push(`${name}: duplicate ${key} "${r[key]}"`);
    seen.add(r[key]);
  }
}

function ref(name, col, target, targetKey = "id", where = () => true) {
  const known = ids(t[target], targetKey);
  for (const r of t[name].filter(where)) {
    if (!known.has(r[col])) errors.push(`${name} ${r.id ?? r[col]}: ${col} "${r[col]}" not found in ${target}`);
  }
}

for (const name of Object.keys(t)) unique(name, name === "sets" ? "productId" : "id");

ref("products", "brandId", "brands");
ref("product_options", "productId", "products");
{
  const known = ids(t.recipients);
  for (const p of t.products) for (const r of p.recipients) if (!known.has(r)) errors.push(`products ${p.id}: recipient "${r}" not found in recipients`);
}
ref("option_values", "optionId", "product_options");
ref("sets", "productId", "products");
ref("set_items", "setId", "sets", "productId");
ref("set_items", "artProductId", "products");
ref("orders", "userId", "users");
ref("order_items", "orderId", "orders");
ref("order_items", "productId", "products");
ref("collection_items", "collectionId", "collections");
ref("collection_items", "itemId", "products", "id", (r) => r.kind === "product");
ref("collection_items", "itemId", "sets", "productId", (r) => r.kind === "set");

for (const o of t.product_options) {
  const defaults = t.option_values.filter((v) => v.optionId === o.id && v.isDefault).length;
  if (defaults !== 1) errors.push(`product_options ${o.id}: needs exactly one default value, has ${defaults}`);
}
for (const p of t.products) {
  if (!["active", "archived"].includes(p.status)) errors.push(`products ${p.id}: status must be "active" or "archived"`);
  if (p.salePrice !== null && !(Number.isInteger(p.salePrice) && p.salePrice > 0 && p.salePrice < p.price)) errors.push(`products ${p.id}: salePrice must be above 0 and below price`);
  if (p.saleEndsAt !== null && !/^\d{4}-\d{2}-\d{2}$/.test(p.saleEndsAt)) errors.push(`products ${p.id}: saleEndsAt must be YYYY-MM-DD or null`);
  if (p.stock !== null && !(Number.isInteger(p.stock) && p.stock >= 0)) errors.push(`products ${p.id}: stock must be null or a whole number ≥ 0, got ${p.stock}`);
}
if (t.settings.length !== 1) errors.push(`settings: expected 1 row, found ${t.settings.length}`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`db ok — ${Object.entries(t).map(([n, rows]) => `${n} ${rows.length}`).join(", ")}`);
