"use client";

import Link from "next/link";
import { Icon } from "@/components/ui";
import { useShop } from "@/lib/store";

export function Toast() {
  const { toast, t } = useShop();
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div className="toast">
          <Icon name="check" size={18} strokeWidth={2.4} />
          <span className="small">{toast}</span>
          <Link href="/cart" className="small toast__link">
            {t.cart} →
          </Link>
        </div>
      )}
    </div>
  );
}
