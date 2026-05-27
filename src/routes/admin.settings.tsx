import { createFileRoute, redirect } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { getCurrentUser } from "@/lib/auth";
import { Bell, Globe, Lock, Palette } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — ProjectFlow" }] }),
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const u = getCurrentUser();
    if (!u) throw redirect({ to: "/login" });
    if (u.role !== "super_admin") throw redirect({ to: "/admin" });
  },
  component: SettingsPage,
});

function SettingsPage() {
  const items = [
    { icon: Globe, title: "Workspace", desc: "Nama, domain, dan branding workspace." },
    { icon: Lock, title: "Keamanan", desc: "Kebijakan password, 2FA, dan sesi." },
    { icon: Bell, title: "Notifikasi", desc: "Kanal notifikasi sistem & email." },
    { icon: Palette, title: "Tampilan", desc: "Tema, warna aksen, dan layout default." },
  ];
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Settings" description="Pengaturan sistem khusus Super Admin." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((it) => (
          <div key={it.title} className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><it.icon className="h-5 w-5" /></div>
            <h3 className="mt-4 font-semibold">{it.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}