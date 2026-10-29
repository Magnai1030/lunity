import type { ComponentProps, ReactNode } from "react";
import { AppBar } from "./AppBar";
import { PageTransition } from "./PageTransition";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type Props = {
  /** Mobile app bar config. Omit to use the full site header on mobile too. */
  bar?: ComponentProps<typeof AppBar>;
  /** Hide the footer on mobile (pages with a sticky bottom bar). */
  footer?: "always" | "desktop" | "none";
  children: ReactNode;
};

/**
 * Mobile: compact AppBar (back + title). Desktop (≥720px): full site header and footer.
 */
export function PageShell({ bar, footer = "desktop", children }: Props) {
  return (
    <div className="page">
      <SiteHeader desktopOnly={!!bar} />
      {bar && <AppBar {...bar} />}
      <PageTransition>
        <main className="page-main">{children}</main>
      </PageTransition>
      {footer !== "none" && <SiteFooter desktopOnly={footer === "desktop"} />}
    </div>
  );
}
