import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { Mail, Phone, MapPin, Briefcase } from "lucide-react";

export const Route = createFileRoute("/client/profile")({
  head: () => ({ meta: [{ title: "Profile — ProjectFlow" }] }),
  component: Profile,
});

function Profile() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Profile" description="Kelola informasi akun Anda." />
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="h-32 bg-gradient-primary" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="grid h-24 w-24 place-items-center rounded-2xl border-4 border-card bg-gradient-primary text-2xl font-bold text-primary-foreground shadow-card">RA</div>
              <div className="pb-1">
                <h2 className="text-xl font-semibold">Rangga Adi</h2>
                <p className="text-sm text-muted-foreground">Product Owner · Acme Corp</p>
              </div>
            </div>
            <button className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft">Edit Profile</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="text-base font-semibold">Informasi Kontak</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> rangga@acme.id</li>
            <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /> +62 812 3456 7890</li>
            <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /> Jakarta, Indonesia</li>
            <li className="flex items-center gap-3"><Briefcase className="h-4 w-4 text-primary" /> Acme Corp</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="text-base font-semibold">Preferensi</h3>
          <div className="mt-4 space-y-4 text-sm">
            {["Email Notifikasi", "Push Notifikasi", "Newsletter mingguan"].map(p => (
              <label key={p} className="flex items-center justify-between rounded-xl border border-border p-3">
                <span>{p}</span>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
