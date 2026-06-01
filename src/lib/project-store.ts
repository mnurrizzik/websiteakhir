import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export type ProjectStatus =
  | "pending"
  | "in-progress"
  | "review"
  | "completed"
  | "on-hold";

export type Project = {
  id: string;
  name: string;
  description: string;
  category: string;
  status: ProjectStatus;
  progress: number;
  deadline: string;
  clientId: string;
  client: string;
  adminId?: string;
  team: {
    name: string;
    initials: string;
    color: string;
  }[];
  clientName?: string;
  adminName?: string;
  timeline?: any[];
  files?: any[];
  messages?: any[];
  activityLog?: any[];
  revisions?: any[];
};

function normalizeStatus(status: string): ProjectStatus {
  switch (status) {
    case "in_progress":
    case "in-progress":
      return "in-progress";
    case "on_hold":
    case "on-hold":
      return "on-hold";
    case "review":
      return "review";
    case "completed":
      return "completed";
    default:
      return "pending";
  }
}

function normalizeProject(project: any): Project {
  return {
    id: String(project.id),
    name: project.name ?? "",
    description: project.description ?? "",
    category: project.category ?? "General",
    status: normalizeStatus(project.status),
    progress: Number(project.progress ?? 0),
    deadline: project.deadline ?? "",
    clientId: String(project.clientId ?? project.client_id ?? ""),
    client: project.client ?? project.clientName ?? project.client_name ?? "",
    adminId: project.adminId
      ? String(project.adminId)
      : project.admin_id
      ? String(project.admin_id)
      : undefined,
    clientName: project.clientName ?? project.client_name ?? project.client ?? "",
    adminName: project.adminName ?? project.admin_name ?? "",
    timeline: project.timeline ?? [],
    files: project.files ?? [],
    messages: project.messages ?? [],
    team: project.team ?? [],
    activityLog: project.activityLog ?? [],
    revisions: project.revisions ?? [],
  };
}

export function useProjects(): Project[] {
  const { data } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await apiFetch<{ projects: unknown[] }>("/api/projects");
      return (response.projects ?? []).map((p) => normalizeProject(p));
    },
    staleTime: 5000,
  });

  return data ?? [];
}

export function useProject(id: string) {
  const projects = useProjects();
  return projects.find((p) => p.id === id);
}

export function useVisibleProjects(): Project[] {
  const projects = useProjects();
  const user = getCurrentUser();

  if (!user) return [];

  if (user.role === "super_admin") {
    return projects;
  }

  if (user.role === "admin") {
    return projects.filter((p) => p.adminId === user.id);
  }

  return projects.filter(
    (p) => p.clientId === user.id || p.clientId === user.clientId
  );
}

export function useProjectActions() {
  const qc = useQueryClient();

  return {
    createProject: async (payload: any) => {
      await apiFetch("/api/projects", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      await qc.invalidateQueries({ queryKey: ["projects"] });
    },

    updateProject: async (id: string, payload: any) => {
      const data = await apiFetch(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      await qc.invalidateQueries({ queryKey: ["projects"] });
      return data;
    },

    deleteProject: async (id: string) => {
      const data = await apiFetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      await qc.invalidateQueries({ queryKey: ["projects"] });
      return data;
    },
  };
}