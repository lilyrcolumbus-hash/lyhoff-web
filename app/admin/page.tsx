import { AdminApp } from "@/components/admin/AdminApp";

// Client-only: this route ships as a static shell that authenticates and loads
// the catalogue in the browser, so it costs the static export nothing.
export const dynamic = "force-static";

export default function AdminPage() {
  return <AdminApp />;
}
