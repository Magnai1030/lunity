"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import type { ProductStatus } from "@/db/models";
import { deleteProduct, setProductStatus } from "../../actions";
import { Card } from "../../AdminForm";
import { ConfirmDialog } from "../../ConfirmDialog";
import s from "../../admin.module.css";

/** Archive (hide, keep history) or delete (only when no order uses it). Delete asks first in a dialog. */
export function ProductStatusCard({ id, title, status, orderCount, photoCount, variantCount }: {
  id: string;
  title: string;
  status: ProductStatus;
  orderCount: number;
  photoCount: number;
  variantCount: number;
}) {
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
        ) : (
          <button type="button" className={`at-btn at-btn--secondary ${s.dangerOutline}`} disabled={pending} onClick={() => setConfirming(true)}>
            Delete
          </button>
        )}
      </div>
      <ConfirmDialog
        open={confirming}
        title={`Delete ${title}?`}
        confirmLabel="Delete product"
        pendingLabel="Deleting…"
        pending={pending}
        error={error}
        onCancel={() => {
          setConfirming(false);
          setError("");
        }}
        onConfirm={() =>
          start(async () => {
            const r = await deleteProduct(id);
            if (r && !r.ok) setError(r.message);
          })
        }
      >
        <p>It will be removed from the store for good, together with:</p>
        <ul>
          {photoCount > 0 && <li>{photoCount === 1 ? "its photo" : `its ${photoCount} photos`}</li>}
          {variantCount > 0 && <li>{variantCount === 1 ? "its variant option" : `its ${variantCount} variant options`}</li>}
          <li>its place in any home page collection</li>
        </ul>
        <p>This can’t be undone. To hide it but keep it, use Archive instead.</p>
      </ConfirmDialog>
    </Card>
  );
}
