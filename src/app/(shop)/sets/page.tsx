import type { Metadata } from "next";
import { SetsView } from "./SetsView";

export const metadata: Metadata = { title: "Sets & kits" };

export default function SetsPage() {
  return <SetsView />;
}
