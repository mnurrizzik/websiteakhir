import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import {
  Search,
  Plus,
  Calendar,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";

import { FolderKanban } from "lucide-react";

import { statusLabel } from "@/lib/mock-data";

import {
  type ProjectStatus,
  useVisibleProjects,
} from "@/lib/project-store";

export const Route = createFileRoute(
  "/client/projects"
)({
  head: () => ({
    meta: [
      {
        title:
          "Project Saya — ProjectFlow",
      },
    ],
  }),

  component: ClientProjects,
});

const filters: (
  | ProjectStatus
  | "all"
)[] = [
  "all",
  "in-progress",
  "review",
  "pending",
  "completed",
  "on-hold",
];

function ClientProjects() {
  const [q, setQ] = useState("");

  const [f, setF] =
    useState<ProjectStatus | "all">(
      "all"
    );

  const projects = useVisibleProjects();

  const list = projects.filter(
    (p) =>
      (f === "all" ||
        p.status === f) &&
      p.name
        .toLowerCase()
        .includes(q.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Project Saya"
        description="Semua project yang sedang Anda kerjakan."
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-soft">
            <Plus className="h-4 w-4" />

            Request Project
          </button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            value={q}
            onChange={(e) =>
              setQ(e.target.value)
            }
            placeholder="Cari project..."
            className="w-full rounded-xl border border-input bg-card py-2.5 pl-9 pr-3 text-sm shadow-soft outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-1 shadow-soft">
          {filters.map((s) => (
            <button
              key={s}
              onClick={() => setF(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                f === s
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all"
                ? "Semua"
                : statusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Belum ada project"
          description="Project yang ditugaskan ke akun Anda akan muncul di sini."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <Link
              key={p.id}
              to="/client/projects/$id"
              params={{
                id: p.id,
              }}
              className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card animate-slide-up"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {p.category}
                  </p>

                  <h3 className="mt-1 text-base font-semibold leading-snug group-hover:text-primary">
                    {p.name}
                  </h3>
                </div>

                <StatusBadge
                  status={p.status}
                />
              </div>

              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {p.description}
              </p>

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Progress
                  </span>

                  <span className="font-semibold">
                    {p.progress}%
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-primary transition-all"
                    style={{
                      width: `${p.progress}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {(p.team ?? []).map(
                    (t: any) => (
                      <div
                        key={t.name}
                        className="grid h-7 w-7 place-items-center rounded-full border-2 border-card text-[10px] font-semibold text-white"
                        style={{
                          background:
                            t.color,
                        }}
                      >
                        {t.initials}
                      </div>
                    )
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />

                  {p.deadline}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}