import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, type ReactNode } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  MessageSquare,
  User,
  BarChart3,
  Users,
  FileBox,
  LogOut,
  Menu,
  X,
  Search,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  logout,
  useCurrentUser,
  roleLabel,
  type Role,
  useUsers,
} from "@/lib/auth";

import { useProjects } from "@/lib/project-store";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const clientNav: NavItem[] = [
  { to: "/client", label: "Dashboard", icon: LayoutDashboard },
  { to: "/client/projects", label: "Project Saya", icon: FolderKanban },
  { to: "/client/calendar", label: "Kalender", icon: Calendar },
  { to: "/client/chat", label: "Discussion", icon: MessageSquare },
  { to: "/client/profile", label: "Profile", icon: User },
];

const adminNav: NavItem[] = [
  { to: "/admin", label: "Analytics", icon: LayoutDashboard },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/files", label: "Files", icon: FileBox },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/chat", label: "Discussion", icon: MessageSquare },
];

const superAdminExtras: NavItem[] = [
  { to: "/admin/users", label: "User Management", icon: ShieldCheck },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

type SearchResult = {
  id: string;
  label: string;
  sub: string;
  type: "project" | "user" | "file";
  to: string;
};

function useFiles() {
  const { data } = useQuery({
    queryKey: ["files"],
    queryFn: async () => {
      const res = await apiFetch<{ files: any[] }>("/api/files");
      return res.files ?? [];
    },
    staleTime: 10_000,
  });

  return data ?? [];
}

function useWorkspaceName() {
  const { data } = useQuery({
    queryKey: ["workspace-settings"],
    queryFn: async () => {
      const res = await apiFetch<{ workspace: { name: string } }>(
        "/api/settings"
      );

      return res.workspace?.name ?? "ProjectFlow";
    },

    staleTime: 30_000,
  });

  return data ?? "ProjectFlow";
}

function GlobalSearch({ role }: { role: Role }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const projects = useProjects();
  const users = useUsers();
  const files = useFiles();

  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handler);

    return () =>
      document.removeEventListener("mousedown", handler);
  }, []);

  const results: SearchResult[] = [];

  if (q.trim().length >= 1) {
    const lower = q.toLowerCase();

    projects
      .filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          (p.clientId ?? "").toLowerCase().includes(lower) ||
          p.category.toLowerCase().includes(lower)
      )
      .slice(0, 4)
      .forEach((p) =>
        results.push({
          id: "p-" + p.id,
          label: p.name,
          sub: `${p.clientId ?? "-"} · ${p.category}`,
          type: "project",
          to:
            role === "client"
              ? "/client/projects"
              : "/admin/projects",
        })
      );

    files
      .filter(
        (f: any) =>
          f.name.toLowerCase().includes(lower) ||
          f.type.toLowerCase().includes(lower)
      )
      .slice(0, 4)
      .forEach((f: any) =>
        results.push({
          id: "f-" + f.id,
          label: f.name,
          sub: `${f.size} · ${f.date}`,
          type: "file",
          to: "/admin/files",
        })
      );

    if (role === "super_admin") {
      users
        .filter(
          (u) =>
            u.name.toLowerCase().includes(lower) ||
            u.email.toLowerCase().includes(lower)
        )
        .slice(0, 3)
        .forEach((u) =>
          results.push({
            id: "u-" + u.id,
            label: u.name,
            sub: `${u.email} · ${u.role}`,
            type: "user",
            to: "/admin/users",
          })
        );
    }
  }

  const iconFor = (type: SearchResult["type"]) => {
    if (type === "project")
      return <FolderKanban className="h-3.5 w-3.5" />;

    if (type === "file")
      return <FileBox className="h-3.5 w-3.5" />;

    return <Users className="h-3.5 w-3.5" />;
  };

  const colorFor = (type: SearchResult["type"]) => {
    if (type === "project")
      return "bg-primary/10 text-primary";

    if (type === "file")
      return "bg-success/10 text-success";

    return "bg-info/10 text-info";
  };

  return (
    <div
      ref={ref}
      className="relative hidden max-w-md flex-1 md:block"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Cari project, file, atau anggota..."
        className="w-full rounded-xl border border-input bg-card py-2 pl-9 pr-3 text-sm shadow-soft outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
      />

      {open && q.trim().length >= 1 && (
        <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-card">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Tidak ada hasil untuk{" "}
              <span className="font-medium text-foreground">
                {q}
              </span>
            </div>
          ) : (
            <ul className="max-h-72 divide-y divide-border overflow-y-auto">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => {
                      setQ("");
                      setOpen(false);
                      navigate({ to: r.to });
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-muted"
                  >
                    <div
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-semibold",
                        colorFor(r.type)
                      )}
                    >
                      {iconFor(r.type)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {r.label}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {r.sub}
                      </p>
                    </div>

                    <span className="ml-auto shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">
                      {r.type === "project"
                        ? "Project"
                        : r.type === "file"
                        ? "File"
                        : "User"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function AppShell({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const user = useCurrentUser();

  const workspaceName = useWorkspaceName();

  const nav =
    role === "client"
      ? clientNav
      : role === "super_admin"
      ? [...adminNav, ...superAdminExtras]
      : adminNav;

  const [open, setOpen] = useState(false);

  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const navigate = useNavigate();

  const base = role === "client" ? "/client" : "/admin";

  const isActive = (to: string) =>
    to === base
      ? pathname === to
      : pathname.startsWith(to);

  const settingsTo =
    role === "client"
      ? "/client/profile"
      : "/admin/settings";

  /* FIX HEADER */
  const hideHeader =
    pathname.includes("/projects");

  const Sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 px-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
          <span className="text-sm font-bold">PM</span>
        </div>

        <div className="leading-tight">
          <p className="text-sm font-semibold">
            {workspaceName}
          </p>

          <p className="text-[11px] text-muted-foreground">
            {roleLabel[role]} workspace
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map((item) => {
          const active = isActive(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={async () => {
            await logout();
            navigate({ to: "/login" });
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground"
        >
          <LogOut className="h-[18px] w-[18px]" />

          Keluar
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-gradient-soft">
      <div className="sticky top-0 hidden h-screen lg:block">
        {Sidebar}
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="absolute inset-y-0 left-0 animate-fade-in">
            {Sidebar}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">

        {!hideHeader && (
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">

            <button
              className="rounded-lg p-2 hover:bg-muted lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <GlobalSearch role={role} />

            <div className="ml-auto flex items-center gap-2">
              <Link
                to={settingsTo}
                className={cn(
                  "rounded-lg p-2 hover:bg-muted",
                  pathname.startsWith(settingsTo) &&
                    "bg-muted text-foreground"
                )}
              >
                <Settings className="h-5 w-5" />
              </Link>

              <div className="ml-1 flex items-center gap-2 rounded-xl border border-border bg-card px-2 py-1 shadow-soft">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-primary text-xs font-semibold text-primary-foreground">
                  {user?.initials ?? "ME"}
                </div>

                <div className="hidden text-left leading-tight sm:block">
                  <p className="text-xs font-semibold">
                    {user?.name ?? "Tamu"}
                  </p>

                  <p className="text-[10px] text-muted-foreground">
                    {roleLabel[role]}
                  </p>
                </div>
              </div>
            </div>

            <button
              className="rounded-lg p-2 hover:bg-muted lg:hidden"
              onClick={() => setOpen(false)}
              aria-hidden
            >
              <X className="h-5 w-5 opacity-0" />
            </button>
          </header>
        )}

        <main className="animate-fade-in flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}