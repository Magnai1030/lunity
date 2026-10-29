import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminNav, AdminNavFallback } from "./AdminNav";
import { adminEnabled } from "./guard";
import s from "./admin.module.css";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  if (!adminEnabled) notFound();
  return (
    <div className={s.shell}>
      <Suspense fallback={<AdminNavFallback />}>
        <AdminNav />
      </Suspense>
      <main className={s.main}>{children}</main>
    </div>
  );
}
