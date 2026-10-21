import type { Metadata } from "next";
import { AdminApp } from "@/components/admin/AdminApp";
import { Page } from "@/components/Page";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false }, // keep the admin panel out of Google
};

export default function AdminPage() {
  return (
    <Page>
      <AdminApp />
    </Page>
  );
}
