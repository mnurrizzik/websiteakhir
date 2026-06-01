import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useUsers, getCurrentUser } from "@/lib/auth";
import { useVisibleProjects } from "@/lib/project-store";
import { Send, Paperclip, Search } from "lucide-react";

export const Route = createFileRoute("/client/chat")({
  head: () => ({ meta: [{ title: "Discussion — ProjectFlow" }] }),
  component: ClientChat,
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
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(convoKey(a, b));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveMessages(a: string, b: string, msgs: Message[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(convoKey(a, b), JSON.stringify(msgs));
}

function ClientChat() {
  const me = getCurrentUser();
  const users = useUsers();
  const myProjects = useVisibleProjects();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Admin yang di-assign ke project client
  const adminIds = [...new Set(
    myProjects
      .filter((p) => p.adminId)
      .map((p) => p.adminId as string)
  )];
  const assignedAdmins = adminIds
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean) as typeof users;

  // Super admin selalu muncul sebagai kontak
  const superAdmins = users.filter((u) => u.role === "super_admin");

  // Gabungkan: super admin di atas, lalu admin yang di-assign
  const contacts = [...superAdmins, ...assignedAdmins];

  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!selectedContactId && contacts.length > 0) {
      setSelectedContactId(contacts[0].id);
    }
  }, [contacts.length]);

  const selected = contacts.find((c) => c.id === selectedContactId);

  const filteredSuperAdmins = superAdmins.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase())
  );
  const filteredAdmins = assignedAdmins.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase())
  );

  useEffect(() => {
    if (!me || !selectedContactId) return;
    setMessages(loadMessages(me.id, selectedContactId));
  }, [selectedContactId, me?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!me || !selectedContactId) return;
    const handler = (e: StorageEvent) => {
      if (e.key === convoKey(me.id, selectedContactId)) {
        setMessages(loadMessages(me.id, selectedContactId));
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [selectedContactId, me?.id]);

  const send = () => {
    if (!input.trim() || !me || !selectedContactId) return;
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
    saveMessages(me.id, selectedContactId, updated);
    setMessages(updated);
    setInput("");
  };

  const ContactItem = ({
    c,
    subtitle,
  }: {
    c: (typeof users)[0];
    subtitle: string;
  }) => (
    <li>
      <button
        onClick={() => setSelectedContactId(c.id)}
        className={`flex w-full items-center gap-3 border-l-2 p-3 text-left transition ${
          selectedContactId === c.id
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
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
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

  const selectedSubtitle = () => {
    if (!selected) return "";
    if (selected.role === "super_admin") return "Super Admin";
    const projectNames = myProjects
      .filter((p) => p.adminId === selected.id)
      .map((p) => p.name)
      .join(", ");
    return `Admin · menangani ${projectNames || "project Anda"}`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Discussion" description="Komunikasi dengan tim project Anda." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar kontak */}
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
            {/* Super Admin */}
            {filteredSuperAdmins.length > 0 && (
              <>
                <SectionLabel label="Internal" />
                {filteredSuperAdmins.map((c) => (
                  <ContactItem key={c.id} c={c} subtitle="Super Admin" />
                ))}
              </>
            )}

            {/* Admin yang di-assign */}
            {filteredAdmins.length > 0 && (
              <>
                <SectionLabel label="Admin Project" />
                {filteredAdmins.map((c) => {
                  const projectNames = myProjects
                    .filter((p) => p.adminId === c.id)
                    .map((p) => p.name)
                    .join(", ");
                  return (
                    <ContactItem key={c.id} c={c} subtitle={projectNames || "Admin"} />
                  );
                })}
              </>
            )}

            {/* Kosong */}
            {filteredSuperAdmins.length === 0 && filteredAdmins.length === 0 && (
              <li className="px-4 py-8 text-center text-xs text-muted-foreground">
                {q ? "Tidak ada kontak ditemukan." : "Belum ada kontak tersedia."}
              </li>
            )}
          </ul>
        </aside>

        {/* Area chat */}
        <section className="flex h-[70vh] flex-col rounded-2xl border border-border bg-card shadow-soft">
          {selected ? (
            <>
              <div className="border-b border-border p-4">
                <p className="font-semibold">{selected.name}</p>
                <p className="text-xs text-muted-foreground">{selectedSubtitle()}</p>
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
                <button disabled className="rounded-lg p-2 text-muted-foreground opacity-40 cursor-not-allowed">
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