import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";

import { activityLog, monthlyData } from "@/lib/mock-data";
import { useVisibleProjects } from "@/lib/project-store";
import { useCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/client/")({
  head: () => ({
    meta: [{ title: "Dashboard — ProjectFlow" }],
  }),

  component: ClientDashboard,
});

function ClientDashboard() {
  const user = useCurrentUser();

  const projects = useVisibleProjects();

  // FIX STATUS
  const active = projects.filter(
    (p) => p.status === "in-progress"
  ).length;

  const done = projects.filter(
    (p) => p.status === "completed"
  ).length;

  const pending = projects.filter(
    (p) =>
      p.status === "pending" ||
      p.status === "review"
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* HEADER */}
      <PageHeader
        title={`Halo, ${user?.name ?? "Client"} 👋`}
        description="Berikut ringkasan project Anda hari ini."
      />

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Project"
          value={projects.length}
          change="+2 bulan ini"
          icon={FolderKanban}
          tone="primary"
        />

        <StatCard
          label="Sedang Berjalan"
          value={active}
          change="+1 minggu ini"
          icon={Clock}
          tone="info"
        />

        <StatCard
          label="Selesai"
          value={done}
          change="98% tepat waktu"
          icon={CheckCircle2}
          tone="success"
        />

        <StatCard
          label="Butuh Aksi"
          value={pending}
          icon={AlertCircle}
          tone="warning"
        />
      </div>

      {/* CHART + ACTIVITY */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* CHART */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-2">

          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">
                Performa Project
              </h2>

              <p className="text-xs text-muted-foreground">
                Aktivitas 6 bulan terakhir
              </p>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
              <TrendingUp className="h-3 w-3" />
              +18%
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart data={monthlyData}>

                <defs>
                  <linearGradient
                    id="g1"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="oklch(0.58 0.18 255)"
                      stopOpacity={0.4}
                    />

                    <stop
                      offset="95%"
                      stopColor="oklch(0.58 0.18 255)"
                      stopOpacity={0}
                    />
                  </linearGradient>

                  <linearGradient
                    id="g2"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="oklch(0.65 0.16 155)"
                      stopOpacity={0.3}
                    />

                    <stop
                      offset="95%"
                      stopColor="oklch(0.65 0.16 155)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

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
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border:
                      "1px solid oklch(0.92 0.01 245)",
                    boxShadow:
                      "0 8px 24px oklch(0.5 0.05 255 / 0.08)",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="oklch(0.58 0.18 255)"
                  strokeWidth={2}
                  fill="url(#g1)"
                />

                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="oklch(0.65 0.16 155)"
                  strokeWidth={2}
                  fill="url(#g2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ACTIVITY */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">

          <h2 className="text-base font-semibold">
            Aktivitas Terbaru
          </h2>

          <p className="text-xs text-muted-foreground">
            Update dari tim Anda
          </p>

          <ul className="mt-4 space-y-4">
            {activityLog.slice(0, 5).map((a) => (
              <li
                key={a.id}
                className="flex gap-3"
              >
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />

                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">
                      {a.user}
                    </span>{" "}
                    {a.action}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {a.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* PROJECT LIST */}
      <div className="rounded-2xl border border-border bg-card shadow-soft">

        <div className="flex items-center justify-between border-b border-border p-5">

          <div>
            <h2 className="text-base font-semibold">
              Project Aktif
            </h2>

            <p className="text-xs text-muted-foreground">
              Status terbaru semua project
            </p>
          </div>

          <Link
            to="/client/projects"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Lihat semua

            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-border">

          {!projects.length ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Belum ada project.
            </div>
          ) : (
            projects.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                to="/client/projects/$id"
                params={{ id: p.id }}
                className="grid grid-cols-12 items-center gap-4 p-5 transition hover:bg-muted/40"
              >

                {/* INFO */}
                <div className="col-span-12 md:col-span-5">
                  <p className="font-medium">
                    {p.name}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {p.category}
                  </p>
                </div>

                {/* PROGRESS */}
                <div className="col-span-6 md:col-span-3">

                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Progress
                    </span>

                    <span className="font-medium">
                      {p.progress}%
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-primary"
                      style={{
                        width: `${p.progress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* STATUS */}
                <div className="col-span-3 md:col-span-2">
                  <StatusBadge status={p.status} />
                </div>

                {/* TEAM */}
                <div className="col-span-3 hidden md:flex md:justify-end -space-x-2">

                  {(p.team ?? [])
                    .slice(0, 3)
                    .map((t) => (
                      <div
                        key={t.name}
                        title={t.name}
                        className="grid h-7 w-7 place-items-center rounded-full border-2 border-card text-[10px] font-semibold text-white"
                        style={{
                          background: t.color,
                        }}
                      >
                        {t.initials}
                      </div>
                    ))}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}