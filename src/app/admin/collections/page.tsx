import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { readTable } from "@/db/store";
import { SaveScope } from "../AdminForm";
import { Loading, PageHeader } from "../PageHeader";
import { CollectionEditor, type Pickable } from "./CollectionEditor";
import s from "../admin.module.css";

export const metadata: Metadata = { title: "Collections" };

/** Where each collection appears, so the admin knows what they're changing. */
const PLACEMENT: Record<string, string> = {
  "home-hero":
    "The four pictures at the top of Home. Tapping one opens a quick view.",
  "home-sets": "The gift sets row on Home.",
};

export default function CollectionsPage() {
  return (
    <>
      <PageHeader
        title="Collections"
        sub="Pick and order what shows in each spot on the home page."
      />
      <Suspense fallback={<Loading />}>
        <Collections />
      </Suspense>
    </>
  );
}

async function Collections() {
  await connection();
  const sets = new Set(readTable("sets").map((x) => x.productId));
  const pickable: Pickable[] = readTable("products").map((p) => ({
    itemId: p.id,
    kind: sets.has(p.id) ? "set" : "product",
    title: p.text.en.title,
    sku: p.sku,
    photo: p.photos[0],
  }));
  const items = readTable("collection_items");

  return (
    <SaveScope>
      <div className={s.stack}>
        {readTable("collections").map((c) => (
          <CollectionEditor
            key={c.id}
            id={c.id}
            name={c.name.en}
            placement={PLACEMENT[c.id]}
            initial={items
              .filter((x) => x.collectionId === c.id)
              .sort((a, b) => a.position - b.position)
              .map((x) => ({ kind: x.kind, itemId: x.itemId }))}
            pickable={pickable}
          />
        ))}
      </div>
    </SaveScope>
  );
}
