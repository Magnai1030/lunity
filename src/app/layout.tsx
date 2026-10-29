import type { Metadata, Viewport } from "next";
import { Geologica, JetBrains_Mono } from "next/font/google";
import { settings } from "@/lib/data";
import "./globals.css";
import "@/components/ui/atelier.css";
import "@/components/shop/shop.css";

const geologica = Geologica({
  variable: "--font-geologica",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: { default: "Lunity — Lunar New Year gifts, ready to give", template: "%s · Lunity" },
  description: `Ul boov, aaruul, tea, khadag and cashmere for Tsagaan Sar — gift-wrapped and usually delivered within ${settings.deliveryDays} days.`,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1b1a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geologica.variable} ${jetbrains.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
