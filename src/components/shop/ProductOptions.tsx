"use client";

import { OptionGroup } from "@/components/ui";
import { getOptions, type Selection } from "@/lib/data";
import { formatPrice } from "@/lib/i18n";
import { useShop } from "@/lib/store";

/** One OptionGroup per product option; price notes are relative to the current choice. */
export function ProductOptions({ id, value, onChange }: { id: string; value: Selection; onChange: (s: Selection) => void }) {
  const { lang } = useShop();
  const options = getOptions(id);
  if (!options.length) return null;
  return (
    <div className="stack" style={{ gap: 18 }}>
      {options.map((o) => {
        const cur = o.values.find((v) => v.id === value[o.id])?.delta ?? 0;
        return (
          <OptionGroup
            key={o.id}
            label={o.name[lang]}
            value={value[o.id]}
            onChange={(v) => onChange({ ...value, [o.id]: v })}
            options={o.values.map((v) => {
              const d = (v.delta ?? 0) - cur;
              return { id: v.id, label: v.label[lang], note: d ? `${d > 0 ? "+" : "−"}${formatPrice(Math.abs(d))}` : undefined };
            })}
          />
        );
      })}
    </div>
  );
}
