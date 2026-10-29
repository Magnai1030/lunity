import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { getProduct, getSet, isListed, sets } from "@/lib/data";

export function generateStaticParams() {
  return sets.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/sets/[id]">): Promise<Metadata> {
  const p = getProduct((await params).id);
  return { title: p?.text.en.title ?? "Not found", description: p?.text.en.note };
}

export default async function SetPage({ params }: PageProps<"/sets/[id]">) {
  const { id } = await params;
  if (!getSet(id) || !isListed(id)) notFound();
  return <ProductDetail id={id} mode="set" />;
}
