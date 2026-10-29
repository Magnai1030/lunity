"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Badge, Icon, Thumb, cx } from "@/components/ui";
import type { ProductRow } from "@/db/models";
import { updateProductQuick } from "../actions";
import { mnt } from "../format";
import s from "../admin.module.css";

type Patch = Parameters<typeof updateProductQuick>[1];

/** One product in the list: price and stock save on blur or Enter; Top and New toggle instantly. */
export function ProductRowEditor({ product: p, brand, isSet, low }: { product: ProductRow; brand: string; isSet: boolean; low: boolean }) {
  const [pending, start] = useTransition();
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  const save = (patch: Patch) =>
    start(async () => {
      const r = await updateProductQuick(p.id, patch);
      setNote({ ok: r.ok, text: r.message });
      if (r.ok) setTimeout(() => setNote(null), 1800);
    });

  const commitNumber = (key: "price" | "stock", raw: string, current: number | null) => {
    const v = raw.replace(/[\s,₮]/g, "");
    if (key === "stock" && v === "") return current === null ? undefined : save({ stock: null });
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0) return setNote({ ok: false, text: "Whole numbers only" });
    if (n !== current) save({ [key]: n });
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
  };

  return (
    <li className={cx(s.productRow, pending && s.busy, p.status === "archived" && s.archivedRow)}>
      <Link href={`/admin/products/${p.id}`} className={s.productId}>
        <Thumb art={p.id} photo={p.photos[0]} size={48} />
        <span className={s.productText}>
          <span className={s.titleLine}>
            <span className="body-strong">{p.text.en.title}</span>
            {p.status === "archived" && <Badge>Archived</Badge>}
            {p.salePrice !== null && <Badge tone="error">Sale {mnt(p.salePrice)}</Badge>}
          </span>
          <span className="small muted">
            {p.sku} · {brand}
            {isSet && " · Set"}
          </span>
        </span>
      </Link>

      <label className={s.inlineField}>
        <span className="small muted">Price</span>
        <span className={s.inlineInput}>
          <span className="muted">₮</span>
          <input inputMode="numeric" defaultValue={p.price} onBlur={(e) => commitNumber("price", e.target.value, p.price)} onKeyDown={onKey} aria-label={`Price of ${p.text.en.title}`} />
        </span>
      </label>

      <label className={s.inlineField}>
        <span className="small muted">Stock {low && <Badge tone="warn">Low</Badge>}</span>
        <span className={s.inlineInput}>
          <input inputMode="numeric" defaultValue={p.stock ?? ""} placeholder="Not tracked" onBlur={(e) => commitNumber("stock", e.target.value, p.stock)} onKeyDown={onKey} aria-label={`Stock of ${p.text.en.title}`} />
        </span>
      </label>

      <div className={s.flags}>
        <button type="button" className={cx(s.flag, p.isTop && s.flagOn)} aria-pressed={p.isTop} onClick={() => save({ isTop: !p.isTop })}>
          Top
        </button>
        <button type="button" className={cx(s.flag, p.isNew && s.flagOn)} aria-pressed={p.isNew} onClick={() => save({ isNew: !p.isNew })}>
          New
        </button>
      </div>

      <span className={cx("small", s.rowNote, note && !note.ok && s.rowNoteError)} aria-live="polite">
        {note ? (
          <>
            <Icon name={note.ok ? "check" : "alert"} size={14} />
            {note.text}
          </>
        ) : null}
      </span>
    </li>
  );
}
