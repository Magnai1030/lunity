import { Toast } from "@/components/shop/Toast";
import { LangSync } from "@/lib/store";

/**
 * Storefront-only chrome. Kept out of the root layout so the admin's browser bundle never
 * includes the shop store, which imports the JSON tables: in dev, an admin save rewrites
 * those files, and any page bundling them would fully reload and lose its "Saved" message.
 */
export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {children}
      <Toast />
      <LangSync />
    </>
  );
}
