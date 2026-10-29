"use client";

import { useState, useTransition } from "react";
import { Button, IconButton } from "@/components/ui";
import { saveBrands, type ActionResult, type BrandInput } from "../actions";
import { SaveBar, useSaveSlot } from "../AdminForm";
import s from "../admin.module.css";

let newId = 0;

/** Every brand as an editable card; add, edit and delete save together. */
export function BrandsEditor({ initial, counts }: { initial: BrandInput[]; counts: Record<string, number> }) {
  const [baseline, setBaseline] = useState(initial);
  const [brands, setBrands] = useState(initial);
  const [result, setResult] = useState<ActionResult>(null);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(brands) !== JSON.stringify(baseline);

  const saveNow = async () => {
    const r = await saveBrands(brands);
    if (r?.ok) setBaseline(brands);
    return r;
  };
  const discard = () => {
    setBrands(baseline);
    setResult(null);
  };
  const inScope = useSaveSlot({ dirty, save: saveNow, discard });
  const patch = (id: string, fn: (b: BrandInput) => BrandInput) => setBrands((list) => list.map((b) => (b.id === id ? fn(b) : b)));
  const text = (id: string, lang: "en" | "mn", key: "tag" | "about", value: string) =>
    patch(id, (b) => ({ ...b, text: { ...b.text, [lang]: { ...b.text[lang], [key]: value } } }));

  return (
    <div className={s.stack}>
      <div className={s.toolbar}>
        <span className="small muted">
          {brands.length} {brands.length === 1 ? "brand" : "brands"}
        </span>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon="plus"
          onClick={() => setBrands((list) => [...list, { id: `new:${++newId}`, name: "", text: { en: { tag: "", about: "" }, mn: { tag: "", about: "" } } }])}
        >
          Add brand
        </Button>
      </div>

      {brands.map((b) => {
        const count = counts[b.id] ?? 0;
        return (
          <section key={b.id} className={s.card}>
            <div className={s.brandHead}>
              <label className={s.miniField}>
                <span className="small muted">Brand name</span>
                <input value={b.name} placeholder="Steppe Leaf" onChange={(e) => patch(b.id, (x) => ({ ...x, name: e.target.value }))} />
              </label>
              <span className="small muted">{b.id.startsWith("new:") ? "New" : `${count} ${count === 1 ? "product" : "products"}`}</span>
              <IconButton
                icon="trash"
                label={count ? `Can’t delete ${b.name}: it has ${count} ${count === 1 ? "product" : "products"}` : `Delete ${b.name || "brand"}`}
                disabled={count > 0}
                onClick={() => setBrands((list) => list.filter((x) => x.id !== b.id))}
              />
            </div>
            <div className={s.grid2}>
              <label className={s.miniField}>
                <span className="small muted">Tagline · English</span>
                <input value={b.text.en.tag} placeholder="Tea and tea sets" onChange={(e) => text(b.id, "en", "tag", e.target.value)} />
              </label>
              <label className={s.miniField}>
                <span className="small muted">Tagline · Монгол</span>
                <input lang="mn" value={b.text.mn.tag} placeholder="Цай, цайны иж бүрдэл" onChange={(e) => text(b.id, "mn", "tag", e.target.value)} />
              </label>
              <label className={s.miniField}>
                <span className="small muted">About · English</span>
                <textarea rows={3} value={b.text.en.about} onChange={(e) => text(b.id, "en", "about", e.target.value)} />
              </label>
              <label className={s.miniField}>
                <span className="small muted">About · Монгол</span>
                <textarea rows={3} lang="mn" value={b.text.mn.about} onChange={(e) => text(b.id, "mn", "about", e.target.value)} />
              </label>
            </div>
          </section>
        );
      })}

      {!inScope && <SaveBar dirty={dirty} pending={pending} result={result} onSave={() => start(async () => setResult(await saveNow()))} onDiscard={discard} onDone={() => setResult(null)} />}
    </div>
  );
}
