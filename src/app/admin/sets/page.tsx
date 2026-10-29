import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Button, cx } from "@/components/ui";
import type { SetGroup } from "@/db/models";
import { readTable } from "@/db/store";
import { createSet } from "../actions";
import { getSettings, isLowStock } from "../queries";
import { Loading, PageHeader } from "../PageHeader";
import { ProductRowEditor } from "../products/ProductRowEditor";
import s from "../admin.module.css";

export const metadata: Metadata = { title: "Gift sets" };

const GROUP: Record<SetGroup, string> = { food: "Food & table", home: "Home & tea", wear: "Cashmere & felt" };
const FILTERS = [{ id: "all", label: "All" }, ...Object.entries(GROUP).map(([id, label]) => ({ id, label })), { id: "archived", label: "Archived" }];

export default function SetsPage({ searchParams }: PageProps<"/admin/sets">) {
  return (
    <>
      <PageHeader
        title="Gift sets"
        sub="Several items packed and sold as one. Edit price and stock here; open a set to change what's inside."
        actions={
          <form action={createSet}>
            <Button type="submit" icon="plus">
              Add set
            </Button>
          </form>
        }
      />
      <Suspense fallback={<Loading />}>
        <Sets searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Sets({ searchParams }: Pick<PageProps<"/admin/sets">, "searchParams">) {
  await connection();
  const wanted = (await searchParams).filter;
  const filter = FILTERS.find((f) => f.id === wanted)?.id ?? "all";
  const { lowStockThreshold } = getSettings();
  const products = readTable("products");
  const items = readTable("set_items");

  const list = readTable("sets")
    .filter((x) => (filter === "all" ? true : filter === "archived" ? products.find((p) => p.id === x.productId)?.status === "archived" : x.group === filter))
    .flatMap((x) => {
      const p = products.find((y) => y.id === x.productId);
      return p ? [{ set: x, product: p, count: items.filter((it) => it.setId === x.productId).reduce((n, it) => n + it.qty, 0) }] : [];
    });

  return (
    <div className={s.stack}>
      <nav className={s.tabs} aria-label="Set filter">
        {FILTERS.map((f) => (
          <Link key={f.id} href={f.id === "all" ? "/admin/sets" : `/admin/sets?filter=${f.id}`} className={cx(s.tab, filter === f.id && s.tabActive)} aria-current={filter === f.id ? "page" : undefined}>
            {f.label}
          </Link>
        ))}
      </nav>

      {list.length === 0 ? (
        <p className={cx("body muted", s.empty)}>No gift sets here.</p>
      ) : (
        <ul className={s.list}>
          {list.map(({ set, product, count }) => (
            <ProductRowEditor
              key={product.id}
              product={product}
              href={`/admin/sets/${product.id}`}
              meta={`${GROUP[set.group]} · ${count} ${count === 1 ? "item" : "items"}`}
              low={isLowStock(product, lowStockThreshold)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
