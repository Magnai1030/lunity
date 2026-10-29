"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink, EmptyState, ListRow, SectionLabel } from "@/components/ui";
import { InfoSheet, type InfoKind } from "@/components/shop/InfoSheets";
import { PageShell } from "@/components/shop/PageShell";
import { orders, orderTotal } from "@/lib/data";
import { formatPrice } from "@/lib/i18n";
import { useShop } from "@/lib/store";
import s from "./profile.module.css";

export function ProfileView() {
  const router = useRouter();
  const { t, user, fav, logout, hydrated } = useShop();
  const [info, setInfo] = useState<InfoKind | null>(null);
  const spent = orders.reduce((n, o) => n + orderTotal(o), 0);

  return (
    <PageShell bar={{ title: t.profile }}>
      <div className={`wrap wrap--narrow ${s.page}`}>
        {!hydrated ? null : !user ? (
          <EmptyState icon="user" title={t.guestTitle} text={t.guestText} action={<ButtonLink href="/login">{t.login}</ButtonLink>} />
        ) : (
          <>
            <header className={s.head}>
              <span className={`avatar ${s.avatar}`}>{user.name[0]}</span>
              <h1 className="title">{user.name}</h1>
              <span className="small muted">{user.email}</span>
            </header>

            <dl className={s.stats}>
              <div>
                <dd className="price">{orders.length}</dd>
                <dt className="small muted">{t.orders}</dt>
              </div>
              <div>
                <dd className="price">{fav.length}</dd>
                <dt className="small muted">{t.wishlist}</dt>
              </div>
              <div>
                <dd className="price">{formatPrice(spent)}</dd>
                <dt className="small muted">{t.spent}</dt>
              </div>
            </dl>

            <section className={s.group}>
              <SectionLabel>{t.shopping}</SectionLabel>
              <ListRow href="/orders" icon="receipt" title={t.myOrders} sub={t.ordersSub} />
              <ListRow href="/wishlist" icon="heart" title={t.saved} sub={t.savedSub} />
            </section>
            <section className={s.group}>
              <SectionLabel>{t.account}</SectionLabel>
              <ListRow icon="user" title={t.personal} sub={t.personalSub} onClick={() => {}} />
            </section>
            <section className={s.group}>
              <SectionLabel>{t.support}</SectionLabel>
              <ListRow icon="help" title={t.helpCenter} sub={t.helpCenterSub} onClick={() => setInfo("help")} />
            </section>

            <Button
              variant="secondary"
              icon="logout"
              fullWidth
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              {t.logout}
            </Button>
          </>
        )}
      </div>
      <InfoSheet kind={info} onClose={() => setInfo(null)} />
    </PageShell>
  );
}
