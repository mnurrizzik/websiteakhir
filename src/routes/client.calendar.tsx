import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { projects } from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from "lucide-react";

export const Route = createFileRoute("/client/calendar")({
  head: () => ({ meta: [{ title: "Kalender — ProjectFlow" }] }),
  component: ClientCalendar,
});

function ClientCalendar() {
  const days = Array.from({ length: 35 }, (_, i) => i - 3);
  const deadlines: Record<number, string> = { 12: "Acme", 18: "DataFlow", 22: "ShopNow", 28: "Kopinesia" };
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Kalender Deadline" description="Pantau tenggat waktu setiap project." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold">Juni 2026</h2>
            <div className="flex gap-1">
              <button className="rounded-lg border border-border p-1.5 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
              <button className="rounded-lg border border-border p-1.5 hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {["Sen","Sel","Rab","Kam","Jum","Sab","Min"].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              const valid = d > 0 && d <= 30;
              const hasDeadline = deadlines[d];
              return (
                <div key={i} className={`aspect-square rounded-xl border p-2 text-xs ${valid ? "border-border bg-card hover:border-primary/40" : "border-transparent text-muted-foreground/40"} ${hasDeadline ? "border-primary/30 bg-primary-soft" : ""}`}>
                  <div className="font-medium">{valid ? d : ""}</div>
                  {hasDeadline && <div className="mt-1 truncate text-[10px] font-medium text-primary">{hasDeadline}</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-base font-semibold">Deadline Terdekat</h2>
          <ul className="mt-4 space-y-3">
            {projects.slice(0,5).map(p => (
              <li key={p.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><CalIcon className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.deadline}</p>
                  <div className="mt-2"><StatusBadge status={p.status} /></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
