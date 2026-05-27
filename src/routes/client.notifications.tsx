import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { notifications } from "@/lib/mock-data";
import { Bell, Check } from "lucide-react";

export const Route = createFileRoute("/client/notifications")({
  head: () => ({ meta: [{ title: "Notifikasi — ProjectFlow" }] }),
  component: ClientNotif,
});

function ClientNotif() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Notifikasi" description="Update terbaru tentang aktivitas project Anda."
        actions={<button className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium shadow-soft hover:bg-muted"><Check className="h-4 w-4" /> Tandai dibaca</button>} />
      <ul className="space-y-2">
        {notifications.map(n => (
          <li key={n.id} className={`flex items-start gap-3 rounded-2xl border p-4 shadow-soft transition ${n.read ? "border-border bg-card/60" : "border-primary/20 bg-card"}`}>
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${n.read ? "bg-muted text-muted-foreground" : "bg-primary-soft text-primary"}`}><Bell className="h-4 w-4" /></div>
            <div className="flex-1">
              <p className={`text-sm ${n.read ? "" : "font-medium"}`}>{n.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{n.time}</p>
            </div>
            {!n.read && <span className="mt-2 h-2 w-2 rounded-full bg-primary" />}
          </li>
        ))}
      </ul>
    </div>
  );
}
