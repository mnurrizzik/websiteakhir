import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { monthlyData } from "@/lib/mock-data";
import { TrendingUp, Clock, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — ProjectFlow" }] }),
  component: Reports,
});

function Reports() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Reports & Analytics" description="Insight performa project & tim secara mendalam."
        actions={<button className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium shadow-soft hover:bg-muted"><Download className="h-4 w-4" /> Export CSV</button>} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="On-time Delivery" value="94%" change="+3% vs last month" icon={CheckCircle2} tone="success" />
        <StatCard label="Avg. Project Time" value="14d" change="-2 hari" icon={Clock} tone="info" />
        <StatCard label="Growth" value="+18%" change="QoQ" icon={TrendingUp} tone="primary" />
        <StatCard label="Overdue" value="3" change="butuh review" icon={AlertTriangle} tone="warning" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="text-base font-semibold">Trend 6 Bulan</h2>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 245)" vertical={false} />
              <XAxis dataKey="month" stroke="oklch(0.5 0.025 255)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.5 0.025 255)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 245)" }} />
              <Line type="monotone" dataKey="completed" stroke="oklch(0.65 0.16 155)" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="active" stroke="oklch(0.58 0.18 255)" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
