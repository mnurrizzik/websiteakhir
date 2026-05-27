import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const u = getCurrentUser();
    if (!u) throw redirect({ to: "/login" });
    if (u.role === "client") throw redirect({ to: "/client" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const u = getCurrentUser();
  const role = u?.role === "super_admin" ? "super_admin" : "admin";
  return <AppShell role={role}><Outlet /></AppShell>;
}
