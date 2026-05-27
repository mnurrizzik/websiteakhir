import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { statusLabel } from "@/lib/mock-data";

import {
  type ProjectStatus,
  type Project,
  useVisibleProjects,
  useProjectActions,
} from "@/lib/project-store";

import { useCurrentUser, useUsers } from "@/lib/auth";

import {
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

export const Route = createFileRoute("/admin/projects")({
  head: () => ({
    meta: [{ title: "Manage Projects — ProjectFlow" }],
  }),

  component: AdminProjects,
});

const filters: (ProjectStatus | "all")[] = [
  "all",
  "pending",
  "in-progress",
  "review",
  "completed",
  "on-hold",
];

function AdminProjects() {
  const me = useCurrentUser();

  const users = useUsers();

  const {
    updateProject,
    createProject,
    deleteProject,
  } = useProjectActions();

  const admins = users
    .filter((u) => u.role === "admin")
    .map((a) => ({
      id: a.id,
      name: a.name,
    }));

  const clientUsers = users
    .filter((u) => u.role === "client")
    .map((c) => ({
      id: c.id,
      clientId: c.clientId,
      name: c.name,
    }));

  const [q, setQ] = useState("");

  const [f, setF] =
    useState<ProjectStatus | "all">("all");

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<Project | null>(null);

  const [confirmDel, setConfirmDel] =
    useState<Project | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    deadline: "",
    adminId: "",
    clientId: "",
  });

  const projects = useVisibleProjects();

  const list = projects.filter((p) => {
    const clientName =
      users.find(
        (u) =>
          u.clientId === p.clientId ||
          u.id === p.clientId
      )?.name ?? "";

    return (
      (f === "all" || p.status === f) &&
      (
        p.name
          .toLowerCase()
          .includes(q.toLowerCase()) ||
        clientName
          .toLowerCase()
          .includes(q.toLowerCase())
      )
    );
  });

  const isSuper =
    me?.role === "super_admin";

  const canEdit =
    me?.role === "admin" || isSuper;

  const adminName = (id?: string) =>
    users.find((a) => a.id === id)?.name ??
    "—";

  const clientName = (clientId: string) =>
    users.find(
      (u) =>
        u.clientId === clientId ||
        u.id === clientId
    )?.name ?? "-";

  const handleCreateProject =
    async () => {
      try {
        if (!form.name.trim()) {
          alert("Nama project wajib diisi");
          return;
        }

        if (!form.category.trim()) {
          alert("Kategori wajib diisi");
          return;
        }

        if (!form.clientId) {
          alert("Client wajib dipilih");
          return;
        }

        const selectedClient =
          clientUsers.find(
            (c) =>
              c.id === form.clientId
          );

        if (!selectedClient) {
          alert("Client tidak ditemukan");
          return;
        }

        console.log(
          "CLIENT:",
          selectedClient
        );

        await createProject({
          name: form.name,

          category: form.category,

          description:
            form.description,

          deadline:
            form.deadline || null,

          adminId:
            form.adminId || null,

          clientId:
            selectedClient.clientId ||
            selectedClient.id,

          client:
            selectedClient.name,
        });

        alert(
          "Project berhasil dibuat"
        );

        setForm({
          name: "",
          category: "",
          description: "",
          deadline: "",
          adminId: "",
          clientId: "",
        });

        setCreateOpen(false);
      } catch (error) {
        console.error(
          "CREATE PROJECT ERROR:",
          error
        );

        alert(
          "Gagal membuat project"
        );
      }
    };

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
              onClick={() =>
                setCreateOpen(true)
              }
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-card"
            >
              <Plus className="h-4 w-4" />
              Project Baru
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            value={q}
            onChange={(e) =>
              setQ(e.target.value)
            }
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
              {s === "all"
                ? "Semua"
                : statusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3">
                Project
              </th>

              <th className="px-3 py-3">
                Client
              </th>

              <th className="px-3 py-3">
                Admin
              </th>

              <th className="px-3 py-3">
                Status
              </th>

              <th className="px-3 py-3">
                Progress
              </th>

              <th className="px-3 py-3">
                Deadline
              </th>

              <th className="px-3 py-3 text-right">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {list.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10 text-center text-sm text-muted-foreground"
                >
                  Belum ada project.
                </td>
              </tr>
            )}

            {list.map((p) => (
              <tr
                key={p.id}
                className="transition hover:bg-muted/30 animate-fade-in"
              >
                <td className="px-5 py-4">
                  <p className="font-medium">
                    {p.name}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {p.category}
                  </p>
                </td>

                <td className="px-3 py-4 text-muted-foreground">
                  {clientName(p.clientId)}
                </td>

                <td className="px-3 py-4 text-muted-foreground">
                  {adminName(p.adminId)}
                </td>

                <td className="px-3 py-4">
                  <StatusBadge status={p.status} />
                </td>

                <td className="px-3 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-gradient-primary"
                        style={{
                          width: `${p.progress}%`,
                        }}
                      />
                    </div>

                    <span className="text-xs font-medium">
                      {p.progress}%
                    </span>
                  </div>
                </td>

                <td className="px-3 py-4 text-muted-foreground">
                  {p.deadline}
                </td>

                <td className="px-3 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {isSuper &&
                      p.status ===
                        "pending" && (
                        <>
                          <button
                            title="Approve"
                            onClick={() =>
                              updateProject(
                                p.id,
                                {
                                  status:
                                    "in-progress",
                                }
                              )
                            }
                            className="rounded-lg p-1.5 text-success hover:bg-success/10"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>

                          <button
                            title="Tolak"
                            onClick={() =>
                              updateProject(
                                p.id,
                                {
                                  status:
                                    "on-hold",
                                }
                              )
                            }
                            className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}

                    {canEdit && (
                      <button
                        title="Update Progress"
                        onClick={() =>
                          setEditing(p)
                        }
                        className="rounded-lg p-1.5 text-primary hover:bg-primary-soft"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}

                    {isSuper && (
                      <button
                        title="Hapus"
                        onClick={() =>
                          setConfirmDel(p)
                        }
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

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Buat Project
              </h2>

              <button
                onClick={() =>
                  setCreateOpen(false)
                }
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                placeholder="Nama Project"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm"
              />

              <input
                placeholder="Kategori"
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category:
                      e.target.value,
                  })
                }
                className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm"
              />

              <textarea
                placeholder="Deskripsi"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description:
                      e.target.value,
                  })
                }
                className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm"
              />

              <input
                type="date"
                value={form.deadline}
                onChange={(e) =>
                  setForm({
                    ...form,
                    deadline:
                      e.target.value,
                  })
                }
                className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm"
              />

              <select
                value={form.clientId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    clientId:
                      e.target.value,
                  })
                }
                className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm"
              >
                <option value="">
                  Pilih Client
                </option>

                {clientUsers.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                  >
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={form.adminId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    adminId:
                      e.target.value,
                  })
                }
                className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm"
              >
                <option value="">
                  Pilih Admin
                </option>

                {admins.map((a) => (
                  <option
                    key={a.id}
                    value={a.id}
                  >
                    {a.name}
                  </option>
                ))}
              </select>

              <button
                onClick={
                  handleCreateProject
                }
                className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Simpan Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}