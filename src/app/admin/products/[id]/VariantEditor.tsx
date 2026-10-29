"use client";

import { useId, useState, useTransition } from "react";
import { Button, IconButton, cx } from "@/components/ui";
import { saveVariants, type ActionResult, type VariantInput } from "../../actions";
import { Card, SaveBar, useSaveSlot } from "../../AdminForm";
import { mnt } from "../../format";
import s from "../../admin.module.css";

/** `rel` is the typed price change versus the default value, kept as text so "-" can be typed. */
type Value = Omit<VariantInput["values"][number], "priceDelta"> & { uid: number; rel: string };
type Option = Omit<VariantInput, "values"> & { uid: number; values: Value[] };

let uid = 0;
const next = () => ++uid;
const blankValue = (isDefault = false): Value => ({ uid: next(), label: { en: "", mn: "" }, rel: "0", isDefault });
const num = (t: string) => Math.trunc(Number(t.replace(/[\s,₮+]/g, ""))) || 0;

function toState(initial: VariantInput[]): Option[] {
  return initial.map((o) => {
    const d = (o.values.find((v) => v.isDefault) ?? o.values[0])?.priceDelta ?? 0;
    return { ...o, uid: next(), values: o.values.map(({ priceDelta, ...v }) => ({ ...v, uid: next(), rel: String(priceDelta - d) })) };
  });
}
const toInput = (options: Option[]): VariantInput[] =>
  options.map((o) => ({
    key: o.key,
    name: o.name,
    spec: o.spec,
    values: o.values.map((v) => ({ key: v.key, label: v.label, isDefault: v.isDefault, priceDelta: v.isDefault ? 0 : num(v.rel) })),
  }));
const move = <T,>(list: T[], i: number, by: number) => {
  const out = [...list];
  [out[i], out[i + by]] = [out[i + by], out[i]];
  return out;
};

/**
 * Options such as Size or Colour, each with values, a price change per value and one default.
 * The default value costs the product's regular price; the others add or subtract from it.
 */
