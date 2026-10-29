import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrder, orders } from "@/lib/data";
import { OrderDetailView } from "./OrderDetailView";

export function generateStaticParams() {
  return orders.map((o) => ({ id: o.id }));
}

export async function generateMetadata({ params }: PageProps<"/orders/[id]">): Promise<Metadata> {
  return { title: `Order #${(await params).id}` };
}

export default async function OrderPage({ params }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  if (!getOrder(id)) notFound();
  return <OrderDetailView id={id} />;
}
