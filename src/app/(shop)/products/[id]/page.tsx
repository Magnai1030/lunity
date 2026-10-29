import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { getProduct, getSet, isListed, products } from "@/lib/data";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/products/[id]">): Promise<Metadata> {
  const p = getProduct((await params).id);
  return { title: p?.text.en.title ?? "Not found", description: p?.text.en.note };
}

export default async function ProductPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  if (!isListed(id)) notFound();
  if (getSet(id)) permanentRedirect(`/sets/${id}`);
  return <ProductDetail id={id} mode="product" />;
}
