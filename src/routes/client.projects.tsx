import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { statusLabel } from "@/lib/mock-data";
import { type Project, type ProjectStatus, useVisibleProjects, useProjectActions } from "@/lib/project-store";
import { useCurrentUser, useUsers } from "@/lib/auth";
import { Search, Plus, CheckCircle2, XCircle, Pencil, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/client/projects")({
  head: () => ({ meta: [{ title: "Manage Projects — ProjectFlow" }] }),
  component: AdminProjects,
});

const filters: (ProjectStatus | "all")[] = ["all", "pending", "in-progress", "review", "completed", "on-hold"];

function AdminProjects() {
  const me = useCurrentUser();
  const users = useUsers();
  const { updateProject, createProject, deleteProject } = useProjectActions();

  const admins = users
    .filter((u) => u.role === "admin")
    .map((a) => ({ id: a.id, name: a.name }));

  const clientUsers = users
    .filter((u) => u.role === "client")
    .map((c) => ({ id: c.id, name: c.name }));

  const [q, setQ] = useState("");
  const [f, setF] = useState<ProjectStatus | "all">("all");
  const projects = useVisibleProjects();

  const isSuper = me?.role === "super_admin";
  const isAdmin = me?.role === "admin";
  const canEdit = isAdmin || isSuper;

  const list = projects.filter((p) => {
    // ✅ Double protection: client hanya lihat project miliknya
    if (!isSuper && !isAdmin && p.clientId !== me?.id) return false;
    if (f !== "all" && p.status !== f) return false;
    const search = q.toLowerCase();
    return (
      p.name.toLowerCase().includes(search) ||
      // ✅ FIX: gunakan p.client (string nama) yang ada di type Project mock-data
      p.client.toLowerCase().includes(search)
    );
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [confirmDel, setConfirmDel] = useState<Project | null>(null);

  const adminName = (id?: string) => users.find((a) => a.id === id)?.name ?? "—";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Management Project"
        description={
          isSuper
            ? "Kelola seluruh project, assign admin & client."
            : "Update status & progress project yang ditugaskan ke Anda."
        }
        actions={
          isSuper ? (
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-card"
            >
              <Plus className="h-4 w-4" /> Project Baru
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari project atau client..."
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
              {s === "all" ? "Semua" : statusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Project</th>
              <th className="px-3 py-3">Client</th>
              <th className="px-3 py-3">Admin</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Progress</th>
              <th className="px-3 py-3">Deadline</th>
              <th className="px-3 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  Belum ada project.
                </td>
              </tr>
            )}
            {list.map((p) => (
              <tr key={p.id} className="transition hover:bg-muted/30 animate-fade-in">
                <td className="px-5 py-4">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                </td>
                <td className="px-3 py-4 text-muted-foreground">{p.client}</td>
                <td className="px-3 py-4 text-muted-foreground">{adminName(p.adminId)}</td>
                <td className="px-3 py-4">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-3 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-gradient-primary" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-xs font-medium">{p.progress}%</span>
                  </div>
                </td>
                <td className="px-3 py-4 text-muted-foreground">{p.deadline}</td>
                <td className="px-3 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {isSuper && p.status === "pending" && (
                      <>
                        <button
                          title="Approve"
                          onClick={() => updateProject(p.id, { status: "in-progress" })}
                          className="rounded-lg p-1.5 text-success hover:bg-success/10"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button
                          title="Tolak"
                          onClick={() => updateProject(p.id, { status: "on-hold" })}
                          className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {canEdit && (
                      <button
                        title="Update Progress"
                        onClick={() => setEditing(p)}
                        className="rounded-lg p-1.5 text-primary hover:bg-primary-soft"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {isSuper && (
                      <button
                        title="Hapus"
                        onClick={() => setConfirmDel(p)}
                        className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {createOpen && isSuper && (
        <CreateProjectModal
          admins={admins}
          clientUsers={clientUsers}
          onClose={() => setCreateOpen(false)}
          onSave={async (data) => {
            await createProject(data);
            setCreateOpen(false);
          }}
        />
      )}

      {editing && canEdit && (
        <EditProjectModal
          project={editing}
          isSuper={!!isSuper}
          admins={admins}
          clientUsers={clientUsers}
          onClose={() => setEditing(null)}
          onSave={async (patch) => {
            await updateProject(editing.id, patch);
            setEditing(null);
          }}
        />
      )}

      {confirmDel && isSuper && (
        <Modal title="Hapus Project?" onClose={() => setConfirmDel(null)}>
          <p className="text-sm text-muted-foreground">
            Project <span className="font-semibold text-foreground">{confirmDel.name}</span> akan
            dihapus permanen.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setConfirmDel(null)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Batal
            </button>
            <button
              onClick={async () => {
                await deleteProject(confirmDel.id);
                setConfirmDel(null);
              }}
              className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground"
            >
              Hapus
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-card animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function CreateProjectModal({
  admins,
  clientUsers,
  onClose,
  onSave,
}: {
  admins: { id: string; name: string }[];
  clientUsers: { id: string; name: string }[];
  onClose: () => void;
  onSave: (d: {
    name: string;
    category: string;
    clientId: string;
    client: string;
    adminId: string;
    deadline: string;
    description: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [adminId, setAdminId] = useState(admins[0]?.id ?? "");
  const [clientId, setClientId] = useState(clientUsers[0]?.id ?? "");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = clientUsers.find((x) => x.id === clientId);
    if (!c || !adminId) return;
    onSave({ name, category, clientId: c.id, client: c.name, adminId, deadline, description });
  };

  return (
    <Modal title="Project Baru" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nama Project">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama project..."
            className={inputCls}
          />
        </Field>

        <Field label="Kategori">
          <input
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Assign Admin">
            <select
              required
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              className={inputCls}
            >
              {admins.length === 0 && <option value="">Tidak ada admin</option>}
              {admins.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Assign Client">
            <select
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className={inputCls}
            >
              {clientUsers.length === 0 && <option value="">Tidak ada client</option>}
              {clientUsers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Deadline">
          <input
            required
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Deskripsi">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Deskripsi singkat project..."
            className={`${inputCls} resize-none`}
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition"
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-card transition"
          >
            Buat Project
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditProjectModal({
  project,
  isSuper,
  admins,
  clientUsers,
  onClose,
  onSave,
}: {
  project: Project;
  isSuper: boolean;
  admins: { id: string; name: string }[];
  clientUsers: { id: string; name: string }[];
  onClose: () => void;
  onSave: (patch: {
    status: ProjectStatus;
    progress: number;
    deadline: string;
    description: string;
    adminId?: string;
    clientId?: string;
    client?: string;
  }) => void;
}) {
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [progress, setProgress] = useState(project.progress);
  const [deadline, setDeadline] = useState(project.deadline);
  const [description, setDescription] = useState(project.description);
  const [adminId, setAdminId] = useState(project.adminId ?? "");
  const [clientId, setClientId] = useState(project.clientId ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patch: {
      status: ProjectStatus;
      progress: number;
      deadline: string;
      description: string;
      adminId?: string;
      clientId?: string;
      client?: string;
    } = { status, progress, deadline, description };

    if (isSuper) {
      patch.adminId = adminId || undefined;
      const c = clientUsers.find((x) => x.id === clientId);
      if (c) {
        patch.clientId = c.id;
        patch.client = c.name;
      }
    }
    onSave(patch);
  };

  return (
    <Modal title={`Update — ${project.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className={inputCls}
          >
            {(Object.keys(statusLabel) as ProjectStatus[]).map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`Progress (${progress}%)`}>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </Field>
        <Field label="Deadline">
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Deskripsi">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </Field>
        {isSuper && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Assign Admin">
              <select
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className={inputCls}
              >
                <option value="">— Belum ditugaskan —</option>
                {admins.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Assign Client">
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className={inputCls}
              >
                {clientUsers.length === 0 && <option value="">Tidak ada client</option>}
                {clientUsers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition"
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-card transition"
          >
            Simpan
          </button>
        </div>
      </form>
    </Modal>
  );
}