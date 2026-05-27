import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/client")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const u = getCurrentUser();
    if (!u) throw redirect({ to: "/login" });
    if (u.role !== "client") throw redirect({ to: "/admin" });
  },
  component: () => <AppShell role="client"><Outlet /></AppShell>,
});
