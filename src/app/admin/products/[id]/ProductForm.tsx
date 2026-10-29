"use client";

import { useState } from "react";
import { TextArea, TextInput } from "@/components/ui";
import type { BrandRow, Category, ProductRow, RecipientRow } from "@/db/models";
import { saveProduct } from "../../actions";
import { AdminForm, Card, Switch } from "../../AdminForm";
import { PhotoManager } from "./PhotoManager";
import s from "../../admin.module.css";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "sweets", label: "Sweets" },
  { id: "drinks", label: "Tea & drinks" },
  { id: "home", label: "Home" },
  { id: "wear", label: "Cashmere & felt" },
  { id: "set", label: "Gift set" },
];

export function ProductForm({ kind, product: p, brands, recipients }: { kind: "product" | "set"; product: ProductRow; brands: BrandRow[]; recipients: RecipientRow[] }) {
  // Only drives showing/hiding the stock field; the checkbox itself is uncontrolled form data.
  const [tracked, setTracked] = useState(p.stock !== null);
  const [onSale, setOnSale] = useState(p.salePrice !== null);

  return (
    <AdminForm action={saveProduct} className={s.editor} onDiscard={() => {
        setTracked(p.stock !== null);
        setOnSale(p.salePrice !== null);
      }}>
      <input type="hidden" name="id" value={p.id} />

      <div className={s.editorMain}>
        <PhotoManager id={p.id} photos={p.photos} title={p.text.en.title} />

        <Card title="Name and description" hint="Customers see the language they chose.">
          <div className={s.grid2}>
            <TextInput name="title_en" label="Title · English" defaultValue={p.text.en.title} required />
            <TextInput name="title_mn" label="Title · Монгол" defaultValue={p.text.mn.title} required lang="mn" />
            <TextInput name="size_en" label="Size or contents · English" defaultValue={p.text.en.size} placeholder="500 g" />
            <TextInput name="size_mn" label="Size or contents · Монгол" defaultValue={p.text.mn.size} placeholder="500 гр" lang="mn" />
            <TextArea name="note_en" label="Description · English" defaultValue={p.text.en.note} rows={4} />
            <TextArea name="note_mn" label="Description · Монгол" defaultValue={p.text.mn.note} rows={4} lang="mn" />
          </div>
        </Card>

        <Card title="Who it’s for" hint="Shows the product in “Who is the gift for?” on Home and in search.">
          <div className={s.checks}>
            {recipients.map((r) => (
              <label key={r.id} className={s.checkChip}>
                <input type="checkbox" name="recipients" value={r.id} defaultChecked={p.recipients.includes(r.id)} />
                <span>{r.name.en}</span>
              </label>
            ))}
          </div>
        </Card>
      </div>

      <div className={s.editorSide}>
        <Card title="Price and stock">
          <TextInput name="price" label="Regular price" prefix="₮" inputMode="numeric" defaultValue={p.price} required />
          <label className={s.switchRow}>
            <span className={s.switchText}>
              <span className="body-strong">On sale</span>
              <span className="small muted">Shows the regular price struck through and a Sale badge.</span>
            </span>
            <input type="checkbox" name="onSale" defaultChecked={onSale} onChange={(e) => setOnSale(e.target.checked)} className={s.switch} role="switch" />
          </label>
          {onSale && (
            <>
              <TextInput name="salePrice" label="Sale price" prefix="₮" inputMode="numeric" defaultValue={p.salePrice ?? ""} hint="Sizes and colours add their price changes on top." />
              <TextInput name="saleEndsAt" label="Last day of sale (optional)" type="date" defaultValue={p.saleEndsAt ?? ""} hint="Empty: runs until you turn it off." />
            </>
          )}
          <label className={s.switchRow}>
            <span className={s.switchText}>
              <span className="body-strong">Track stock</span>
              <span className="small muted">Off: always delivered in the normal time.</span>
            </span>
            <input type="checkbox" name="trackStock" defaultChecked={tracked} onChange={(e) => setTracked(e.target.checked)} className={s.switch} role="switch" />
          </label>
          {tracked && (
            <TextInput name="stock" label="In stock" inputMode="numeric" defaultValue={p.stock ?? 0} hint="At 0 it still sells; delivery switches to the supplier time." />
          )}
        </Card>

        <Card title="Organize">
          <label className={s.selectField}>
            <span className="small muted">Category</span>
            <select name="category" defaultValue={p.category}>
              {/* "Gift set" is for sets; a product picks what it is. */}
              {CATEGORIES.filter((c) => kind === "set" || c.id !== "set" || p.category === "set").map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className={s.selectField}>
            <span className="small muted">Brand</span>
            <select name="brandId" defaultValue={p.brandId}>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label className={s.selectField}>
            <span className="small muted">Edition</span>
            <select name="tier" defaultValue={p.tier ?? ""}>
              <option value="">None</option>
              <option value="classic">Classic</option>
              <option value="premium">Premium</option>
            </select>
          </label>
        </Card>

        <Card title="Highlight">
          <Switch name="isTop" label="Top pick" hint="Badge and the Top picks row." defaultChecked={p.isTop} />
          <Switch name="isNew" label="New" hint="Shows a New badge." defaultChecked={p.isNew} />
        </Card>
      </div>
    </AdminForm>
  );
}
