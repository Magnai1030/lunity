import { getBrand, getSet, recipientName, selectionFor, type Lang, type Product, type Selection } from "@/lib/data";
import type { Dict } from "@/lib/i18n";

/**
 * Chips + spec rows for product detail, set detail and quick view.
 * Attributes that are choosable options are left out of the chips (they're
 * picked in the option groups) and the spec rows show the chosen value.
 */
/** `when` is the delivery estimate for the chosen quantity (see deliveryWhen). */
export function productInfo(p: Product, t: Dict, lang: Lang, sel: Selection | undefined, when: string) {
  const L = p.text[lang];
  const forWhom = p.recipients.map((r) => recipientName(r, lang)).join(", ");
  const chosen = selectionFor(p.id, sel);
  const bySpec = (k: "size" | "tier") => chosen.find((c) => c.option.spec === k)?.value.label[lang];

  const size = bySpec("size") ?? L.size;
  const tier = bySpec("tier") ?? (p.tier ? t.tiers[p.tier] : "");
  const isSet = !!getSet(p.id);

  const chips = [forWhom, bySpec("size") ? "" : L.size, bySpec("tier") || !p.tier ? "" : t.tiers[p.tier]].filter(Boolean);
  const specs = [
    { label: t.specs.brand, value: getBrand(p.brand)?.name ?? "" },
    { label: t.specs.type, value: t.types[p.cat] },
    { label: t.specs.forWhat, value: forWhom },
    { label: isSet ? t.specs.contents : t.specs.size, value: size },
    ...(tier ? [{ label: t.specs.tier, value: tier }] : []),
    ...chosen.filter((c) => !c.option.spec).map((c) => ({ label: c.option.name[lang], value: c.value.label[lang] })),
    { label: t.specs.ready, value: when.charAt(0).toUpperCase() + when.slice(1) },
  ];
  return { L, chips, specs };
}
