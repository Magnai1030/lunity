import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "../../PageHeader";
import { ProductEditor } from "./Editor";

export const metadata: Metadata = { title: "Edit product" };

export default function ProductPage({ params }: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: Pick<PageProps<"/admin/products/[id]">, "params">) {
  return <ProductEditor id={(await params).id} kind="product" />;
}
