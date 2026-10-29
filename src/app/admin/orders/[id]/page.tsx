import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Badge, Thumb } from "@/components/ui";
import { Card } from "../../AdminForm";
import { date, mnt, STATUS_LABEL, STATUS_TONE } from "../../format";
import { getOrder } from "../../queries";
import { Loading, PageHeader } from "../../PageHeader";
import { StatusControl } from "./StatusControl";
import s from "../../admin.module.css";

export const metadata: Metadata = { title: "Order" };

const METHOD = { pickup: "Pickup in store", delivery: "Home delivery" } as const;

export default function OrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      <Order params={params} />
    </Suspense>
  );
}

async function Order({ params }: Pick<PageProps<"/admin/orders/[id]">, "params">) {
  await connection();
  const o = getOrder((await params).id);
  if (!o) notFound();

  return (
    <>
      <PageHeader
        title={`Order #${o.id}`}
        sub={`Placed ${date(o.placedAt)} · ${o.units} ${o.units === 1 ? "item" : "items"}`}
        back={{ href: "/admin/orders", label: "Orders" }}
        actions={<Badge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Badge>}
      />

      <div className={s.editor}>
        <div className={s.editorMain}>
          <Card title="Status" hint="Tap the step the order is at. You can step back if you tapped the wrong one.">
            <StatusControl id={o.id} status={o.status} />
          </Card>

          <Card title="Items">
            <ul className={s.list}>
              {o.lines.map((l) => (
                <li key={l.id} className={s.lineRow}>
                  <Thumb art={l.productId} photo={l.photo} size={52} />
                  <span className={s.productText}>
                    <Link href={`/admin/products/${l.productId}`} className="body-strong textlink">
                      {l.title}
                    </Link>
                    <span className="small muted">
                      {l.sku} · {l.qty} × {mnt(l.unitPrice)}
                    </span>
                  </span>
                  <span className="body-strong">{mnt(l.qty * l.unitPrice)}</span>
                </li>
              ))}
            </ul>
            <dl className={s.totals}>
              <div>
                <dt>Subtotal</dt>
                <dd>{mnt(o.subtotal)}</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>{o.shippingFee ? mnt(o.shippingFee) : "Free"}</dd>
              </div>
              <div className={s.totalRow}>
                <dt>Total</dt>
                <dd>{mnt(o.total)}</dd>
              </div>
            </dl>
          </Card>
        </div>

        <div className={s.editorSide}>
          <Card title="Customer">
            <dl className={s.facts}>
              <div>
                <dt>Name</dt>
                <dd>{o.customer}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${o.contactPhone.replace(/\s/g, "")}`} className="textlink">
                    {o.contactPhone}
                  </a>
                </dd>
              </div>
              {o.customerEmail && (
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${o.customerEmail}`} className="textlink">
                      {o.customerEmail}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          <Card title="Delivery">
            <dl className={s.facts}>
              <div>
                <dt>Method</dt>
                <dd>{METHOD[o.deliveryMethod]}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{o.address}</dd>
              </div>
              <div>
                <dt>Ready by</dt>
                <dd>{date(o.readyBy)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