export function VariantEditor({ productId, price, initial }: { productId: string; price: number; initial: VariantInput[] }) {
  // baseline = what's saved; replaced after each successful save so the bar clears.
  const [baseline, setBaseline] = useState(() => toState(initial));
  const [options, setOptions] = useState<Option[]>(baseline);
  const [result, setResult] = useState<ActionResult>(null);
  const [pending, start] = useTransition();
  // Stable on server and client (unlike the uid counter, which only keys list items).
  const radioId = useId();
  const dirty = JSON.stringify(toInput(options)) !== JSON.stringify(toInput(baseline));

  const patch = (i: number, fn: (o: Option) => Option) => setOptions((list) => list.map((o, j) => (j === i ? fn(o) : o)));
  const patchValue = (i: number, j: number, fn: (v: Value) => Value) => patch(i, (o) => ({ ...o, values: o.values.map((v, k) => (k === j ? fn(v) : v)) }));

  const saveNow = async () => {
    const r = await saveVariants(productId, toInput(options));
    if (r?.ok) setBaseline(options);
    return r;
  };
  const discard = () => {
    setOptions(baseline);
    setResult(null);
  };
  const inScope = useSaveSlot({ dirty, save: saveNow, discard });
  const save = () => start(async () => setResult(await saveNow()));

  return (
    <Card
      title="Variants"
      hint="Sizes, colours or editions customers choose from. The default value costs the regular price."
      aside={
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon="plus"
          onClick={() => setOptions((list) => [...list, { uid: next(), name: { en: "", mn: "" }, spec: null, values: [blankValue(true)] }])}
        >
          Add option
        </Button>
      }
    >
      {options.length === 0 && <p className="small muted">No variants. Customers buy this product as it is.</p>}

      {options.map((o, i) => {
        const def = o.values.find((v) => v.isDefault) ?? o.values[0];
        return (
          <fieldset key={o.uid} className={s.varOption}>
            <legend className="sr-only">Option {i + 1}</legend>
            <div className={s.varHead}>
              <label className={s.miniField}>
                <span className="small muted">Option name · English</span>
                <input value={o.name.en} placeholder="Size" onChange={(e) => patch(i, (x) => ({ ...x, name: { ...x.name, en: e.target.value } }))} />
              </label>
              <label className={s.miniField}>
                <span className="small muted">Option name · Монгол</span>
                <input value={o.name.mn} placeholder="Хэмжээ" lang="mn" onChange={(e) => patch(i, (x) => ({ ...x, name: { ...x.name, mn: e.target.value } }))} />
              </label>
              <label className={s.miniField}>
                <span className="small muted">On the product page</span>
                <select value={o.spec ?? ""} onChange={(e) => patch(i, (x) => ({ ...x, spec: (e.target.value || null) as Option["spec"] }))}>
                  <option value="">Own row</option>
                  <option value="size">Replaces the Size row</option>
                  <option value="tier">Replaces the Edition row</option>
                </select>
              </label>
              <span className={s.varTools}>
                <IconButton icon="chevron" label="Move option up" className={s.up} disabled={i === 0} onClick={() => setOptions((l) => move(l, i, -1))} />
                <IconButton icon="chevron" label="Move option down" className={s.down} disabled={i === options.length - 1} onClick={() => setOptions((l) => move(l, i, 1))} />
                <IconButton icon="trash" label={`Remove option ${o.name.en || i + 1}`} onClick={() => setOptions((l) => l.filter((_, j) => j !== i))} />
              </span>
            </div>

            <div className={s.varValues} role="table" aria-label={`Values of ${o.name.en || "option"}`}>
              <div className={cx(s.varRow, s.varRowHead)} role="row">
                <span role="columnheader">Default</span>
                <span role="columnheader">Value · English</span>
                <span role="columnheader">Value · Монгол</span>
                <span role="columnheader">Price change</span>
                <span role="columnheader">Price</span>
                <span role="columnheader" className="sr-only">
                  Actions
                </span>
              </div>
              {o.values.map((v, j) => (
                <div key={v.uid} className={s.varRow} role="row">
                  <label className={s.varDefault}>
                    <input
                      type="radio"
                      name={`${radioId}-default-${i}`}
                      checked={v === def}
                      // New default: rebase the others so every value keeps its price.
                      onChange={() => patch(i, (x) => ({ ...x, values: x.values.map((y, k) => ({ ...y, isDefault: k === j, rel: String(num(y.rel) - num(v.rel)) })) }))}
                    />
                    <span className="sr-only">Default value</span>
                  </label>
                  <input aria-label="Value in English" value={v.label.en} placeholder="500 g" onChange={(e) => patchValue(i, j, (y) => ({ ...y, label: { ...y.label, en: e.target.value } }))} />
                  <input aria-label="Value in Mongolian" lang="mn" value={v.label.mn} placeholder="500 гр" onChange={(e) => patchValue(i, j, (y) => ({ ...y, label: { ...y.label, mn: e.target.value } }))} />
                  <span className={s.varPrice}>
                    <span className="muted">±₮</span>
                    <input
                      aria-label="Price change"
                      inputMode="numeric"
                      value={v === def ? "0" : v.rel}
                      disabled={v === def}
                      onChange={(e) => patchValue(i, j, (y) => ({ ...y, rel: e.target.value }))}
                    />
                  </span>
                  <span className={cx("small", s.varTotal)}>{mnt(price + (v === def ? 0 : num(v.rel)))}</span>
                  <span className={s.varTools}>
                    <IconButton icon="chevron" label="Move value up" className={s.up} disabled={j === 0} onClick={() => patch(i, (x) => ({ ...x, values: move(x.values, j, -1) }))} />
                    <IconButton
                      icon="trash"
                      label={`Remove value ${v.label.en || j + 1}`}
                      disabled={o.values.length === 1}
                      onClick={() =>
                        patch(i, (x) => {
                          const values = x.values.filter((_, k) => k !== j);
                          // Removing the default hands it to the first remaining value, rebasing the rest.
                          return { ...x, values: v === def ? values.map((y, k) => ({ ...y, isDefault: k === 0, rel: String(num(y.rel) - num(values[0].rel)) })) : values };
                        })
                      }
                    />
                  </span>
                </div>
              ))}
            </div>
            <button type="button" className={s.linkBtn} onClick={() => patch(i, (x) => ({ ...x, values: [...x.values, blankValue()] }))}>
              + Add value
            </button>
          </fieldset>
        );
      })}

      {!inScope && <SaveBar dirty={dirty} pending={pending} result={result} onSave={save} onDiscard={discard} onDone={() => setResult(null)} />}
    </Card>
  );
}
