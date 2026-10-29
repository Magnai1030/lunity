import type { Metadata } from "next";
import { WishlistView } from "./WishlistView";

export const metadata: Metadata = { title: "Saved items" };

export default function WishlistPage() {
  return <WishlistView />;
}
