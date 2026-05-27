import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Briefcase, Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { login } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Masuk — ProjectFlow" }, { name: "description", content: "Sistem management data project modern." }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // FIX: submit harus async, dan login() harus di-await
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const u = await login(email.trim(), password);
      if (!u) { setError("Email atau password salah."); return; }
      navigate({ to: u.role === "client" ? "/client" : "/admin" });
    } catch (err: any) {
      setError(err?.message ?? "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        <div className="flex items-center justify-center p-6 sm:p-12">
          <form onSubmit={submit} className="w-full max-w-md space-y-6 animate-slide-up">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight">ProjectFlow</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">Selamat datang kembali</h1>
              <p className="text-sm text-muted-foreground">Masuk untuk memantau dan mengelola project Anda.</p>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Email</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email Anda"
                    className="w-full rounded-xl border border-input bg-card py-2.5 pl-9 pr-3 text-sm shadow-soft outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20" />
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Password</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
                    className="w-full rounded-xl border border-input bg-card py-2.5 pl-9 pr-10 text-sm shadow-soft outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20" />
                  <button type="button" onClick={() => setShow(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-input" /> Ingat saya</label>
                <a href="#" className="font-medium text-primary hover:underline">Lupa password?</a>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-card disabled:opacity-60">
              {loading ? "Memproses..." : "Masuk"}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </form>
        </div>

        <div className="relative hidden overflow-hidden bg-gradient-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4" /> Project Management, simplified
          </div>
          <div className="relative space-y-6">
            <h2 className="text-4xl font-semibold leading-tight">Pantau setiap progress project Anda dalam satu dashboard modern.</h2>
            <p className="max-w-md text-primary-foreground/80">Realtime updates, diskusi tim, file management, dan analytics — semua dalam workspace yang clean dan cepat.</p>
            <div className="grid grid-cols-3 gap-3 max-w-md">
              {[{ k: "24", v: "Projects" }, { k: "98%", v: "On-time" }, { k: "12k", v: "Tasks done" }].map(s => (
                <div key={s.v} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-semibold">{s.k}</p>
                  <p className="text-xs text-primary-foreground/80">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="relative text-xs text-primary-foreground/70">© 2026 ProjectFlow. Crafted for modern teams.</p>
        </div>
      </div>
    </div>
  );
}