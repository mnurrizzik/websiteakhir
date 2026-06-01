import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Users, FileText, MessageSquare, CheckCircle2, Upload, Download } from "lucide-react";
import { activityLog, messages, files } from "@/lib/mock-data";
import { useProject } from "@/lib/project-store";
import { getCurrentUser } from "@/lib/auth";
import { StatusBadge } from "@/components/shared/StatusBadge";

export const Route = createFileRoute("/client/projects/$id")({
  beforeLoad: ({ params }) => {
    if (typeof window === "undefined") return;
    const u = getCurrentUser();
    if (!u) throw redirect({ to: "/login" });
    void params;
  },
  head: () => ({ meta: [{ title: `Detail Project — ProjectFlow` }] }),
  component: ProjectDetail,
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <p className="text-muted-foreground">Project tidak ditemukan.</p>
    </div>
  ),
});

const timeline = [
  { phase: "Discovery & Research", date: "1 Mei", done: true },
  { phase: "Wireframe", date: "10 Mei", done: true },
  { phase: "High-fidelity Design", date: "18 Mei", done: true },
  { phase: "Client Review", date: "25 Mei", done: false, current: true },
  { phase: "Final Delivery", date: "12 Jun", done: false },
];

function ProjectDetail() {
  const { id } = Route.useParams();
  const project = useProject(id);
  const user = getCurrentUser();

  const isSuper = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";

  // ✅ FIX: cek akses per role
  const hasAccess = (() => {
    if (!project || !user) return false;
    if (isSuper) return true;
    if (isAdmin) return project.adminId === user.id;
    // client: hanya project yang clientId-nya sama dengan user.id
    return project.clientId === user.id;
  })();

  // ✅ FIX: return early jika tidak ada akses — setelah ini TypeScript tahu project pasti defined
  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
        <p className="text-base font-semibold">Akses ditolak</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Project tidak ditemukan atau bukan milik akun Anda.
        </p>
        <Link
          to="/client/projects"
          className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
        >
          Kembali ke project saya
        </Link>
      </div>
    );
  }

  // ✅ FIX: non-null assertion aman karena hasAccess sudah memastikan project !== undefined
  const p = project!;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        to="/client/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke project
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {p.category}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{p.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{p.description}</p>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <StatusBadge status={p.status} />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {p.deadline}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" /> {p.team.length} anggota
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Progress keseluruhan</span>
            <span className="font-semibold">{p.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-primary"
              style={{ width: `${p.progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-base font-semibold">Timeline Progress</h2>
            <ol className="mt-5 space-y-5">
              {timeline.map((t, i) => (
                <li key={i} className="relative flex gap-4">
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
                      <p className={`font-medium ${t.current ? "text-primary" : ""}`}>
                        {t.phase}
                      </p>
                      <span className="text-xs text-muted-foreground">{t.date}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold">Files</h2>
              </div>
              <button className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                <Upload className="h-3.5 w-3.5" /> Upload
              </button>
            </div>
            <ul className="divide-y divide-border">
              {files.map((f) => (
                <li key={f.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{f.name}</p>
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
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold">Discussion</h2>
            </div>
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 ${m.me ? "flex-row-reverse" : ""}`}>
                  <div
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white"
                    style={{ background: m.color }}
                  >
                    {m.initials}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.me ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {!m.me && (
                      <p className="mb-0.5 text-xs font-semibold opacity-70">{m.user}</p>
                    )}
                    <p>{m.text}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        m.me ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {m.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                placeholder="Tulis pesan..."
                className="flex-1 rounded-xl border border-input bg-background py-2.5 px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
              <button className="rounded-xl bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft">
                Kirim
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-base font-semibold">Tim Project</h2>
            <ul className="mt-4 space-y-3">
              {p.team.map((t) => (
                <li key={t.name} className="flex items-center gap-3">
                  <div
                    className="grid h-9 w-9 place-items-center rounded-full text-xs font-semibold text-white"
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">Team member</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-base font-semibold">Activity Log</h2>
            <ul className="mt-4 space-y-4">
              {activityLog.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm leading-snug">
                      <span className="font-medium">{a.user}</span> {a.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-base font-semibold">Revisi</h2>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="rounded-xl border border-border p-3">
                <p className="font-medium">Revisi hero section</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Client meminta perubahan headline & ilustrasi.
                </p>
              </li>
              <li className="rounded-xl border border-border p-3">
                <p className="font-medium">Update palet warna</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Gunakan brand color terbaru.
                </p>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}