"use client";

import { useState, useTransition } from "react";
import { IconButton, Thumb } from "@/components/ui";
import type { CollectionItemKind } from "@/db/models";
import { saveCollection, type ActionResult } from "../actions";
import { Card, SaveBar, useSaveSlot } from "../AdminForm";
import { ProductPicker } from "../Pickers";
import s from "../admin.module.css";

type Item = { kind: CollectionItemKind; itemId: string };
export type Pickable = Item & { title: string; sku: string; photo?: string };

/** Ordered item list with move up/down, remove and add. Saves the whole order at once. */
export function CollectionEditor({ id, name, placement, initial, pickable }: { id: string; name: string; placement?: string; initial: Item[]; pickable: Pickable[] }) {
  const [items, setItems] = useState(initial);
  const [result, setResult] = useState<ActionResult>(null);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(items) !== JSON.stringify(initial);
  const find = (itemId: string) => pickable.find((p) => p.itemId === itemId);
  const available = pickable.filter((p) => !items.some((x) => x.itemId === p.itemId));

  const move = (i: number, by: -1 | 1) =>
    setItems((list) => {
      const next = [...list];
      [next[i], next[i + by]] = [next[i + by], next[i]];
      return next;
    });

  const saveNow = () => saveCollection(id, items);
  const discard = () => {
    setItems(initial);
    setResult(null);
  };
  const inScope = useSaveSlot({ dirty, save: saveNow, discard });
  const save = () => start(async () => setResult(await saveNow()));

  return (
    <Card title={name} hint={placement}>
      {items.length === 0 ? (
        <p className="small muted">Empty. This spot shows nothing until you add something.</p>
      ) : (
        <ol className={s.collList}>
          {items.map((x, i) => {
            const p = find(x.itemId);
            return (
              <li key={x.itemId} className={s.collItem}>
                <span className={s.collPos}>{i + 1}</span>
                <Thumb art={x.itemId} photo={p?.photo} size={40} />
                <span className={s.productText}>
                  <span className="body-strong">{p?.title ?? x.itemId}</span>
                  <span className="small muted">
                    {p?.sku} · {x.kind === "set" ? "Set" : "Product"}
                  </span>
                </span>
                <span className={s.collActions}>
                  <IconButton icon="chevron" label="Move up" className={s.up} onClick={() => move(i, -1)} disabled={i === 0} />
                  <IconButton icon="chevron" label="Move down" className={s.down} onClick={() => move(i, 1)} disabled={i === items.length - 1} />
                  <IconButton icon="trash" label={`Remove ${p?.title ?? x.itemId}`} onClick={() => setItems((list) => list.filter((_, j) => j !== i))} />
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {available.length > 0 && (
        <ProductPicker
          label={`Add to ${name}`}
          placeholder="Choose a product or set"
          items={available.map((p) => ({ id: p.itemId, title: p.title, meta: `${p.sku} · ${p.kind === "set" ? "Gift set" : "Product"}`, photo: p.photo }))}
          onPick={(id) => {
            const p = find(id);
            if (p) setItems((list) => [...list, { kind: p.kind, itemId: p.itemId }]);
          }}
        />
      )}

      {!inScope && <SaveBar dirty={dirty} pending={pending} result={result} onSave={save} onDiscard={discard} onDone={() => setResult(null)} />}
    </Card>
  );
}
