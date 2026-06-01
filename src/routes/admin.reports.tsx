import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { TrendingUp, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { useVisibleProjects } from "@/lib/project-store";
import { useMemo } from "react";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — ProjectFlow" }] }),
  component: Reports,
});

function Reports() {
  const projects = useVisibleProjects();

  // --- StatCard calculations ---
  const today = new Date();

  const completed = projects.filter((p) => p.status === "completed");
  const overdue = projects.filter(
    (p) =>
      p.deadline &&
      new Date(p.deadline) < today &&
      p.status !== "completed"
  );
  const active = projects.filter((p) => p.status === "in-progress");

  // On-time delivery: completed projects whose deadline hasn't passed
  const onTime = completed.filter(
    (p) => !p.deadline || new Date(p.deadline) >= today
  );
  const onTimePct =
    completed.length > 0
      ? Math.round((onTime.length / completed.length) * 100)
      : 0;

  // Avg progress of active projects as proxy for "avg project time" feel
  const avgProgress =
    active.length > 0
      ? Math.round(active.reduce((s, p) => s + p.progress, 0) / active.length)
      : 0;

  // Growth: ratio of completed vs total
  const growthPct =
    projects.length > 0
      ? Math.round((completed.length / projects.length) * 100)
      : 0;

  // --- Chart: group projects by month of deadline ---
  const monthlyData = useMemo(() => {
    const map: Record<string, { month: string; completed: number; active: number }> = {};

    projects.forEach((p) => {
      const dateStr = p.deadline || "";
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("id-ID", { month: "short", year: "2-digit" });
      if (!map[key]) map[key] = { month: label, completed: 0, active: 0 };
      if (p.status === "completed") map[key].completed += 1;
      else map[key].active += 1;
    });

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, v]) => v);
  }, [projects]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Insight performa project & tim secara mendalam."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="On-time Delivery"
          value={`${onTimePct}%`}
          change={`${completed.length} project selesai`}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Avg. Progress Aktif"
          value={`${avgProgress}%`}
          change={`${active.length} project berjalan`}
          icon={Clock}
          tone="info"
        />
        <StatCard
          label="Completion Rate"
          value={`${growthPct}%`}
          change={`dari ${projects.length} total project`}
          icon={TrendingUp}
          tone="primary"
        />
        <StatCard
          label="Overdue"
          value={String(overdue.length)}
          change={overdue.length > 0 ? "butuh review" : "semua on track"}
          icon={AlertTriangle}
          tone="warning"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="text-base font-semibold">Trend 6 Bulan Terakhir</h2>
        {monthlyData.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Belum ada data project dengan deadline.
          </p>
        ) : (
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.92 0.01 245)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="oklch(0.5 0.025 255)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="oklch(0.5 0.025 255)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(0.92 0.01 245)",
                  }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === "completed" ? "Selesai" : "Aktif",
                  ]}
                />
                <Legend
                  formatter={(value) =>
                    value === "completed" ? "Selesai" : "Aktif"
                  }
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="oklch(0.65 0.16 155)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="oklch(0.58 0.18 255)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}