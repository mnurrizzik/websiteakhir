import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { createPortal } from "react-dom";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { statusLabel } from "@/lib/mock-data";
import { toast, ToastContainer } from "@/components/shared/Toast";

import {
  type ProjectStatus,
  type Project,
  useProjects,
  useVisibleProjects,
  useProjectActions,
} from "@/lib/project-store";

import { useCurrentUser, useUsers } from "@/lib/auth";
import { useCategories } from "@/lib/use-categories";

import {
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  X,
  Tag,
  PieChart,
} from "lucide-react";

export const Route = createFileRoute("/admin/projects")({
  head: () => ({
    meta: [{ title: "Manage Projects — ProjectFlow" }],
  }),
  component: AdminProjects,
});

const filters: (ProjectStatus | "all")[] = [
  "all", "pending", "in-progress", "review", "completed", "on-hold",
];

const MODAL_STYLE: React.CSSProperties = {
  colorScheme: "light",
};

const CATEGORY_COLORS = [
  { bg: "bg-blue-50",    text: "text-blue-600",    dot: "bg-blue-500",    hex: "#3B82F6" },
  { bg: "bg-teal-50",    text: "text-teal-600",    dot: "bg-teal-500",    hex: "#14B8A6" },
  { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500", hex: "#10B981" },
  { bg: "bg-amber-50",   text: "text-amber-600",   dot: "bg-amber-500",   hex: "#F59E0B" },
  { bg: "bg-purple-50",  text: "text-purple-600",  dot: "bg-purple-500",  hex: "#8B5CF6" },
];

function getCategoryColor(index: number) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

interface DonutSlice { label: string; count: number; color: string }

function DonutChart({ slices, total }: { slices: DonutSlice[]; total: number }) {
  const size = 110;
  const cx = size / 2;
  const cy = size / 2;
  const r = 40;
  const gap = 2;
  let cumAngle = -90;

  const paths = slices
    .filter((s) => s.count > 0)
    .map((s) => {
      const pct = s.count / Math.max(total, 1);
      const sweepDeg = pct * 360 - gap;
      const startRad = (cumAngle * Math.PI) / 180;
      cumAngle += pct * 360;
      const endRad = ((cumAngle - gap) * Math.PI) / 180;
      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);
      const large = sweepDeg > 180 ? 1 : 0;
      return { d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, color: s.color, label: s.label };
    });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={15} />
      {paths.map((p) => (
        <path key={p.label} d={p.d} fill="none" stroke={p.color} strokeWidth={15} strokeLinecap="round" />
      ))}
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="17" fontWeight="700" fill="#0f172a">{total}</text>
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize="6.5" fill="#94a3b8">Total Project</text>
    </svg>
  );
}

function ModalPortal({ children }: { children: React.ReactNode }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      {children}
    </div>,
    document.body
  );
}

