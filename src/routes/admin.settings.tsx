import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";

import { PageHeader } from "@/components/shared/PageHeader";

import {
  getCurrentUser,
  useCurrentUser,
  useUserActions,
} from "@/lib/auth";

import { apiFetch } from "@/lib/api";

import {
  Globe,
  User,
  Save,
  LayoutPanelTop,
} from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [{ title: "Settings — ProjectFlow" }],
  }),

  beforeLoad: () => {
    if (typeof window === "undefined") return;

    const u = getCurrentUser();

    if (!u) throw redirect({ to: "/login" });

    if (u.role !== "super_admin")
      throw redirect({ to: "/admin" });
  },

  component: SettingsPage,
});

type SectionId =
  | "profile"
  | "workspace"
  | "loginpage";

const navItems: {
  id: SectionId;
  icon: React.ElementType;
  label: string;
}[] = [
  {
    id: "profile",
    icon: User,
    label: "Profile",
  },

  {
    id: "workspace",
    icon: Globe,
    label: "Workspace",
  },

  {
    id: "loginpage",
    icon: LayoutPanelTop,
    label: "Login Page",
  },
];

/* ───────────────────────────────────────────── */

function useToast() {

  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const show = (
    type: "success" | "error",
    msg: string
  ) => {

    setToast({ type, msg });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return { toast, show };
}

function Toast({
  toast,
}: {
  toast: {
    type: "success" | "error";
    msg: string;
  } | null;
}) {

  if (!toast) return null;

  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm font-medium ${
        toast.type === "success"
          ? "border border-green-200 bg-green-50 text-green-700"
          : "border border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {toast.msg}
    </div>
  );
}

/* ───────────────────────────────────────────── */

function SettingsPage() {

  const [active, setActive] =
    useState<SectionId>("profile");

  const user = useCurrentUser();

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      <PageHeader
        title="Settings"
        description="Pengaturan sistem khusus Super Admin."
      />

      <div className="flex min-h-[520px] gap-4 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">

        <nav className="flex w-52 shrink-0 flex-col gap-0.5 border-r border-border bg-muted/30 p-3">

          {navItems.map((item) => {

            const Icon = item.icon;

            const isActive =
              active === item.id;

            return (
              <button
                key={item.id}
                onClick={() =>
                  setActive(item.id)
                }
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-card font-medium text-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />

                {item.label}

              </button>
            );
          })}

        </nav>

        <div className="flex-1 overflow-auto p-6">

          {active === "profile" && (
            <ProfileSection user={user} />
          )}

          {active === "workspace" && (
            <WorkspaceSection />
          )}

          {active === "loginpage" && (
            <LoginPageSection />
          )}

        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────── */

function ProfileSection({
  user,
}: {
  user: ReturnType<typeof useCurrentUser>;
}) {

  const [name, setName] = useState(
    user?.name ?? ""
  );

  const [email, setEmail] = useState(
    user?.email ?? ""
  );

  const [loading, setLoading] =
    useState(false);

  const { toast, show } = useToast();

  const { updateUser } =
    useUserActions();

  const handleSave = async () => {

    if (!user) return;

    setLoading(true);

    try {

      await updateUser(user.id, {
        name,
        email,
      });

      show(
        "success",
        "Profil berhasil disimpan."
      );

    } catch (err: any) {

      show(
        "error",
        err?.message ??
          "Gagal menyimpan profil."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="space-y-6">

      <SectionHeader
        title="Profile"
        desc="Kelola informasi akun."
      />

      <Toast toast={toast} />

      <div className="grid grid-cols-2 gap-4">

        <ControlledField
          label="Nama"
          value={name}
          onChange={setName}
        />

        <ControlledField
          label="Email"
          value={email}
          onChange={setEmail}
        />

      </div>

      <div className="flex justify-end">

        <SaveButton
          onClick={handleSave}
          loading={loading}
        />

      </div>

    </div>
  );
}

/* ───────────────────────────────────────────── */

function WorkspaceSection() {

  const [wsName, setWsName] =
    useState("");

  const [domain, setDomain] =
    useState("");

  const [desc, setDesc] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const { toast, show } = useToast();

  useEffect(() => {

    apiFetch("/api/settings")
      .then((res: any) => {

        setWsName(
          res.workspace?.name ??
            "ProjectFlow"
        );

        setDomain(
          res.workspace?.domain ??
            "projectflow.app"
        );

        setDesc(
          res.workspace?.description ??
            ""
        );

      });

  }, []);

  const handleSave = async () => {

    setLoading(true);

    try {

      await apiFetch(
        "/api/settings/workspace",
        {
          method: "PATCH",

          body: JSON.stringify({
            name: wsName,
            domain,
            description: desc,
          }),
        }
      );

      show(
        "success",
        "Workspace berhasil disimpan."
      );

    } catch (err: any) {

      show(
        "error",
        err?.message ??
          "Gagal menyimpan workspace."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="space-y-6">

      <SectionHeader
        title="Workspace"
        desc="Branding workspace."
      />

      <Toast toast={toast} />

      <div className="grid grid-cols-2 gap-4">

        <ControlledField
          label="Nama Workspace"
          value={wsName}
          onChange={setWsName}
        />

        <ControlledField
          label="Domain"
          value={domain}
          onChange={setDomain}
        />

      </div>

      <ControlledField
        label="Deskripsi"
        value={desc}
        onChange={setDesc}
      />

      <div className="flex justify-end">

        <SaveButton
          onClick={handleSave}
          loading={loading}
        />

      </div>

    </div>
  );
}

/* ───────────────────────────────────────────── */

function LoginPageSection() {

  const [loginTitle, setLoginTitle] =
    useState(
      "Selamat datang kembali"
    );

  const [loginSubtitle, setLoginSubtitle] =
    useState(
      "Masuk untuk memantau dan mengelola project Anda."
    );

  const [heroTitle, setHeroTitle] =
    useState(
      "Pantau setiap progress project Anda dalam satu dashboard modern."
    );

  const [heroSubtitle, setHeroSubtitle] =
    useState(
      "Realtime updates, diskusi tim, file management, dan analytics — semua dalam workspace yang clean dan cepat."
    );

  const [brandName, setBrandName] =
    useState("ProjectFlow");

  const [topBadge, setTopBadge] =
    useState(
      "Project Management, simplified"
    );

  const [statProjects, setStatProjects] =
    useState("24");

  const [statOntime, setStatOntime] =
    useState("98%");

  const [statTasks, setStatTasks] =
    useState("12k");

  const [footerText, setFooterText] =
    useState(
      "© 2026 ProjectFlow. Crafted for modern teams."
    );

  const [loading, setLoading] =
    useState(false);

  const { toast, show } = useToast();

  useEffect(() => {

    apiFetch("/api/settings/login-page")
      .then((res: any) => {

        setLoginTitle(
          res.login_title ??
            "Selamat datang kembali"
        );

        setLoginSubtitle(
          res.login_subtitle ??
            "Masuk untuk memantau dan mengelola project Anda."
        );

        setHeroTitle(
          res.hero_title ??
            "Pantau setiap progress project Anda dalam satu dashboard modern."
        );

        setHeroSubtitle(
          res.hero_subtitle ??
            "Realtime updates, diskusi tim, file management, dan analytics — semua dalam workspace yang clean dan cepat."
        );

        setBrandName(
          res.brand_name ??
            "ProjectFlow"
        );

        setTopBadge(
          res.top_badge ??
            "Project Management, simplified"
        );

        setStatProjects(
          res.stat_projects ??
            "24"
        );

        setStatOntime(
          res.stat_ontime ??
            "98%"
        );

        setStatTasks(
          res.stat_tasks ??
            "12k"
        );

        setFooterText(
          res.footer_text ??
            "© 2026 ProjectFlow. Crafted for modern teams."
        );

      })
      .catch(() => {});

  }, []);

  const handleSave = async () => {

    setLoading(true);

    try {

      await apiFetch(
        "/api/settings/login-page",
        {
          method: "PATCH",

          body: JSON.stringify({

            login_title:
              loginTitle,

            login_subtitle:
              loginSubtitle,

            hero_title:
              heroTitle,

            hero_subtitle:
              heroSubtitle,

            brand_name:
              brandName,

            top_badge:
              topBadge,

            stat_projects:
              statProjects,

            stat_ontime:
              statOntime,

            stat_tasks:
              statTasks,

            footer_text:
              footerText,

          }),
        }
      );

      show(
        "success",
        "Login page berhasil disimpan."
      );

    } catch (err: any) {

      show(
        "error",
        err?.message ??
          "Gagal menyimpan."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="space-y-6">

      <SectionHeader
        title="Login Page"
        desc="Atur semua isi halaman login."
      />

      <Toast toast={toast} />

      <div className="grid grid-cols-2 gap-4">

        <ControlledField
          label="Brand Name"
          value={brandName}
          onChange={setBrandName}
        />

        <ControlledField
          label="Top Badge"
          value={topBadge}
          onChange={setTopBadge}
        />

      </div>

      <div className="grid grid-cols-2 gap-4">

        <ControlledField
          label="Login Title"
          value={loginTitle}
          onChange={setLoginTitle}
        />

        <ControlledField
          label="Login Subtitle"
          value={loginSubtitle}
          onChange={
            setLoginSubtitle
          }
        />

      </div>

      <ControlledField
        label="Hero Title"
        value={heroTitle}
        onChange={setHeroTitle}
      />

      <ControlledField
        label="Hero Subtitle"
        value={heroSubtitle}
        onChange={
          setHeroSubtitle
        }
      />

      <div className="grid grid-cols-3 gap-4">

        <ControlledField
          label="Projects Stat"
          value={statProjects}
          onChange={
            setStatProjects
          }
        />

        <ControlledField
          label="On-time Stat"
          value={statOntime}
          onChange={
            setStatOntime
          }
        />

        <ControlledField
          label="Tasks Stat"
          value={statTasks}
          onChange={
            setStatTasks
          }
        />

      </div>

      <ControlledField
        label="Footer Text"
        value={footerText}
        onChange={setFooterText}
      />

      <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3">

        <p className="text-sm font-semibold">
          Preview
        </p>

        <div className="space-y-1">

          <p className="text-lg font-bold">
            {loginTitle}
          </p>

          <p className="text-sm text-muted-foreground">
            {loginSubtitle}
          </p>

        </div>

        <div className="space-y-2 pt-4">

          <p className="text-2xl font-bold leading-tight">
            {heroTitle}
          </p>

          <p className="text-sm text-muted-foreground">
            {heroSubtitle}
          </p>

        </div>

      </div>

      <div className="flex justify-end">

        <SaveButton
          onClick={handleSave}
          loading={loading}
        />

      </div>

    </div>
  );
}

/* ───────────────────────────────────────────── */

function SectionHeader({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {

  return (
    <div>

      <h2 className="text-base font-semibold">
        {title}
      </h2>

      <p className="mt-0.5 text-sm text-muted-foreground">
        {desc}
      </p>

    </div>
  );
}

function ControlledField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {

  return (
    <div className="space-y-1.5">

      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm transition focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

    </div>
  );
}

function SaveButton({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) {

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
    >
      <Save className="h-4 w-4" />

      {loading
        ? "Menyimpan..."
        : "Simpan perubahan"}

    </button>
  );
}