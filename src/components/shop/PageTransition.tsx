import { ViewTransition, type ReactNode } from "react";

const types = { "nav-forward": "nav-forward", default: "page" };

/**
 * Animates page content on route changes. Links tagged `transitionTypes={["nav-forward"]}`
 * push the new page in from the right; every other navigation fades it up into place.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={types} exit={types} default="none">
      {children}
    </ViewTransition>
  );
}
