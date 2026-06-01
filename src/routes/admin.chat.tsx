import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useUsers, getCurrentUser } from "@/lib/auth";
import { useVisibleProjects } from "@/lib/project-store";
import { Send, Paperclip, Search, MessageSquareOff } from "lucide-react";

export const Route = createFileRoute("/admin/chat")({
  head: () => ({ meta: [{ title: "Discussion — ProjectFlow" }] }),
  component: AdminChat,
});

type Message = {
  id: number;
  user: string;
  initials: string;
  color: string;
  text: string;
  time: string;
  senderId: string;
};

function convoKey(a: string, b: string) {
  return `pf_chat_${[a, b].sort().join("_")}`;
}

function loadMessages(a: string, b: string): Message[] {
  try {
    const raw = localStorage.getItem(convoKey(a, b));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveMessages(a: string, b: string, msgs: Message[]) {
  localStorage.setItem(convoKey(a, b), JSON.stringify(msgs));
}

function AdminChat() {
  const me = getCurrentUser();
  const users = useUsers();
  // useVisibleProjects sudah filter project.adminId === me.id untuk role admin
  const myProjects = useVisibleProjects();
  const bottomRef = useRef<HTMLDivElement>(null);

  const isSuper = me?.role === "super_admin";

  // Super Admin: tampilkan semua admin sebagai staff
  const staffContacts = isSuper
    ? users.filter((u) => u.role === "admin")
    : users.filter((u) => u.role === "admin" && u.id !== me?.id);

  // Super Admin: semua client. Admin: hanya client dari project yang di-assign ke dia
  const assignedClientIds = isSuper
    ? [...new Set(users.filter((u) => u.role === "client").map((u) => u.id))]
    : [...new Set(myProjects.map((p) => p.clientId).filter(Boolean))];

  const clientContacts = assignedClientIds
    .map((cid) => users.find((u) => u.id === cid))
    .filter(Boolean) as typeof users;

  // Super Admin juga lihat dirinya sendiri tidak perlu kontak internal
  const superAdmin = !isSuper ? users.find((u) => u.role === "super_admin") : null;

  const allContacts = [
    ...(superAdmin ? [superAdmin] : []),
    ...staffContacts,
    ...clientContacts,
  ];

  const [selectedId, setSelectedId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!selectedId && allContacts.length > 0) {
      setSelectedId(allContacts[0].id);
    }
  }, [allContacts.length]);

  const selected = allContacts.find((c) => c.id === selectedId);

  const filterByQ = (list: typeof users) =>
    !q ? list : list.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));

  const filteredSuperAdmin = superAdmin && (!q || superAdmin.name.toLowerCase().includes(q.toLowerCase()))
    ? [superAdmin] : [];
  const filteredStaff = filterByQ(staffContacts);
  const filteredClients = filterByQ(clientContacts);

  useEffect(() => {
    if (!me || !selectedId) return;
    setMessages(loadMessages(me.id, selectedId));
  }, [selectedId, me?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!me || !selectedId) return;
    const handler = (e: StorageEvent) => {
      if (e.key === convoKey(me.id, selectedId)) {
        setMessages(loadMessages(me.id, selectedId));
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [selectedId, me?.id]);

  const send = () => {
    if (!input.trim() || !me || !selectedId) return;
    const msg: Message = {
      id: Date.now(),
      user: me.name,
      initials: me.initials,
      color: me.color,
      text: input.trim(),
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      senderId: me.id,
    };
    const updated = [...messages, msg];
    saveMessages(me.id, selectedId, updated);
    setMessages(updated);
    setInput("");
  };

  const getSubtitle = (c: (typeof users)[0]) => {
    if (c.role === "super_admin") return "Super Admin";
    if (c.role === "admin") return "Admin";
    // Untuk client: tampilkan nama project yang terhubung
    const projectNames = myProjects
      .filter((p) => p.clientId === c.id)
      .map((p) => p.name)
      .join(", ");
    return projectNames || "Client";
  };

  const ContactItem = ({ c }: { c: (typeof users)[0] }) => (
    <li>
      <button
        onClick={() => setSelectedId(c.id)}
        className={`flex w-full items-center gap-3 border-l-2 p-3 text-left transition ${
          selectedId === c.id
            ? "border-primary bg-primary-soft"
            : "border-transparent hover:bg-muted"
        }`}
      >
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white"
          style={{ background: c.color }}
        >
          {c.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{c.name}</p>
          <p className="truncate text-xs text-muted-foreground">{getSubtitle(c)}</p>
        </div>
      </button>
    </li>
  );

  const SectionLabel = ({ label }: { label: string }) => (
    <li className="px-3 pt-3 pb-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </li>
  );

  // Untuk admin yang belum di-assign ke project manapun
  const adminHasNoClients = !isSuper && clientContacts.length === 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Discussion"
        description="Komunikasi dengan tim dan client."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-border bg-card shadow-soft">
          <div className="border-b border-border p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari kontak..."
                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>

          <ul className="max-h-[60vh] overflow-y-auto">
            {/* Internal: Super Admin (hanya untuk non-super_admin) */}
            {filteredSuperAdmin.length > 0 && (
              <>
                <SectionLabel label="Internal" />
                {filteredSuperAdmin.map((c) => <ContactItem key={c.id} c={c} />)}
              </>
            )}

            {/* Staff: semua admin */}
            {filteredStaff.length > 0 && (
              <>
                <SectionLabel label="Staff" />
                {filteredStaff.map((c) => <ContactItem key={c.id} c={c} />)}
              </>
            )}

            {/* Clients: hanya yang terhubung via project */}
            {filteredClients.length > 0 && (
              <>
                <SectionLabel label="Clients" />
                {filteredClients.map((c) => <ContactItem key={c.id} c={c} />)}
              </>
            )}

            {/* Admin belum di-assign ke client manapun */}
            {!isSuper && filteredClients.length === 0 && !q && (
              <li className="px-3 pt-3 pb-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Clients
                </p>
                <p className="mt-2 px-1 pb-3 text-xs text-muted-foreground">
                  Belum ada client yang di-assign ke kamu.
                </p>
              </li>
            )}

            {/* Tidak ada hasil search */}
            {filteredSuperAdmin.length === 0 &&
              filteredStaff.length === 0 &&
              filteredClients.length === 0 &&
              q && (
                <li className="px-4 py-8 text-center text-xs text-muted-foreground">
                  Tidak ada kontak ditemukan.
                </li>
              )}
          </ul>
        </aside>

        <section className="flex h-[70vh] flex-col rounded-2xl border border-border bg-card shadow-soft">
          {/* Admin belum di-assign sama sekali */}
          {adminHasNoClients && !selected ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-6">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted">
                <MessageSquareOff className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Belum terhubung ke client</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Kamu belum di-assign ke project manapun. Hubungi Super Admin untuk mendapatkan akses client.
              </p>
            </div>
          ) : selected ? (
            <>
              <div className="border-b border-border p-4">
                <p className="font-semibold">{selected.name}</p>
                <p className="text-xs text-muted-foreground">
                  {getSubtitle(selected)} ·{" "}
                  {selected.status === "active" ? "aktif" : "nonaktif"}
                </p>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {messages.length === 0 && (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Belum ada pesan. Mulai percakapan!
                  </div>
                )}
                {messages.map((m) => {
                  const isMe = m.senderId === me?.id;
                  return (
                    <div key={m.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                      <div
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white"
                        style={{ background: m.color }}
                      >
                        {m.initials}
                      </div>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                          isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {!isMe && (
                          <p className="mb-0.5 text-xs font-semibold opacity-70">{m.user}</p>
                        )}
                        <p>{m.text}</p>
                        <p className={`mt-1 text-[10px] ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {m.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="flex items-center gap-2 border-t border-border p-3">
                <button className="rounded-lg p-2 hover:bg-muted">
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Tulis pesan..."
                  className="flex-1 rounded-xl border border-input bg-background py-2.5 px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
                <button
                  onClick={send}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Pilih kontak untuk memulai percakapan.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}