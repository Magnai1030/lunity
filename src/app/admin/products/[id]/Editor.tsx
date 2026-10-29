import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Badge, ButtonLink } from "@/components/ui";
import { readTable } from "@/db/store";
import type { SetInput, VariantInput } from "../../actions";
import { SaveScope } from "../../AdminForm";
import { PageHeader } from "../../PageHeader";
import { ProductForm } from "./ProductForm";
import { ProductStatusCard } from "./ProductStatusCard";
import { SetEditor, type CatalogItem } from "./SetEditor";
import { VariantEditor } from "./VariantEditor";
import s from "../../admin.module.css";

/**
 * Editor shared by Products and Gift sets. A set is a product row plus a `sets` row, so both use
 * the same details, photos, price and variants; only sets get the "What's included" card.
 * Each section redirects to the other when the id belongs there.
 */
export async function ProductEditor({ id, kind }: { id: string; kind: "product" | "set" }) {
  await connection();
  const products = readTable("products");
  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  const setRow = readTable("sets").find((x) => x.productId === id);
  if (kind === "product" && setRow) redirect(`/admin/sets/${id}`);
  if (kind === "set" && !setRow) redirect(`/admin/products/${id}`);

  const values = readTable("option_values");
  const variants: VariantInput[] = readTable("product_options")
    .filter((o) => o.productId === id)
    .sort((a, b) => a.position - b.position)
    .map((o) => ({
      key: o.key,
      name: o.name,
      spec: o.spec,
      values: values
        .filter((v) => v.optionId === o.id)
        .sort((a, b) => a.position - b.position)
        .map((v) => ({ key: v.key, label: v.label, priceDelta: v.priceDelta, isDefault: v.isDefault })),
    }));

  const set: SetInput = setRow
    ? {
        group: setRow.group,
        savings: setRow.savings,
        highlight: setRow.highlight,
        items: readTable("set_items")
          .filter((x) => x.setId === id)
          .sort((a, b) => a.position - b.position)
          .map((x) => ({ productId: x.productId, qty: x.qty, selection: x.selection, note: x.note })),
      }
    : null;
  // Products a set can contain, with their variants: everything active (other sets too, e.g. the
  // aaruul tin inside the Tsagaan Sar box), this set itself (for contents not sold separately),
  // and anything already inside even if it was archived since.
  const setIds = new Set(readTable("sets").map((x) => x.productId));
  const inside = new Set(set?.items.map((it) => it.productId));
  const allOptions = readTable("product_options");
  const catalog: CatalogItem[] = products
    .filter((p) => p.id === id || p.status === "active" || inside.has(p.id))
    .map((p) => ({
      id: p.id,
      title: p.text.en.title,
      sku: setIds.has(p.id) && p.id !== id ? `${p.sku} · Set` : p.sku,
      photo: p.photos[0],
      options: allOptions
        .filter((o) => o.productId === p.id)
        .sort((a, b) => a.position - b.position)
        .map((o) => ({
          key: o.key,
          name: o.name.en,
          values: values
            .filter((v) => v.optionId === o.id)
            .sort((a, b) => a.position - b.position)
            .map((v) => ({ key: v.key, label: v.label.en, isDefault: v.isDefault })),
        })),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
  const orderCount = new Set(readTable("order_items").filter((it) => it.productId === id).map((it) => it.orderId)).size;
  const archived = product.status === "archived";

  return (
    <>
      <PageHeader
        title={product.text.en.title}
        sub={product.sku}
        back={kind === "set" ? { href: "/admin/sets", label: "Gift sets" } : { href: "/admin/products", label: "Products" }}
        actions={
          <>
            {archived && <Badge>Archived</Badge>}
            {product.salePrice !== null && <Badge tone="error">Sale</Badge>}
            {!archived && (
              <ButtonLink href={setRow ? `/sets/${id}` : `/products/${id}`} variant="secondary" iconAfter="external" target="_blank">
                View in store
              </ButtonLink>
            )}
          </>
        }
      />
      <SaveScope>
        <ProductForm key={product.id} product={product} brands={readTable("brands")} recipients={readTable("recipients")} categories={readTable("categories")} />
        <div className={s.stack}>
          <VariantEditor key={`v-${id}`} productId={id} price={product.price} initial={variants} />
          {set && <SetEditor key={`s-${id}`} productId={id} initial={set} catalog={catalog} />}
          <ProductStatusCard id={id} title={product.text.en.title} status={product.status} orderCount={orderCount} photoCount={product.photos.length} variantCount={variants.length} />
        </div>
      </SaveScope>
    </>
  );
}
