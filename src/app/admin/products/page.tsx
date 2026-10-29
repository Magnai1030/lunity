import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Button, cx } from "@/components/ui";
import { readTable } from "@/db/store";
import { createProduct } from "../actions";
import { getSettings, isLowStock } from "../queries";
import { Loading, PageHeader } from "../PageHeader";
import { ProductRowEditor } from "./ProductRowEditor";
import s from "../admin.module.css";

export const metadata: Metadata = { title: "Products" };

const FILTERS = [
  { id: "all", label: "All" },
  { id: "low", label: "Low stock" },
  { id: "top", label: "Top picks" },
  { id: "sale", label: "On sale" },
  { id: "archived", label: "Archived" },
] as const;

export default function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  return (
    <>
      <PageHeader
        title="Products"
        sub="Edit price and stock right in the list; changes save when you leave the field."
        actions={
          <form action={createProduct}>
            <Button type="submit" icon="plus">
              Add product
            </Button>
          </form>
        }
      />
      <Suspense fallback={<Loading />}>
        <Products searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Products({ searchParams }: Pick<PageProps<"/admin/products">, "searchParams">) {
  await connection();
  const sp = await searchParams;
  const filter = FILTERS.find((f) => f.id === sp.filter)?.id ?? "all";
  const q = String(sp.q ?? "").trim().toLowerCase();
  const { lowStockThreshold } = getSettings();
  const brands = readTable("brands");
  const sets = new Set(readTable("sets").map((x) => x.productId));

  const list = readTable("products").filter((p) => {
    if (filter === "low" && !isLowStock(p, lowStockThreshold)) return false;
    if (filter === "top" && !p.isTop) return false;
    if (filter === "sale" && p.salePrice === null) return false;
    if (filter === "archived" && p.status !== "archived") return false;
    if (q && ![p.text.en.title, p.text.mn.title, p.sku].join(" ").toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div className={s.stack}>
      <div className={s.toolbar}>
        <nav className={s.tabs} aria-label="Product filter">
          {FILTERS.map((f) => (
            <Link key={f.id} href={f.id === "all" ? "/admin/products" : `/admin/products?filter=${f.id}`} className={cx(s.tab, filter === f.id && s.tabActive)} aria-current={filter === f.id ? "page" : undefined}>
              {f.label}
            </Link>
          ))}
        </nav>
        {/* Plain GET form: the search lives in the URL, so results survive a reload. */}
        <form className={s.search} role="search">
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <input type="search" name="q" defaultValue={q} placeholder="Search by name or N°" aria-label="Search products" />
        </form>
      </div>

      {list.length === 0 ? (
        <p className={cx("body muted", s.empty)}>No products match.</p>
      ) : (
        <ul className={s.list}>
          {list.map((p) => (
            <ProductRowEditor
              key={p.id}
              product={p}
              brand={brands.find((b) => b.id === p.brandId)?.name ?? ""}
              isSet={sets.has(p.id)}
              low={isLowStock(p, lowStockThreshold)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
