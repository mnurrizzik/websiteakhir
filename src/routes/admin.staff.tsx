import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useUsers } from "@/lib/auth";
import { projects } from "@/lib/mock-data";
import { Plus, Mail, MoreHorizontal, X, UserPlus } from "lucide-react";

export const Route = createFileRoute("/admin/staff")({
  head: () => ({ meta: [{ title: "Staff Management — ProjectFlow" }] }),
  component: StaffPage,
});

function StaffPage() {
  const users = useUsers();
  const adminUsers = users.filter((u) => u.role === "admin");

  const [staffIds, setStaffIds] = useState<string[]>(
    adminUsers.map((u) => u.id)
  );
  const [open, setOpen] = useState(false);

  const staffList = adminUsers.filter((u) => staffIds.includes(u.id));
  const available = adminUsers.filter((u) => !staffIds.includes(u.id));

  const getActiveProjects = (userId: string) =>
    projects.filter(
      (p) => p.adminId === userId && p.status !== "completed"
    ).length;

  const addStaff = (id: string) => {
    setStaffIds((prev) => [...prev, id]);
    setOpen(false);
  };

  const removeStaff = (id: string) => {
    setStaffIds((prev) => prev.filter((s) => s !== id));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Staff Management"
        description="Kelola tim dan beban kerja."
        actions={
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
          >
            <Plus className="h-4 w-4" /> Tambah Staff
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staffList.length === 0 && (
          <div className="col-span-3 flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
            <UserPlus className="h-10 w-10 opacity-20" />
            <p>Belum ada staff.</p>
            <p>Tambahkan dari akun Admin yang sudah dibuat di User Management.</p>
          </div>
        )}
        {staffList.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:shadow-card animate-slide-up"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="grid h-12 w-12 place-items-center rounded-2xl text-sm font-semibold text-white"
                  style={{ background: s.color }}
                >
                  {s.initials}
                </div>
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                </div>
              </div>
              <button
                onClick={() => removeStaff(s.id)}
                title="Hapus dari staff"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-lg font-semibold">{getActiveProjects(s.id)}</p>
                <p className="text-[11px] text-muted-foreground">Active projects</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-lg font-semibold capitalize">
                  {s.status === "active" ? "Active" : "Inactive"}
                </p>
                <p className="text-[11px] text-muted-foreground">Status</p>
              </div>
            </div>

            <button className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-sm font-medium hover:bg-muted">
              <Mail className="h-4 w-4" /> Kirim pesan
            </button>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card animate-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Tambah Staff</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pilih dari akun Admin yang sudah dibuat di User Management.
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            {available.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>Semua akun Admin sudah jadi staff.</p>
                <p className="mt-1">
                  Buat akun Admin baru di{" "}
                  <span className="font-medium text-foreground">User Management</span> dulu.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {available.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-muted/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="grid h-9 w-9 place-items-center rounded-full text-xs font-semibold text-white"
                        style={{ background: u.color }}
                      >
                        {u.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => addStaff(u.id)}
                      className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition"
                    >
                      + Tambah
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}