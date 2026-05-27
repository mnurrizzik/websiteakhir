import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { projects, monthlyData, categoryData, staff } from "@/lib/mock-data";
import { FolderKanban, Users, DollarSign, Activity, MoreHorizontal } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Analytics — ProjectFlow" }] }),
  component: AdminDashboard,
});

const COLORS = ["oklch(0.58 0.18 255)", "oklch(0.7 0.13 200)", "oklch(0.65 0.16 155)", "oklch(0.78 0.15 75)", "oklch(0.65 0.2 320)"];

function AdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Dashboard Analytics" description="Ringkasan kinerja seluruh project dan tim." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Project" value={48} change="+12% bulan ini" icon={FolderKanban} tone="primary" />
        <StatCard label="Aktif Klien" value={26} change="+4 baru" icon={Users} tone="info" />
        <StatCard label="Revenue" value="Rp 412jt" change="+8.2% YoY" icon={DollarSign} tone="success" />
        <StatCard label="Avg. Completion" value="14 hari" change="-2 hari" icon={Activity} tone="warning" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Throughput Project</h2>
              <p className="text-xs text-muted-foreground">Aktif vs Selesai</p>
            </div>
            <button className="rounded-lg p-1.5 hover:bg-muted"><MoreHorizontal className="h-4 w-4" /></button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 245)" vertical={false} />
                <XAxis dataKey="month" stroke="oklch(0.5 0.025 255)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.025 255)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 245)" }} />
                <Bar dataKey="active" fill="oklch(0.58 0.18 255)" radius={[8,8,0,0]} />
                <Bar dataKey="completed" fill="oklch(0.65 0.16 155)" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-base font-semibold">Distribusi Kategori</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {categoryData.map((_,i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 245)" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card shadow-soft lg:col-span-2">
          <div className="border-b border-border p-5"><h2 className="text-base font-semibold">Project Terbaru</h2></div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr><th className="px-5 py-3">Project</th><th className="px-3 py-3">Client</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Progress</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.slice(0,5).map(p => (
                <tr key={p.id} className="transition hover:bg-muted/40">
                  <td className="px-5 py-3"><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.category}</p></td>
                  <td className="px-3 py-3 text-muted-foreground">{p.client}</td>
                  <td className="px-3 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-3 py-3"><div className="flex items-center gap-2"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-primary" style={{width:`${p.progress}%`}} /></div><span className="text-xs font-medium">{p.progress}%</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-base font-semibold">Top Performers</h2>
          <ul className="mt-4 space-y-3">
            {staff.slice(0,5).map((s, i) => (
              <li key={s.id} className="flex items-center gap-3">
                <span className="w-4 text-xs font-bold text-muted-foreground">{i+1}</span>
                <div className="grid h-9 w-9 place-items-center rounded-full text-xs font-semibold text-white" style={{ background: s.color }}>{s.initials}</div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.role}</p>
                </div>
                <span className="text-sm font-semibold text-primary">{s.projects}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
