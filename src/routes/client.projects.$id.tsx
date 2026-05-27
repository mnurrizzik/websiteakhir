import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  CheckCircle2,
  Upload,
  Download,
} from "lucide-react";

import { useProject } from "@/lib/project-store";
import { getCurrentUser } from "@/lib/auth";
import { StatusBadge } from "@/components/shared/StatusBadge";

export const Route = createFileRoute("/client/projects/$id")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;

    const user = getCurrentUser();

    if (!user) {
      throw redirect({
        to: "/login",
      });
    }
  },

  component: ProjectDetail,
});

function ProjectDetail() {
  const { id } = Route.useParams();

  const project = useProject(id);

  const user = getCurrentUser();

  if (!project || !user) {
    return (
      <div className="p-10 text-center">
        <p>Project tidak ditemukan.</p>
      </div>
    );
  }

  // =========================
  // ROLE ACCESS
  // =========================

  const isSuper = user.role === "super_admin";
  const isAdmin = user.role === "admin";

  const hasAccess = (() => {
    // super admin lihat semua
    if (isSuper) return true;

    // admin hanya lihat project miliknya
    if (isAdmin) {
      return project.adminId === user.id;
    }

    // client hanya lihat project miliknya
    return (
      project.clientId === user.clientId ||
      project.clientId === user.id
    );
  })();

  if (!hasAccess) {
    return (
      <div className="p-10 text-center">
        <p>Akses ditolak.</p>
      </div>
    );
  }

  // =========================
  // SAFE DATA
  // =========================

  const timeline = project.timeline ?? [];
  const files = project.files ?? [];
  const messages = project.messages ?? [];
  const revisions = project.revisions ?? [];
  const activityLog = project.activityLog ?? [];
  const team = project.team ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* BACK */}
      <Link
        to="/client/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke project
      </Link>

      {/* HEADER */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {project.category}
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {project.name}
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {project.description}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">

            <StatusBadge status={project.status} />

            <div className="flex items-center gap-4 text-sm text-muted-foreground">

              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {project.deadline}
              </span>

              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" />
                {team.length} anggota
              </span>
            </div>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="mt-6">

          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">
              Progress keseluruhan
            </span>

            <span className="font-semibold">
              {project.progress}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-primary"
              style={{
                width: `${project.progress}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* LEFT */}
        <div className="space-y-6 lg:col-span-2">

          {/* TIMELINE */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">

            <h2 className="text-base font-semibold">
              Timeline Progress
            </h2>

            {!timeline.length ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Belum ada timeline.
              </p>
            ) : (
              <ol className="mt-5 space-y-5">

                {timeline.map((t, i) => (
                  <li
                    key={i}
                    className="relative flex gap-4"
                  >

                    {i < timeline.length - 1 && (
                      <span className="absolute left-[14px] top-7 h-full w-px bg-border" />
                    )}

                    <div
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 ${
                        t.done
                          ? "border-success bg-success text-success-foreground"
                          : t.current
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      {t.done ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-current" />
                      )}
                    </div>

                    <div className="flex-1 pb-1">

                      <div className="flex items-center justify-between">
                        <p
                          className={`font-medium ${
                            t.current ? "text-primary" : ""
                          }`}
                        >
                          {t.phase}
                        </p>

                        <span className="text-xs text-muted-foreground">
                          {t.date}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* FILES */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">

            <div className="mb-4 flex items-center justify-between">

              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />

                <h2 className="text-base font-semibold">
                  Files
                </h2>
              </div>

              <button className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                <Upload className="h-3.5 w-3.5" />
                Upload
              </button>
            </div>

            {!files.length ? (
              <p className="text-sm text-muted-foreground">
                Belum ada file.
              </p>
            ) : (
              <ul className="divide-y divide-border">

                {files.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between py-3"
                  >

                    <div className="flex items-center gap-3">

                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
                        <FileText className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-sm font-medium">
                          {f.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {f.size} · {f.date}
                        </p>
                      </div>
                    </div>

                    <button className="rounded-lg p-2 hover:bg-muted">
                      <Download className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* DISCUSSION */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">

            <div className="mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />

              <h2 className="text-base font-semibold">
                Discussion
              </h2>
            </div>

            {!messages.length ? (
              <p className="text-sm text-muted-foreground">
                Belum ada diskusi.
              </p>
            ) : (
              <div className="space-y-4">

                {messages.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border border-border p-4"
                  >

                    <div className="mb-2 flex items-center justify-between">

                      <div className="flex items-center gap-2">

                        <div
                          className="grid h-8 w-8 place-items-center rounded-full text-xs font-semibold text-white"
                          style={{
                            background: m.color,
                          }}
                        >
                          {m.initials}
                        </div>

                        <div>
                          <p className="text-sm font-medium">
                            {m.user}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {m.time}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {m.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          {/* TEAM */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">

            <h2 className="text-base font-semibold">
              Tim Project
            </h2>

            {!team.length ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Belum ada team.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">

                {team.map((t) => (
                  <li
                    key={t.name}
                    className="flex items-center gap-3"
                  >

                    <div
                      className="grid h-9 w-9 place-items-center rounded-full text-xs font-semibold text-white"
                      style={{
                        background: t.color,
                      }}
                    >
                      {t.initials}
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        {t.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Team member
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ACTIVITY */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">

            <h2 className="text-base font-semibold">
              Aktivitas
            </h2>

            {!activityLog.length ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Belum ada aktivitas.
              </p>
            ) : (
              <ul className="mt-4 space-y-4">

                {activityLog.map((a) => (
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
            )}
          </section>

          {/* REVISIONS */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">

            <h2 className="text-base font-semibold">
              Revisions
            </h2>

            {!revisions.length ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Tidak ada revisi.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">

                {revisions.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-xl border border-border p-3"
                  >

                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {r.title}
                      </p>

                      <span className="text-xs text-muted-foreground">
                        {r.date}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.note}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}