import type { ProductRow } from "@/db/models";
import { readTable } from "@/db/store";

/** Orders joined with customer, line items and totals, newest first. */
export function getOrders() {
  const users = readTable("users");
  const items = readTable("order_items");
  const products = readTable("products");
  return readTable("orders")
    .map((o) => {
      const lines = items
        .filter((it) => it.orderId === o.id)
        .map((it) => {
          const p = products.find((x) => x.id === it.productId);
          return { ...it, title: p?.text.en.title ?? it.productId, sku: p?.sku ?? "", photo: p?.photos[0] };
        });
      const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.qty, 0);
      const user = users.find((u) => u.id === o.userId);
      return {
        ...o,
        customer: user?.name ?? "Guest",
        customerEmail: user?.email ?? "",
        subtotal,
        lines,
        units: lines.reduce((n, l) => n + l.qty, 0),
        total: subtotal + o.shippingFee,
      };
    })
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
}
export type AdminOrder = ReturnType<typeof getOrders>[number];
export const getOrder = (id: string) => getOrders().find((o) => o.id === id);

export const getSettings = () => readTable("settings")[0];

/** Tracked products at or below the low-stock threshold. 0 still sells, via the supplier. */
export const isLowStock = (p: ProductRow, threshold: number) => p.stock !== null && p.stock <= threshold;
