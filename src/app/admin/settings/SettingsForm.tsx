"use client";

import { TextInput } from "@/components/ui";
import type { SettingsRow } from "@/db/models";
import { saveSettings } from "../actions";
import { AdminForm, Card } from "../AdminForm";
import s from "../admin.module.css";

export function SettingsForm({ settings: v }: { settings: SettingsRow }) {
  return (
    <AdminForm action={saveSettings} className={s.stack}>
      <Card title="Delivery and fees" hint="Customers see a delivery date on every product, the cart and checkout.">
        <div className={s.grid2}>
          <TextInput name="shippingFee" label="Delivery fee" prefix="₮" inputMode="numeric" defaultValue={v.shippingFee} hint="0 shows as “Free”." />
          <TextInput name="defaultCity" label="Default city at checkout" defaultValue={v.defaultCity} />
          <TextInput name="deliveryDays" label="Delivery days, in stock" inputMode="numeric" defaultValue={v.deliveryDays} hint="Also used in “usually within N days”." />
          <TextInput name="backorderDays" label="Delivery days, from supplier" inputMode="numeric" defaultValue={v.backorderDays} hint="When stock doesn’t cover the order." />
        </div>
      </Card>

      <Card title="Stock">
        <div className={s.grid2}>
          <TextInput name="lowStockThreshold" label="Low stock alert at" inputMode="numeric" defaultValue={v.lowStockThreshold} hint="Products with this many or fewer show on Home." />
        </div>
      </Card>

      <Card title="Payment">
        <div className={s.grid2}>
          <TextInput name="qrPaymentMinutes" label="QR code valid for (minutes)" inputMode="numeric" defaultValue={Math.round(v.qrPaymentSeconds / 60)} />
        </div>
      </Card>

      <Card title="Contact" hint="Shown in the footer, help panel and 404 page.">
        <div className={s.grid2}>
          <TextInput name="contactEmail" label="Email" type="email" defaultValue={v.contactEmail} />
          <TextInput name="contactPhone" label="Phone" type="tel" defaultValue={v.contactPhone} />
        </div>
      </Card>
    </AdminForm>
  );
}
