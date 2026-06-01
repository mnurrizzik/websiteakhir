import { useSyncExternalStore } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, setApiToken } from "@/lib/api";

export type Role = "super_admin" | "admin" | "client";

export type User = {
  id: string;
  email: string;
  password: string; // unused on read; kept for form compatibility
  name: string;
  role: Role;
  initials: string;
  color: string;
  clientId?: string;
  status: "active" | "inactive";
  createdAt: string;
  phone?: string;
  location?: string;
  company?: string;
  bio?: string;
};

const PROFILE_KEY = "pf_profile";

let current: User | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

if (typeof window !== "undefined") {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (raw) current = JSON.parse(raw) as User;
  } catch {
    /* ignore */
  }
}

function setCurrent(u: User | null) {
  current = u;
  if (typeof window !== "undefined") {
    if (u) window.localStorage.setItem(PROFILE_KEY, JSON.stringify(u));
    else window.localStorage.removeItem(PROFILE_KEY);
  }
  emit();
}

export function getCurrentUser() { return current; }

export function useCurrentUser() {
  return useSyncExternalStore(subscribe, () => current, () => current);
}

function normalizeUser(user: any): User {
  return {
    id: String(user.id),
    email: user.email,
    password: "",
    name: user.name,
    role: user.role,
    initials: user.initials,
    color: user.color,
    clientId: user.clientId ?? user.client_id ?? undefined,
    status: user.status as "active" | "inactive",
    createdAt: user.createdAt ?? user.created_at?.slice(0, 10) ?? "",
    phone: user.phone ?? undefined,
    location: user.location ?? undefined,
    company: user.company ?? undefined,
    bio: user.bio ?? undefined,
  };
}

export async function refreshCurrentUser() {
  try {
    const response = await apiFetch<{ user: unknown }>("/api/user");
    const u = response.user ? normalizeUser(response.user) : null;
    setCurrent(u);
    return u;
  } catch {
    setCurrent(null);
    return null;
  }
}

export async function login(email: string, password: string): Promise<User | null> {
  const response = await apiFetch<{ token: string; user: unknown }>("/api/login", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), password }),
  });

  setApiToken(response.token);
  const u = normalizeUser(response.user);
  setCurrent(u);
  return u;
}

export async function logout() {
  try {
    await apiFetch<{ ok: boolean }>("/api/logout", { method: "POST" });
  } finally {
    setApiToken(null);
    setCurrent(null);
  }
}

export function useUsers(): User[] {
  const { data } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await apiFetch<{ users: unknown[] }>("/api/users");
      return (response.users ?? []).map((user) => normalizeUser(user));
    },
    staleTime: 10_000,
  });
  return data ?? [];
}

export function useUserActions() {
  const qc = useQueryClient();

  return {
    createUser: async (input: { email: string; password: string; name: string; role: Role; clientId?: string }) => {
      await apiFetch<{ id: string }>("/api/users", {
        method: "POST",
        body: JSON.stringify({ ...input, clientId: input.clientId ?? null }),
      });
      await qc.invalidateQueries({ queryKey: ["users"] });
    },
    updateUser: async (id: string, patch: Partial<Omit<User, "id">>) => {
      await apiFetch<{ ok: boolean }>(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...patch,
          clientId: patch.clientId ?? null,
        }),
      });
      await qc.invalidateQueries({ queryKey: ["users"] });
      if (current?.id === id) await refreshCurrentUser();
    },
    deleteUser: async (id: string) => {
      await apiFetch<{ ok: boolean }>(`/api/users/${id}`, { method: "DELETE" });
      await qc.invalidateQueries({ queryKey: ["users"] });
    },
  };
}

export const roleLabel: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  client: "Client",
};

export const roleTone: Record<Role, string> = {
  super_admin: "bg-primary text-primary-foreground",
  admin: "bg-info/15 text-info border border-info/20",
  client: "bg-muted text-foreground border border-border",
};