import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { readTable } from "@/db/store";
import { SaveScope } from "../AdminForm";
import { Loading, PageHeader } from "../PageHeader";
import { BrandsEditor } from "./BrandsEditor";

export const metadata: Metadata = { title: "Brands" };

export default function BrandsPage() {
  return (
    <>
      <PageHeader title="Brands" sub="Who makes what. Shown on product pages, in search filters and the Brands section on Home." />
      <Suspense fallback={<Loading />}>
        <Brands />
      </Suspense>
    </>
  );
}

async function Brands() {
  await connection();
  const initial = readTable("brands");
  const counts: Record<string, number> = {};
  for (const p of readTable("products")) counts[p.brandId] = (counts[p.brandId] ?? 0) + 1;
  return (
    <SaveScope>
      {/* Remounts after a save so new brands pick up their real ids. */}
      <BrandsEditor key={JSON.stringify(initial)} initial={initial} counts={counts} />
    </SaveScope>
  );
}