function AdminProjects() {
  const me = useCurrentUser();
  const users = useUsers();
  const allProjects = useProjects();
  const { updateProject, createProject, deleteProject } = useProjectActions();

  const { allCategories, addCategory, removeCategory } = useCategories(allProjects);

  const admins = users.filter((u) => u.role === "admin").map((a) => ({ id: a.id, name: a.name }));
  const clientUsers = users.filter((u) => u.role === "client").map((c) => ({ id: c.id, clientId: c.clientId, name: c.name }));

  const [q, setQ] = useState("");
  const [f, setF] = useState<ProjectStatus | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [confirmDel, setConfirmDel] = useState<Project | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  const [form, setForm] = useState({
    name: "", category: "", description: "", deadline: "", adminId: "", clientId: "",
  });

  const projects = useVisibleProjects();

  const donutSlices: DonutSlice[] = allCategories.map((cat, i) => ({
    label: cat,
    count: allProjects.filter((p) => p.category === cat).length,
    color: getCategoryColor(i).hex,
  }));
  const totalProjects = allProjects.length;

  const list = projects.filter((p) => {
    const cName = users.find((u) => u.clientId === p.clientId || u.id === p.clientId)?.name ?? "";
    return (
      (f === "all" || p.status === f) &&
      (p.name.toLowerCase().includes(q.toLowerCase()) || cName.toLowerCase().includes(q.toLowerCase()))
    );
  });

  const isSuper = me?.role === "super_admin";
  const canEdit = me?.role === "admin" || isSuper;

  const adminName = (id?: string) => users.find((a) => a.id === id)?.name ?? "—";
  const clientName = (clientId: string) =>
    users.find((u) => u.clientId === clientId || u.id === clientId)?.name ?? "-";

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    addCategory(trimmed);
    setNewCategoryInput("");
  };

  const handleRemoveCategory = (cat: string) => {
    removeCategory(cat);
    if (form.category === cat) setForm({ ...form, category: "" });
  };

  const handleCreateProject = async () => {
    try {
      if (!form.name.trim()) {
        toast.warning("Form Tidak Lengkap", "Nama project wajib diisi.");
        return;
      }
      if (!form.category.trim()) {
        toast.warning("Form Tidak Lengkap", "Kategori wajib dipilih.");
        return;
      }
      if (!form.clientId) {
        toast.warning("Form Tidak Lengkap", "Client wajib dipilih.");
        return;
      }
      const selectedClient = clientUsers.find((c) => c.id === form.clientId);
      if (!selectedClient) {
        toast.error("Client Tidak Ditemukan", "Silakan pilih ulang client.");
        return;
      }
      await createProject({
        name: form.name,
        category: form.category,
        description: form.description,
        deadline: form.deadline || null,
        adminId: form.adminId || null,
        clientId: selectedClient.id,
        client: selectedClient.name,
      });
      toast.success("Project Berhasil Dibuat", `"${form.name}" telah ditambahkan.`);
      setForm({ name: "", category: "", description: "", deadline: "", adminId: "", clientId: "" });
      setCreateOpen(false);
    } catch (error) {
      console.error("CREATE PROJECT ERROR:", error);
      toast.error("Gagal Membuat Project", "Terjadi kesalahan, silakan coba lagi.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    try {
      await updateProject(editing.id, {
        status: editing.status,
        progress: editing.progress,
        deadline: editing.deadline,
        description: editing.description,
      });
      toast.success("Project Diperbarui", "Perubahan berhasil disimpan.");
      setEditing(null);
    } catch (error) {
      console.error("UPDATE PROJECT ERROR:", error);
      toast.error("Gagal Update Project", "Terjadi kesalahan saat menyimpan.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDel) return;
    const name = confirmDel.name;
    try {
      await deleteProject(confirmDel.id);
      toast.success("Project Dihapus", `"${name}" telah dihapus permanen.`);
      setConfirmDel(null);
    } catch (error) {
      console.error("DELETE PROJECT ERROR:", error);
      toast.error("Gagal Menghapus Project", "Terjadi kesalahan saat menghapus.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Toast container — renders into document.body */}
      <ToastContainer />

      <PageHeader
        title="Management Project"
        description={
          isSuper
            ? "Kelola seluruh project, assign admin & client."
            : "Update status & progress project yang ditugaskan ke Anda."
        }
        actions={
          isSuper ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCategoryModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-soft transition hover:bg-muted"
              >
                <Tag className="h-4 w-4" />
                Kategori
              </button>
              <button
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-card"
              >
                <Plus className="h-4 w-4" />
                Project Baru
              </button>
            </div>
          ) : undefined
        }
      />

      {/* Search & Filter */}
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
                f === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "Semua" : statusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
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
            {list.map((p) => {
              const catIndex = allCategories.indexOf(p.category);
              const catColor = getCategoryColor(catIndex >= 0 ? catIndex : 0);
              return (
                <tr key={p.id} className="transition hover:bg-muted/30 animate-fade-in">
                  <td className="px-5 py-4">
                    <p className="font-medium">{p.name}</p>
                    <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${catColor.bg} ${catColor.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${catColor.dot}`} />
                      {p.category}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-muted-foreground">{clientName(p.clientId)}</td>
                  <td className="px-3 py-4 text-muted-foreground">{adminName(p.adminId)}</td>
                  <td className="px-3 py-4"><StatusBadge status={p.status} /></td>
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
                            onClick={() => {
                              updateProject(p.id, { status: "in-progress" });
                              toast.success("Project Disetujui", `"${p.name}" sekarang In Progress.`);
                            }}
                            className="rounded-lg p-1.5 text-success hover:bg-success/10"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button
                            title="Tolak"
                            onClick={() => {
                              updateProject(p.id, { status: "on-hold" });
                              toast.warning("Project Ditahan", `"${p.name}" dipindahkan ke On Hold.`);
                            }}
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Modal Kelola Kategori ── */}
      {categoryModalOpen && (
        <ModalPortal>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden" style={MODAL_STYLE}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">Kelola Kategori</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Kategori muncul di distribusi pie chart dashboard</p>
              </div>
              <button onClick={() => setCategoryModalOpen(false)} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {allCategories.length > 0 && (
              <div className="mx-6 mb-4 rounded-xl bg-zinc-50 border border-zinc-100 px-4 py-3">
                <div className="flex items-center gap-1.5 mb-3">
                  <PieChart className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-500">Distribusi Kategori</span>
                  <span className="ml-auto text-xs text-zinc-400">Total {totalProjects} project</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="shrink-0">
                    <DonutChart slices={donutSlices} total={totalProjects} />
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    {allCategories.map((cat, i) => {
                      const color = getCategoryColor(i);
                      const count = allProjects.filter((p) => p.category === cat).length;
                      const pct = totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0;
                      return (
                        <div key={cat} className="flex items-center gap-1.5 text-xs min-w-0">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${color.dot}`} />
                          <span className="truncate text-zinc-700 font-medium flex-1">{cat}</span>
                          <span className="text-zinc-400 shrink-0">{count} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="px-6 pb-6 space-y-4">
              <div className="flex gap-2">
                <input
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  placeholder="Nama kategori baru..."
                  className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  onClick={handleAddCategory}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 shrink-0"
                >
                  Tambah
                </button>
              </div>

              {allCategories.length === 0 ? (
                <p className="py-6 text-center text-sm text-zinc-400">Belum ada kategori.</p>
              ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {allCategories.map((cat, i) => {
                    const color = getCategoryColor(i);
                    const count = allProjects.filter((p) => p.category === cat).length;
                    return (
                      <div key={cat} className="group flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${color.dot}`} />
                          <span className="text-sm font-medium text-zinc-800 truncate">{cat}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-zinc-400">{count} project</span>
                          <button
                            onClick={() => handleRemoveCategory(cat)}
                            className="rounded-lg p-1 text-zinc-300 hover:bg-zinc-200 hover:text-zinc-600 transition opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => setCategoryModalOpen(false)}
                className="w-full rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
              >
                Selesai
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ── Modal Edit Project ── */}
      {editing && (
        <ModalPortal>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" style={MODAL_STYLE}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Update Project</h2>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Status</label>
                <select
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as ProjectStatus })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Progress: {editing.progress}%</label>
                <input
                  type="range" min={0} max={100} value={editing.progress}
                  onChange={(e) => setEditing({ ...editing, progress: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Deadline</label>
                <input
                  type="date" value={editing.deadline}
                  onChange={(e) => setEditing({ ...editing, deadline: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Deskripsi</label>
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
                />
              </div>
              <button onClick={handleSaveEdit} className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Simpan Perubahan
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ── Modal Buat Project ── */}
      {createOpen && (
        <ModalPortal>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" style={MODAL_STYLE}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Buat Project</h2>
              <button onClick={() => setCreateOpen(false)} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                placeholder="Nama Project" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-zinc-500">Kategori</label>
                  <button
                    type="button"
                    onClick={() => { setCreateOpen(false); setCategoryModalOpen(true); }}
                    className="flex items-center gap-0.5 text-xs text-blue-500 hover:text-blue-600 hover:underline"
                  >
                    <Tag className="h-3 w-3" />
                    Kelola Kategori
                  </button>
                </div>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Pilih Kategori</option>
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Deskripsi" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
              <input
                type="date" value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
              <select
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
              >
                <option value="">Pilih Client</option>
                {clientUsers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={form.adminId}
                onChange={(e) => setForm({ ...form, adminId: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
              >
                <option value="">Pilih Admin</option>
                {admins.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <button onClick={handleCreateProject} className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Simpan Project
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ── Modal Konfirmasi Hapus ── */}
      {confirmDel && (
        <ModalPortal>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" style={MODAL_STYLE}>
            <h2 className="mb-2 text-lg font-semibold text-zinc-900">Hapus Project?</h2>
            <p className="mb-5 text-sm text-zinc-500">
              Project <span className="font-medium text-zinc-900">{confirmDel.name}</span> akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)} className="flex-1 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                Batal
              </button>
              <button onClick={handleConfirmDelete} className="flex-1 rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white">
                Hapus
              </button>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}