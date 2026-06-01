import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { Mail, Phone, MapPin, Briefcase } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/client/profile")({
  head: () => ({ meta: [{ title: "Profile — ProjectFlow" }] }),
  component: ClientProfile,
});

function ClientProfile() {
  const user = getCurrentUser();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Profile" description="Informasi akun Anda." />

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        {/* Cover */}
        <div className="relative h-32 bg-gradient-primary">
          {/* Avatar menempel di bawah cover, rata kiri */}
          <div
            className="absolute -bottom-10 left-6 grid h-20 w-20 place-items-center rounded-2xl border-4 border-card text-xl font-bold text-white shadow-card"
            style={{ background: user?.color ?? "#6366f1" }}
          >
            {user?.initials ?? "?"}
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* Nama & role — diberi margin atas agar tidak ketutup avatar */}
          <div className="mt-12 mb-5">
            <h2 className="text-lg font-semibold">{user?.name ?? "—"}</h2>
            <p className="text-sm text-muted-foreground">
              {user?.role === "client" ? "Client" : (user?.role ?? "—")}
              {user?.company ? ` · ${user.company}` : ""}
            </p>
          </div>

          {/* Info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <h3 className="text-sm font-semibold mb-3">Informasi Kontak</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {user?.email && (
                  <li className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    {user.email}
                  </li>
                )}
                {user?.phone && (
                  <li className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    {user.phone}
                  </li>
                )}
                {user?.location && (
                  <li className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    {user.location}
                  </li>
                )}
                {user?.company && (
                  <li className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-primary shrink-0" />
                    {user.company}
                  </li>
                )}
                {!user?.email && !user?.phone && !user?.location && !user?.company && (
                  <li className="text-xs">Belum ada informasi kontak.</li>
                )}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <h3 className="text-sm font-semibold mb-3">Tentang</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {user?.bio ?? "Belum ada deskripsi."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}