import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useVisibleProjects } from "@/lib/project-store";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from "lucide-react";

export const Route = createFileRoute("/client/calendar")({
  head: () => ({ meta: [{ title: "Kalender — ProjectFlow" }] }),
  component: ClientCalendar,
});

function ClientCalendar() {
  const projects = useVisibleProjects();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

  // Deadline yang jatuh di bulan ini
  const deadlineMap: Record<number, string[]> = {};
  projects.forEach((p) => {
    if (!p.deadline) return;
    const d = new Date(p.deadline);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!deadlineMap[day]) deadlineMap[day] = [];
      deadlineMap[day].push(p.name);
    }
  });

  // Bangun grid kalender
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  // Konversi ke Senin-based (0=Mon)
  const startOffset = (firstDay === 0 ? 6 : firstDay - 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const day = i - startOffset + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  // Deadline terdekat dari hari ini, sorted
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = [...projects]
    .filter((p) => p.deadline)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Kalender Deadline" description="Pantau tenggat waktu setiap project." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kalender */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold">{monthNames[month]} {year}</h2>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="rounded-lg border border-border p-1.5 hover:bg-muted">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={nextMonth} className="rounded-lg border border-border p-1.5 hover:bg-muted">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {["Sen","Sel","Rab","Kam","Jum","Sab","Min"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              const names = day ? (deadlineMap[day] ?? []) : [];
              const isToday = day !== null &&
                new Date(year, month, day).toDateString() === new Date().toDateString();
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-xl border p-2 text-xs transition
                    ${day ? "border-border bg-card hover:border-primary/40" : "border-transparent"}
                    ${names.length > 0 ? "border-primary/30 bg-primary-soft" : ""}
                    ${isToday ? "ring-2 ring-primary/40" : ""}
                  `}
                >
                  <div className={`font-medium ${isToday ? "text-primary" : ""}`}>{day ?? ""}</div>
                  {names.slice(0, 2).map((name, j) => (
                    <div key={j} className="mt-0.5 truncate text-[10px] font-medium text-primary">
                      {name}
                    </div>
                  ))}
                  {names.length > 2 && (
                    <div className="text-[10px] text-muted-foreground">+{names.length - 2}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Deadline Terdekat */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-base font-semibold">Deadline Terdekat</h2>

          {upcoming.length === 0 ? (
            <div className="mt-6 text-center text-xs text-muted-foreground">
              Tidak ada deadline project.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcoming.map((p) => (
                <li key={p.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                    <CalIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.deadline}</p>
                    <div className="mt-2">
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}