"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui";
import type { OrderStatus } from "@/db/models";
import { setOrderStatus } from "../actions";

const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  preparing: { to: "ready", label: "Mark ready" },
  ready: { to: "completed", label: "Mark picked up" },
};

/** The one next step for an order. Completed orders have none. */
export function StatusButton({ id, status }: { id: string; status: OrderStatus }) {
  const [pending, start] = useTransition();
  const next = NEXT[status];
  if (!next) return null;
  return (
    <Button size="sm" variant={status === "preparing" ? "primary" : "secondary"} disabled={pending} onClick={() => start(() => setOrderStatus(id, next.to))}>
      {pending ? "Saving…" : next.label}
    </Button>
  );
}
