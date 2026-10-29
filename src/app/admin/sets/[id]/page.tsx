import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductEditor } from "../../products/[id]/Editor";
import { Loading } from "../../PageHeader";

export const metadata: Metadata = { title: "Edit gift set" };

export default function SetPage({ params }: PageProps<"/admin/sets/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: Pick<PageProps<"/admin/sets/[id]">, "params">) {
  return <ProductEditor id={(await params).id} kind="set" />;
}
