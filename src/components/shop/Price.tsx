import type { ReactNode } from "react";

/** A price, plus the regular price struck through when it's on sale. `children` replaces the formatted price (e.g. "From ₮30,000"). */
export function Price({ now, was, wasLabel, className, children }: { now: string; was?: string; wasLabel?: string; className?: string; children?: ReactNode }) {
  return (
    <span className={className}>
      {children ?? now}
      {was && (
        <>
          {" "}
          <s className="price-was" aria-label={wasLabel}>
            {was}
          </s>
        </>
      )}
    </span>
  );
}
