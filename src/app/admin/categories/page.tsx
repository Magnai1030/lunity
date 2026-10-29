import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { readTable } from "@/db/store";
import { SaveScope } from "../AdminForm";
import { Loading, PageHeader } from "../PageHeader";
import { CategoryTree } from "./CategoryTree";

export const metadata: Metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <>
      <PageHeader title="Categories" sub="How products are grouped in the store menu and search. Choosing a category also shows everything inside it." />
      <Suspense fallback={<Loading />}>
        <Categories />
      </Suspense>
    </>
  );
}

async function Categories() {
  await connection();
  // Tree order: parents before children, siblings by position.
  const all = readTable("categories");
  const ordered = (parentId: string | null): typeof all =>
    all
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => a.position - b.position)
      .flatMap((c) => [c, ...ordered(c.id)]);
  const initial = ordered(null).map(({ id, parentId, name, icon, showInMenu }) => ({ id, parentId, name, icon, showInMenu }));
  const counts: Record<string, number> = {};
  for (const p of readTable("products")) counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1;

  return (
    <SaveScope>
      {/* Remounts after a save so new categories pick up their real ids. */}
      <CategoryTree key={JSON.stringify(initial)} initial={initial} counts={counts} />
    </SaveScope>
  );
}
