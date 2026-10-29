import type { Metadata } from "next";
import { DesignSystemView } from "./DesignSystemView";

export const metadata: Metadata = { title: "Atelier design system" };

export default function DesignSystemPage() {
  return <DesignSystemView />;
}
