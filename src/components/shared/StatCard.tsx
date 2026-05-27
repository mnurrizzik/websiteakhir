import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label, value, change, icon: Icon, tone = "primary",
}: { label: string; value: string | number; change?: string; icon: LucideIcon; tone?: "primary" | "success" | "warning" | "info" }) {
  const tones = {
    primary: "bg-primary-soft text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    info: "bg-info/15 text-info",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:shadow-card animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          {change && <p className="mt-1 text-xs text-success">{change}</p>}
        </div>
        <div className={cn("rounded-xl p-2.5", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
