"use client";

import { useState, useTransition } from "react";
import { IconButton, Thumb } from "@/components/ui";
import type { SetGroup } from "@/db/models";
import { saveSet, type ActionResult, type SetInput } from "../../actions";
import { Card, SaveBar, useSaveSlot } from "../../AdminForm";
import s from "../../admin.module.css";

type Item = { uid: number; artProductId: string; qty: string; en: { name: string; spec: string }; mn: { name: string; spec: string } };
type State = { group: SetGroup; savings: string; highlight: { en: string; mn: string }; items: Item[] };
export type ArtChoice = { id: string; title: string; photo?: string };

let uid = 0;
const GROUPS: { id: SetGroup; label: string }[] = [
  { id: "food", label: "Food & table" },
  { id: "home", label: "Home & tea" },
  { id: "wear", label: "Cashmere & felt" },
];

type SetData = NonNullable<SetInput>;

function toState(initial: SetData): State {
  return {
    group: initial?.group ?? "food",
    savings: initial?.savings ? String(initial.savings) : "",
    highlight: initial?.highlight ?? { en: "", mn: "" },
    items: (initial?.items ?? []).map((it) => ({ uid: ++uid, artProductId: it.artProductId, qty: String(it.qty), en: it.text.en, mn: it.text.mn })),
  };
}

function toInput(st: State): SetData {
  return {
    group: st.group,
    savings: st.savings.trim() ? Math.trunc(Number(st.savings.replace(/[\s,₮]/g, ""))) : null,
    highlight: st.highlight,
    items: st.items.map((it) => ({ artProductId: it.artProductId, qty: Math.trunc(Number(it.qty)) || 0, text: { en: it.en, mn: it.mn } })),
  };
}

/** What's inside a gift set, plus how it's presented on Sets & kits. */
export function SetEditor({ productId, initial, choices }: { productId: string; initial: SetData; choices: ArtChoice[] }) {
  const [baseline, setBaseline] = useState(() => toState(initial));
  const [st, setSt] = useState<State>(baseline);
  const [result, setResult] = useState<ActionResult>(null);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(toInput(st)) !== JSON.stringify(toInput(baseline));
  const set = (patch: Partial<State>) => setSt((x) => ({ ...x, ...patch }));
  const setItem = (i: number, patch: Partial<Item>) => set({ items: st.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
  const choice = (id: string) => choices.find((c) => c.id === id);

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
    <Card title="What’s included" hint="Shown on the set’s page. The group and highlight are used on Sets & kits.">
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

          <ol className={s.collList}>
            {st.items.map((it, i) => (
              <li key={it.uid} className={s.setItem}>
                <div className={s.setItemHead}>
                  <Thumb art={it.artProductId} photo={choice(it.artProductId)?.photo} size={44} />
                  <label className={s.miniField}>
                    <span className="small muted">Picture from</span>
                    <select value={it.artProductId} onChange={(e) => setItem(i, { artProductId: e.target.value })}>
                      {choices.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={s.miniField}>
                    <span className="small muted">Qty</span>
                    <input inputMode="numeric" value={it.qty} onChange={(e) => setItem(i, { qty: e.target.value })} className={s.qtyInput} />
                  </label>
                  <span className={s.varTools}>
                    <IconButton icon="chevron" label="Move item up" className={s.up} disabled={i === 0} onClick={() => set({ items: st.items.map((x, j) => (j === i - 1 ? st.items[i] : j === i ? st.items[i - 1] : x)) })} />
                    <IconButton icon="trash" label={`Remove item ${it.en.name || i + 1}`} onClick={() => set({ items: st.items.filter((_, j) => j !== i) })} />
                  </span>
                </div>
                <div className={s.grid2}>
                  <input aria-label="Item name in English" value={it.en.name} placeholder="Name · English (Brick tea)" onChange={(e) => setItem(i, { en: { ...it.en, name: e.target.value } })} />
                  <input aria-label="Item name in Mongolian" lang="mn" value={it.mn.name} placeholder="Нэр · Монгол (Шахмал цай)" onChange={(e) => setItem(i, { mn: { ...it.mn, name: e.target.value } })} />
                  <input aria-label="Item detail in English" value={it.en.spec} placeholder="Detail · English (1 kg)" onChange={(e) => setItem(i, { en: { ...it.en, spec: e.target.value } })} />
                  <input aria-label="Item detail in Mongolian" lang="mn" value={it.mn.spec} placeholder="Дэлгэрэнгүй · Монгол (1 кг)" onChange={(e) => setItem(i, { mn: { ...it.mn, spec: e.target.value } })} />
                </div>
              </li>
            ))}
          </ol>
          <button
            type="button"
            className={s.linkBtn}
            onClick={() => set({ items: [...st.items, { uid: ++uid, artProductId: productId, qty: "1", en: { name: "", spec: "" }, mn: { name: "", spec: "" } }] })}
          >
            + Add item
          </button>

      {!inScope && <SaveBar dirty={dirty} pending={pending} result={result} onSave={save} onDiscard={discard} onDone={() => setResult(null)} />}
    </Card>
  );
}
