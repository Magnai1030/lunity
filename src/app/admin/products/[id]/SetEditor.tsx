"use client";

import { useState, useTransition } from "react";
import { IconButton, Thumb } from "@/components/ui";
import type { SetGroup } from "@/db/models";
import { saveSet, type ActionResult, type SetInput } from "../../actions";
import { Card, SaveBar, useSaveSlot } from "../../AdminForm";
import { ProductPicker } from "../../Pickers";
import s from "../../admin.module.css";

/** A product a set can contain, with its variants. */
export type CatalogItem = {
  id: string;
  title: string;
  sku: string;
  photo?: string;
  options: { key: string; name: string; values: { key: string; label: string; isDefault: boolean }[] }[];
};

type SetData = NonNullable<SetInput>;
type Item = SetData["items"][number] & { uid: number };
type State = { group: SetGroup; savings: string; highlight: { en: string; mn: string }; items: Item[] };

let uid = 0;
const GROUPS: { id: SetGroup; label: string }[] = [
  { id: "food", label: "Food & table" },
  { id: "home", label: "Home & tea" },
  { id: "wear", label: "Cashmere & felt" },
];

const toState = (d: SetData): State => ({
  group: d.group,
  savings: d.savings ? String(d.savings) : "",
  highlight: d.highlight,
  items: d.items.map((it) => ({ ...it, uid: ++uid })),
});

const toInput = (st: State): SetData => ({
  group: st.group,
  savings: st.savings.trim() ? Math.trunc(Number(st.savings.replace(/[\s,₮]/g, ""))) : null,
  highlight: st.highlight,
  items: st.items.map((it) => ({ productId: it.productId, qty: Math.max(1, Math.trunc(it.qty) || 1), selection: it.selection, note: it.note })),
});

/**
 * What's inside a set: pick products, choose each one's variant and quantity. Names, details and
 * pictures come from the products; a note covers what a variant can't say.
 */
export function SetEditor({ productId, initial, catalog }: { productId: string; initial: SetData; catalog: CatalogItem[] }) {
  const [baseline, setBaseline] = useState(() => toState(initial));
  const [st, setSt] = useState<State>(baseline);
  const [result, setResult] = useState<ActionResult>(null);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(toInput(st)) !== JSON.stringify(toInput(baseline));
  const set = (patch: Partial<State>) => setSt((x) => ({ ...x, ...patch }));
  const setItem = (i: number, patch: Partial<Item>) => set({ items: st.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
  const find = (id: string) => catalog.find((c) => c.id === id);

  const saveNow = async () => {
    const r = await saveSet(productId, toInput(st));
    if (r?.ok) setBaseline(st);
    return r;
  };
  const discard = () => {
    setSt(baseline);
    setResult(null);
  };
  const inScope = useSaveSlot({ dirty, save: saveNow, discard });
  const save = () => start(async () => setResult(await saveNow()));

  return (
    <Card title="What’s included" hint="Pick the products inside this set. Their names and pictures show on the set’s page.">
      {st.items.length === 0 ? (
        <p className="small muted">Nothing inside yet. Add the first product below.</p>
      ) : (
        <ol className={s.collList}>
          {st.items.map((it, i) => {
            const p = find(it.productId);
            return (
              <li key={it.uid} className={s.setItem}>
                <div className={s.setItemHead}>
                  <Thumb art={it.productId} photo={p?.photo} size={44} />
                  <span className={s.productText}>
                    <span className="body-strong">{p?.title ?? it.productId}</span>
                    <span className="small muted">{it.productId === productId ? "This set’s own item" : p?.sku}</span>
                  </span>
                  <label className={s.qtyField}>
                    <span className="small muted">Qty</span>
                    <input
                      inputMode="numeric"
                      value={it.qty || ""}
                      onChange={(e) => setItem(i, { qty: Math.trunc(Number(e.target.value.replace(/\D/g, ""))) })}
                      aria-label={`Quantity of ${p?.title ?? it.productId}`}
                    />
                  </label>
                  <span className={s.varTools}>
                    <IconButton icon="chevron" label="Move up" className={s.up} disabled={i === 0} onClick={() => set({ items: st.items.map((x, j) => (j === i - 1 ? st.items[i] : j === i ? st.items[i - 1] : x)) })} />
                    <IconButton icon="trash" label={`Remove ${p?.title ?? it.productId}`} onClick={() => set({ items: st.items.filter((_, j) => j !== i) })} />
                  </span>
                </div>

                {p && p.options.length > 0 && (
                  <div className={s.setVariants}>
                    {p.options.map((o) => (
                      <label key={o.key} className={s.miniField}>
                        <span className="small muted">{o.name}</span>
                        <select
                          value={it.selection[o.key] ?? o.values.find((v) => v.isDefault)?.key ?? ""}
                          onChange={(e) => setItem(i, { selection: { ...it.selection, [o.key]: e.target.value } })}
                        >
                          {o.values.map((v) => (
                            <option key={v.key} value={v.key}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                )}

                {it.note ? (
                  <div className={s.setNote}>
                    <input aria-label="Note in English" value={it.note.en} placeholder="Note · English (Plain, sweet, berry)" onChange={(e) => setItem(i, { note: { ...it.note!, en: e.target.value } })} />
                    <input aria-label="Note in Mongolian" lang="mn" value={it.note.mn} placeholder="Тэмдэглэл · Монгол" onChange={(e) => setItem(i, { note: { ...it.note!, mn: e.target.value } })} />
                    <button type="button" className={s.linkBtn} onClick={() => setItem(i, { note: null })}>
                      Remove note
                    </button>
                  </div>
                ) : (
                  <button type="button" className={s.linkBtn} onClick={() => setItem(i, { note: { en: "", mn: "" } })}>
                    + Add note
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <ProductPicker
        label="Add a product"
        placeholder="Choose a product to put inside"
        items={catalog.map((c) => ({ id: c.id, title: c.id === productId ? `${c.title} (this set)` : c.title, meta: c.options.length ? `${c.sku} · ${c.options.map((o) => o.name).join(", ")}` : c.sku, photo: c.photo }))}
        onPick={(id) => set({ items: [...st.items, { uid: ++uid, productId: id, qty: 1, selection: {}, note: null }] })}
      />

      <div className={s.grid2}>
        <label className={s.miniField}>
          <span className="small muted">Group on Sets & kits</span>
          <select value={st.group} onChange={(e) => set({ group: e.target.value as SetGroup })}>
            {GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
        <label className={s.miniField}>
          <span className="small muted">Saves vs buying separately (₮, optional)</span>
          <input inputMode="numeric" value={st.savings} placeholder="25000" onChange={(e) => set({ savings: e.target.value })} />
        </label>
        <label className={s.miniField}>
          <span className="small muted">Highlight · English</span>
          <input value={st.highlight.en} placeholder="Ul boov + aaruul + tea" onChange={(e) => set({ highlight: { ...st.highlight, en: e.target.value } })} />
        </label>
        <label className={s.miniField}>
          <span className="small muted">Highlight · Монгол</span>
          <input lang="mn" value={st.highlight.mn} placeholder="Ул боов + ааруул + цай" onChange={(e) => set({ highlight: { ...st.highlight, mn: e.target.value } })} />
        </label>
      </div>

      {!inScope && <SaveBar dirty={dirty} pending={pending} result={result} onSave={save} onDiscard={discard} onDone={() => setResult(null)} />}
    </Card>
  );
}
