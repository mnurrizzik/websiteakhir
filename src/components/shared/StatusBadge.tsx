import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/mock-data";
import { statusLabel } from "@/lib/mock-data";

const styles: Record<ProjectStatus, string> = {
  "in-progress": "bg-info/15 text-info border-info/20",
  "pending": "bg-warning/20 text-warning-foreground border-warning/30",
  "completed": "bg-success/15 text-success border-success/20",
  "review": "bg-primary-soft text-primary border-primary/20",
  "on-hold": "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", styles[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabel[status]}
    </span>
  );
}
