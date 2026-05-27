const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";
const TOKEN_KEY = "projectflow_api_token";

export function getApiToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setApiToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    ...(options.headers ? (options.headers as Record<string, string>) : {}),
  };

  const token = getApiToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body != null && !(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      setApiToken(null);
    }
    const message = body && typeof body === "object" && "message" in body ? (body as any).message : response.statusText;
    throw new Error(typeof message === "string" ? message : `Request failed with status ${response.status}`);
  }

  return body as T;
}

export async function seedDemoData() {
  await apiFetch<{ seeded: boolean }>("/api/seed-demo", { method: "POST" });
}
