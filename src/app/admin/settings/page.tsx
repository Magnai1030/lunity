import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { getSettings } from "../queries";
import { Loading, PageHeader } from "../PageHeader";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" sub="Delivery, fees and contact details shown across the store." />
      <Suspense fallback={<Loading />}>
        <Settings />
      </Suspense>
    </>
  );
}

async function Settings() {
  await connection();
  return <SettingsForm settings={getSettings()} />;
}
