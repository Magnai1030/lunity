"use server";

import type { OrderItemRow, OrderRow, PaymentMethod } from "@/db/models";
import { readTable, updateTable } from "@/db/store";

export type PlaceOrderInput = {
  lines: { id: string; qty: number; sel?: Record<string, string> }[];
  phone: string;
  city: string;
  district: string;
  street: string;
  note: string;
  payment: PaymentMethod;
  /** Demo sign-in: orders from a signed-in shopper belong to the demo account. */
  signedIn: boolean;
};

/** Error codes the checkout turns into localized messages. */
export type PlaceOrderError = "closed" | "invalid" | "empty" | "unavailable";
export type PlaceOrderResult = { ok: true; id: string; readyBy: string } | { ok: false; error: PlaceOrderError };

const PAYMENTS: PaymentMethod[] = ["qpay", "socialpay", "card", "bank"];
const MAX_QTY = 10;

/**
 * Places an order into the JSON tables. Prices, sale, variant labels and delivery date are all
 * recomputed here from current data; the browser only says what and how many.
 * Like the admin, this writes files, so it only runs in development until the backend exists.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (process.env.NODE_ENV === "production") return { ok: false, error: "closed" };

  const phone = input.phone.replace(/\D/g, "");
  if (phone.length !== 8 || !input.city.trim() || !input.district.trim() || !input.street.trim() || !PAYMENTS.includes(input.payment))
    return { ok: false, error: "invalid" };
  if (!input.lines.length) return { ok: false, error: "empty" };

  const products = readTable("products");
  const options = readTable("product_options").sort((a, b) => a.position - b.position);
  const values = readTable("option_values");
  const settings = readTable("settings")[0];
  const today = new Date().toLocaleDateString("sv");

  const priced = [];
  for (const line of input.lines) {
    const p = products.find((x) => x.id === line.id);
    const qty = Math.trunc(line.qty);
    if (!p || p.status !== "active" || qty < 1 || qty > MAX_QTY) return { ok: false, error: "unavailable" };

    // Each option: the chosen value, or the default. Price changes are relative to the default.
    const chosen = options
      .filter((o) => o.productId === p.id)
      .map((o) => {
        const vs = values.filter((v) => v.optionId === o.id);
        const def = vs.find((v) => v.isDefault) ?? vs[0];
        return { option: o, value: vs.find((v) => v.key === line.sel?.[o.key]) ?? def, def };
      });
    const delta = chosen.reduce((n, c) => n + c.value.priceDelta - c.def.priceDelta, 0);
    const onSale = p.salePrice !== null && p.salePrice < p.price && (!p.saleEndsAt || today <= p.saleEndsAt);

    priced.push({
      product: p,
      qty,
      selection: Object.fromEntries(chosen.map((c) => [c.option.key, c.value.key])),
      variant: chosen.length ? { en: chosen.map((c) => c.value.label.en).join(" · "), mn: chosen.map((c) => c.value.label.mn).join(" · ") } : null,
      unitPrice: (onSale ? p.salePrice! : p.price) + delta,
      regularUnitPrice: p.price + delta,
    });
  }

  // Same rule as the storefront: stock that covers the order ships in the usual time, otherwise
  // the supplier time. Quantities of one product add up across its variants.
  const perProduct = new Map<string, number>();
  for (const l of priced) perProduct.set(l.product.id, (perProduct.get(l.product.id) ?? 0) + l.qty);
  const days = Math.max(
    settings.deliveryDays,
    ...[...perProduct].map(([id, qty]) => {
      const stock = products.find((p) => p.id === id)!.stock;
      return stock === null || stock >= qty ? settings.deliveryDays : settings.backorderDays;
    }),
  );
  const ready = new Date(`${today}T00:00:00`);
  ready.setDate(ready.getDate() + days);
  const readyBy = ready.toLocaleDateString("sv");

  const orders = readTable("orders");
  const id = String(Math.max(0, ...orders.map((o) => Number(o.id) || 0)) + 1).padStart(4, "0");
  const order: OrderRow = {
    id,
    userId: input.signedIn ? (readTable("users")[0]?.id ?? null) : null,
    placedAt: today,
    readyBy,
    status: "preparing",
    address: [input.street, input.district, input.city].map((x) => x.trim()).join(", "),
    contactPhone: `+976 ${phone.slice(0, 4)} ${phone.slice(4)}`,
    shippingFee: settings.shippingFee,
    paymentMethod: input.payment,
    note: input.note.trim(),
  };
  const items: OrderItemRow[] = priced.map((l, i) => ({
    id: `${id}.${i}`,
    orderId: id,
    productId: l.product.id,
    qty: l.qty,
    selection: l.selection,
    variant: l.variant,
    unitPrice: l.unitPrice,
    regularUnitPrice: l.regularUnitPrice,
  }));

  updateTable("orders", (rows) => [...rows, order]);
  updateTable("order_items", (rows) => [...rows, ...items]);
  // Sold units leave tracked stock; it never goes below 0 (the rest comes from the supplier).
  updateTable("products", (rows) => rows.map((p) => (perProduct.has(p.id) && p.stock !== null ? { ...p, stock: Math.max(0, p.stock - perProduct.get(p.id)!) } : p)));

  return { ok: true, id, readyBy };
}
