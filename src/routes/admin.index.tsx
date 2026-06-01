import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { monthlyData, categoryData, staff } from "@/lib/mock-data";
import { useProjects } from "@/lib/project-store";
import { useUsers } from "@/lib/auth";
import { useCategories } from "@/lib/use-categories";

import {
  FolderKanban,
  Users,
  DollarSign,
  Activity,
  MoreHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  Line,
} from "recharts";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Admin Analytics — ProjectFlow" }],
  }),
  component: AdminDashboard,
});

const COLORS = [
  "oklch(0.58 0.18 255)",
  "oklch(0.7 0.13 200)",
  "oklch(0.65 0.16 155)",
  "oklch(0.78 0.15 75)",
  "oklch(0.65 0.2 320)",
];

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// ─── Popover Component ────────────────────────────────────────────────────────
function Popover({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-10 z-50 w-64 rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl animate-fade-in"
    >
      <button
        onClick={onClose}
        className="absolute right-3 top-3 rounded-lg p-1 text-zinc-400 hover:bg-zinc-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      {children}
    </div>
  );
}

// ─── Month Picker Component ───────────────────────────────────────────────────
function MonthPicker({
  month,
  year,
  onChange,
}: {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}) {
  const prevMonth = () => {
    if (month === 0) onChange(11, year - 1);
    else onChange(month - 1, year);
  };

  const nextMonth = () => {
    if (month === 11) onChange(0, year + 1);
    else onChange(month + 1, year);
  };

  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-card px-2 py-1.5 shadow-soft">
      <button
        onClick={prevMonth}
        className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <span className="min-w-[130px] text-center text-sm font-medium">
        {MONTH_NAMES[month]} {year}
      </span>

      <button
        onClick={nextMonth}
        className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function AdminDashboard() {
  const projects = useProjects();
  const users = useUsers();

  // ── Shared categories — sinkron dengan Kelola Kategori ───────────────────
  const { allCategories } = useCategories(projects);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [showThroughputPopover, setShowThroughputPopover] = useState(false);
  const [showCategoryPopover, setShowCategoryPopover] = useState(false);

  // ─── Filter projects berdasarkan bulan & tahun yang dipilih ──────────────
  const filteredProjects = projects.filter((p) => {
    if (!p.deadline) return false;
    const d = new Date(p.deadline);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const statsProjects = filteredProjects.length > 0 ? filteredProjects : projects;

  const totalProjects = statsProjects.length;
  const activeProjects = statsProjects.filter((p) => p.status === "in-progress").length;
  const completedProjects = statsProjects.filter((p) => p.status === "completed").length;
  const uniqueClientIds = new Set(statsProjects.map((p) => p.clientId).filter(Boolean));
  const activeClients = uniqueClientIds.size;

  const avgProgress =
    activeProjects > 0
      ? Math.round(
          statsProjects
            .filter((p) => p.status === "in-progress")
            .reduce((acc, p) => acc + p.progress, 0) / activeProjects
        )
      : 0;

  const topPerformers = users
    .filter((u) => u.role === "admin" || u.role === "super_admin")
    .map((u) => ({
      ...u,
      projectCount: statsProjects.filter((p) => p.adminId === u.id).length,
    }))
    .sort((a, b) => b.projectCount - a.projectCount)
    .slice(0, 5);

  const recentProjects = [...statsProjects]
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  // ── Pie data: pakai allCategories dari hook supaya sinkron dengan Kelola Kategori
  // Hitung dari SEMUA project (bukan filtered bulan)
  const livePieData = allCategories
    .map((cat) => ({
      name: cat,
      value: projects.filter((p) => p.category === cat).length,
    }))
    .filter((d) => d.value > 0); // Sembunyikan kategori yang belum punya project di chart

  // Fallback ke mock jika belum ada data
  const pieData = livePieData.length > 0 ? livePieData : categoryData;
  const totalCategoryProjects = pieData.reduce((acc, item) => acc + item.value, 0);

  // Filter monthlyData: tampilkan bulan terpilih + 5 bulan sebelumnya di chart
  const chartData = (() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      let m = selectedMonth - i;
      let y = selectedYear;
      if (m < 0) { m += 12; y -= 1; }
      const label = MONTH_NAMES[m].slice(0, 3);
      const match = monthlyData.find((d) => d.month === label);
      result.push(match ?? { month: label, active: 0, completed: 0, total: 0 });
    }
    return result;
  })();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Dashboard Analytics"
        description="Ringkasan kinerja seluruh project dan tim."
        actions={
          <MonthPicker
            month={selectedMonth}
            year={selectedYear}
            onChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
          />
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Project" value={totalProjects} change={`${activeProjects} sedang berjalan`} icon={FolderKanban} tone="primary" />
        <StatCard label="Aktif Klien" value={activeClients} change={`${completedProjects} project selesai`} icon={Users} tone="info" />
        <StatCard label="Revenue" value="Rp 412jt" change="+8.2% YoY" icon={DollarSign} tone="success" />
        <StatCard label="Avg. Progress" value={`${avgProgress}%`} change="project aktif" icon={Activity} tone="warning" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Throughput Project */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md lg:col-span-2">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">Throughput Project</h2>
              <p className="text-sm text-muted-foreground">
                Aktif vs selesai — 6 bulan terakhir s/d {MONTH_NAMES[selectedMonth]} {selectedYear}
              </p>
            </div>

            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-xl p-2 transition hover:bg-muted">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setShowThroughputPopover((v) => !v)}>
                    Lihat Keterangan
                  </DropdownMenuItem>
                  <DropdownMenuItem>Refresh Data</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Popover open={showThroughputPopover} onClose={() => setShowThroughputPopover(false)}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Keterangan
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between rounded-xl bg-blue-50 px-3 py-2.5">
                    <p className="text-xs text-zinc-500">Total Aktif</p>
                    <p className="text-lg font-bold text-blue-600">{activeProjects}</p>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5">
                    <p className="text-xs text-zinc-500">Total Selesai</p>
                    <p className="text-lg font-bold text-emerald-600">{completedProjects}</p>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5">
                    <p className="text-xs text-zinc-500">Total Keseluruhan</p>
                    <p className="text-lg font-bold text-zinc-800">{totalProjects}</p>
                  </div>
                </div>
              </Popover>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 245)" vertical={false} />
                <XAxis dataKey="month" stroke="oklch(0.5 0.025 255)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.025 255)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid oklch(0.92 0.01 245)", background: "white", boxShadow: "0 10px 30px rgba(0,0,0,.08)" }} />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: "12px", paddingBottom: "20px" }} />
                <Bar dataKey="active" name="Aktif" fill="oklch(0.58 0.18 255)" radius={[10, 10, 0, 0]} />
                <Bar dataKey="completed" name="Selesai" fill="oklch(0.65 0.16 155)" radius={[10, 10, 0, 0]} />
                <Line type="monotone" dataKey="total" stroke="oklch(0.58 0.18 255)" strokeWidth={3} dot={{ r: 4 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribusi Kategori */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">Distribusi Kategori</h2>
              <p className="text-sm text-muted-foreground">Total {totalCategoryProjects} project</p>
            </div>

            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-xl p-2 transition hover:bg-muted">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setShowCategoryPopover((v) => !v)}>
                    Lihat Keterangan
                  </DropdownMenuItem>
                  <DropdownMenuItem>Refresh</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Popover open={showCategoryPopover} onClose={() => setShowCategoryPopover(false)}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Distribusi Kategori
                </p>
                <div className="space-y-2.5">
                  {pieData.map((item, i) => {
                    const percent = ((item.value / totalCategoryProjects) * 100).toFixed(1);
                    return (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-xs text-zinc-700">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-zinc-800">{item.value}</span>
                          <span className="ml-1 text-xs text-zinc-400">({percent}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Popover>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={95} paddingAngle={3}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid oklch(0.92 0.01 245)", background: "white", boxShadow: "0 10px 30px rgba(0,0,0,.08)" }} />
                <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-3xl font-bold">
                  {totalCategoryProjects}
                </text>
                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-xs">
                  Total Project
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table + Top Performers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Project Table */}
        <div className="rounded-3xl border border-border bg-card shadow-sm transition-all hover:shadow-md lg:col-span-2">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold">
              Project — {MONTH_NAMES[selectedMonth]} {selectedYear}
            </h2>
          </div>

          {recentProjects.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              Tidak ada project di bulan ini.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Project</th>
                  <th className="px-3 py-3">Client</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentProjects.map((p) => (
                  <tr key={p.id} className="transition hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category}</p>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{p.client || p.clientName || "—"}</td>
                    <td className="px-3 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="text-xs font-medium">{p.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top Performers */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
          <h2 className="text-lg font-semibold">Top Performers</h2>
          <ul className="mt-5 space-y-4">
            {(topPerformers.length > 0 ? topPerformers : staff.slice(0, 5)).map((s, i) => (
              <li key={s.id} className="flex items-center gap-3">
                <span className="w-4 text-xs font-bold text-muted-foreground">{i + 1}</span>
                <div className="grid h-10 w-10 place-items-center rounded-full text-xs font-semibold text-white shrink-0" style={{ background: s.color }}>
                  {s.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{"role" in s ? s.role : ""}</p>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {"projectCount" in s ? s.projectCount : (s as any).projects}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}