import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { createPortal } from "react-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { getCurrentUser, useUsers, useUserActions, roleLabel, roleTone, type Role, type User } from "@/lib/auth";
import { Plus, Search, Pencil, Trash2, ShieldCheck, X, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "User Management — ProjectFlow" }] }),
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const u = getCurrentUser();
    if (!u) throw redirect({ to: "/login" });
    if (u.role !== "super_admin") throw redirect({ to: "/admin" });
  },
  component: UsersPage,
});

type Draft = { id?: string; email: string; password: string; name: string; role: Role; clientId?: string };

function UsersPage() {
  const users = useUsers();
  const { createUser, updateUser, deleteUser } = useUserActions();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Role | "all">("all");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirmDel, setConfirmDel] = useState<User | null>(null);
  const [showPasswordCreate, setShowPasswordCreate] = useState(false);
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);

  const list = users.filter(
    (u) => (filter === "all" || u.role === filter) && (u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())),
  );

  const openCreate = () => {
    setDraft({ email: "", password: "", name: "", role: "client" });
    setShowPasswordCreate(false);
    setOpen(true);
  };

  const openEdit = (u: User) => {
    setDraft({ id: u.id, email: u.email, password: "", name: u.name, role: u.role, clientId: u.clientId });
    setShowPasswordEdit(false);
    setEditOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const payload = { ...draft, clientId: undefined };
    try {
      if (draft.id) await updateUser(draft.id, payload);
      else await createUser(payload);
    } catch (err) {
      alert((err as Error).message);
      return;
    }
    setOpen(false);
    setDraft(null);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft?.id) return;
    const payload: Record<string, unknown> = {
      name: draft.name,
      email: draft.email,
      role: draft.role,
      clientId: undefined,
    };
    if (draft.password.trim() !== "") {
      payload.password = draft.password;
    }
    try {
      await updateUser(draft.id, payload);
    } catch (err) {
      alert((err as Error).message);
      return;
    }
    setEditOpen(false);
    setDraft(null);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="User Management"
        description="Kelola akun, role, dan akses pengguna sistem."
        actions={
          <button onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-card">
            <Plus className="h-4 w-4" /> Tambah User
          </button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau email..."
            className="w-full rounded-xl border border-input bg-card py-2.5 pl-9 pr-3 text-sm shadow-soft outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" />
        </div>
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-1 shadow-soft">
          {(["all", "super_admin", "admin", "client"] as const).map((r) => (
            <button key={r} onClick={() => setFilter(r)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filter === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {r === "all" ? "Semua" : roleLabel[r]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3">User</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Dibuat</th>
              <th className="px-3 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">Tidak ada user yang cocok.</td></tr>
            )}
            {list.map((u) => (
              <tr key={u.id} className="transition hover:bg-muted/30 animate-fade-in">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full text-xs font-semibold text-white" style={{ background: u.color }}>{u.initials}</div>
                    <div><p className="font-medium">{u.name}</p></div>
                  </div>
                </td>
                <td className="px-3 py-4 text-muted-foreground">{u.email}</td>
                <td className="px-3 py-4">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleTone[u.role]}`}>
                    {u.role === "super_admin" && <ShieldCheck className="h-3 w-3" />}
                    {roleLabel[u.role]}
                  </span>
                </td>
                <td className="px-3 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${u.status === "active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {u.status === "active" ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-3 py-4 text-muted-foreground">{u.createdAt}</td>
                <td className="px-3 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button title="Edit User" onClick={() => openEdit(u)} className="rounded-lg p-1.5 text-primary hover:bg-primary-soft">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button title="Hapus" onClick={() => setConfirmDel(u)} className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah User */}
      {open && draft && (
        <Modal title="Tambah User" onClose={() => { setOpen(false); setDraft(null); }}>
          <form onSubmit={save} className="space-y-4">
            <Field label="Nama">
              <input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Email">
              <input required type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Password">
              <div className="relative">
                <input
                  required
                  type={showPasswordCreate ? "text" : "password"}
                  value={draft.password}
                  onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                  className={inputCls + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordCreate(!showPasswordCreate)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPasswordCreate ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <Field label="Role">
              <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as Role })} className={inputCls}>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="client">Client</option>
              </select>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setOpen(false); setDraft(null); }} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Batal</button>
              <button type="submit" className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft">Simpan</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Edit User */}
      {editOpen && draft && (
        <Modal title="Edit User" onClose={() => { setEditOpen(false); setDraft(null); }}>
          <form onSubmit={saveEdit} className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-3 border border-zinc-100">
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
                style={{ background: users.find(u => u.id === draft.id)?.color ?? "#6366f1" }}
              >
                {users.find(u => u.id === draft.id)?.initials ?? "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">{users.find(u => u.id === draft.id)?.name}</p>
                <p className="text-xs text-zinc-400">{users.find(u => u.id === draft.id)?.email}</p>
              </div>
            </div>
            <Field label="Nama">
              <input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Email">
              <input required type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Password">
              <div className="relative">
                <input
                  type={showPasswordEdit ? "text" : "password"}
                  value={draft.password}
                  onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                  className={inputCls + " pr-10"}
                  placeholder="Kosongkan jika tidak diubah"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordEdit(!showPasswordEdit)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPasswordEdit ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <Field label="Role">
              <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as Role })} className={inputCls}>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="client">Client</option>
              </select>
            </Field>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => { setEditOpen(false); setDraft(null); }} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Batal</button>
              <button type="submit" className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft">Simpan</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Konfirmasi Hapus */}
      {confirmDel && (
        <Modal title="Hapus User?" onClose={() => setConfirmDel(null)}>
          <p className="text-sm text-zinc-500">User <span className="font-semibold text-zinc-900">{confirmDel.name}</span> akan dihapus permanen.</p>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setConfirmDel(null)} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Batal</button>
            <button
              onClick={async () => {
                try { await deleteUser(confirmDel.id); } catch (e) { alert((e as Error).message); }
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

const inputCls = "w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-3 text-sm text-zinc-900 outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-zinc-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl animate-slide-up"
        style={{ colorScheme: "light" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}