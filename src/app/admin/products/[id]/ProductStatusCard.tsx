"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import type { ProductStatus } from "@/db/models";
import { deleteProduct, setProductStatus } from "../../actions";
import { Card } from "../../AdminForm";
import s from "../../admin.module.css";

/** Archive (hide, keep history) or delete (only when no order uses it). Delete asks once more inline. */
export function ProductStatusCard({ id, status, orderCount }: { id: string; status: ProductStatus; orderCount: number }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const archived = status === "archived";

  return (
    <Card
      title={archived ? "Archived" : "Archive or delete"}
      hint={
        archived
          ? "Hidden from the store and removed from carts. Old orders still show it."
          : "Archive hides it from the store but keeps it for order history. Delete removes it for good."
      }
    >
      <div className={s.dangerRow}>
        <Button type="button" variant="secondary" disabled={pending} onClick={() => start(() => setProductStatus(id, archived ? "active" : "archived"))}>
          {archived ? "Show in store again" : "Archive"}
        </Button>

        {orderCount > 0 ? (
          <span className="small muted">
            In {orderCount} {orderCount === 1 ? "order" : "orders"}, so it can only be archived.
          </span>
        ) : confirming ? (
          <span className={s.confirm}>
            <span className="small">Delete this product, its photos and variants?</span>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await deleteProduct(id);
                  if (r && !r.ok) setError(r.message);
                })
              }
            >
              {pending ? "Deleting…" : "Yes, delete"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </span>
        ) : (
          <Button type="button" variant="danger" disabled={pending} onClick={() => setConfirming(true)}>
            Delete
          </Button>
        )}
      </div>
      {error && <p className={`small ${s.rowNoteError}`}>{error}</p>}
    </Card>
  );
}
