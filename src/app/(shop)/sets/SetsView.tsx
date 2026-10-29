"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Chip, Icon, ImageMat, ProductCard } from "@/components/ui";
import { PageShell } from "@/components/shop/PageShell";
import { coverPhoto, getBrand, getProduct, sets, type SetGroup } from "@/lib/data";
import { fmt, formatPrice } from "@/lib/i18n";
import { useShop } from "@/lib/store";
import s from "./sets.module.css";

const GROUPS: (SetGroup | "all")[] = ["all", "food", "home", "wear"];

export function SetsView() {
  const { t, lang } = useShop();
  const [group, setGroup] = useState<SetGroup | "all">("all");
  const list = sets.filter((x) => group === "all" || x.group === group);
  const [featured, ...rest] = list;

  return (
    <PageShell bar={{ title: t.setsTitle, actions: ["search", "cart"] }}>
      <div className={`wrap ${s.page}`}>
        <header className={s.head}>
          <h1 className="headline">{t.setsTitle}</h1>
          <p className="body muted">{t.setsText}</p>
        </header>

        <div className="chiprail" role="group" aria-label={t.filterCat}>
          {GROUPS.map((g) => (
            <Chip key={g} selected={group === g} onClick={() => setGroup(g)}>
              {t.setGroups[g]}
            </Chip>
          ))}
        </div>

        {featured && <Featured id={featured.id} />}

        {rest.length > 0 && (
          <>
            <h2 className="label muted">{fmt(t.moreSets, { n: rest.length })}</h2>
            <div className={s.grid}>
              {rest.map((x) => {
                const p = getProduct(x.id)!;
                return (
                  <ProductCard
                    key={x.id}
                    href={`/sets/${x.id}`}
                    art={x.id} photo={coverPhoto(x.id)}
                    title={p.text[lang].title}
                    brand={getBrand(p.brand)?.name}
                    price={formatPrice(p.price)}
                    badges={p.isNew ? <Badge tone="new">{t.newLabel}</Badge> : null}
                    extra={
                      <span className={`small ${s.highlight}`}>
                        <Icon name="check" size={16} strokeWidth={2.2} />
                        {x.highlight[lang]}
                      </span>
                    }
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}

function Featured({ id }: { id: string }) {
  const { t, lang } = useShop();
  const p = getProduct(id)!;
  const set = sets.find((x) => x.id === id)!;
  return (
    <Link href={`/sets/${id}`} transitionTypes={["nav-forward"]} className={s.featured}>
      <ImageMat art={id} photo={coverPhoto(id)} size="feature" className={s.featuredMat} />
      <div className={s.featuredBody}>
        <div className="chiprow">
          {p.isNew && <Badge tone="new">{t.newLabel}</Badge>}
          {set.savings && (
            <Badge tone="ok" icon="check">
              {fmt(t.saveShort, { p: formatPrice(set.savings) })}
            </Badge>
          )}
        </div>
        <h2 className="title">{p.text[lang].title}</h2>
        <p className="small muted">{set.highlight[lang]}</p>
        <p className="price">{formatPrice(p.price)}</p>
      </div>
    </Link>
  );
}
