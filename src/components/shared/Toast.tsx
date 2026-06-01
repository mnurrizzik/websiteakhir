import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

// ── Global event bus ──────────────────────────────────────────────────────────
type ToastListener = (toast: Omit<ToastItem, "id">) => void;
const listeners: ToastListener[] = [];

export const toast = {
  success: (title: string, message?: string) => emit({ type: "success", title, message }),
  error:   (title: string, message?: string) => emit({ type: "error",   title, message }),
  warning: (title: string, message?: string) => emit({ type: "warning", title, message }),
  info:    (title: string, message?: string) => emit({ type: "info",    title, message }),
};

function emit(t: Omit<ToastItem, "id">) {
  listeners.forEach((fn) => fn(t));
}

// ── Config ────────────────────────────────────────────────────────────────────
const CONFIG: Record<ToastType, {
  icon: React.ReactNode;
  bar: string;
  iconBg: string;
  iconColor: string;
}> = {
  success: {
    icon: <CheckCircle2 className="h-[18px] w-[18px]" />,
    bar: "bg-emerald-500",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  error: {
    icon: <XCircle className="h-[18px] w-[18px]" />,
    bar: "bg-rose-500",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  warning: {
    icon: <AlertCircle className="h-[18px] w-[18px]" />,
    bar: "bg-amber-500",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  info: {
    icon: <Info className="h-[18px] w-[18px]" />,
    bar: "bg-blue-500",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
};

const DURATION = 4000;

// ── Single Toast Card ─────────────────────────────────────────────────────────
function ToastCard({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const cfg = CONFIG[item.type];

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const start = Date.now();

    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.max(0, 100 - (elapsed / DURATION) * 100));
    }, 16);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(item.id), 380);
    }, DURATION);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(tick);
      clearTimeout(timer);
    };
  }, [item.id, onRemove]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onRemove(item.id), 380);
  };

  return (
    <div
      style={{
        transition: "all 380ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0) scale(1)" : "translateX(110%) scale(0.92)",
        colorScheme: "light",
      }}
      className="relative w-[336px] overflow-hidden rounded-2xl bg-white border border-zinc-100 shadow-[0_4px_24px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)]"
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 h-full w-[3.5px] rounded-l-full ${cfg.bar}`} />

      {/* Body */}
      <div className="flex items-start gap-3 py-3.5 pl-5 pr-4">
        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${cfg.iconBg} ${cfg.iconColor}`}>
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-semibold text-zinc-900 leading-snug">{item.title}</p>
          {item.message && (
            <p className="mt-0.5 text-xs text-zinc-500 leading-relaxed">{item.message}</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="mt-0.5 shrink-0 rounded-lg p-1 text-zinc-300 transition-colors hover:bg-zinc-100 hover:text-zinc-500"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-[3px] bg-zinc-100">
        <div
          className={`h-full ${cfg.bar} opacity-60 transition-[width] duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ── Toast Container — SSR-safe dengan useEffect mount guard ──────────────────
export function ToastContainer() {
  const [mounted, setMounted] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Hanya render portal setelah client-side mount (menghindari SSR document error)
  useEffect(() => {
    setMounted(true);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler: ToastListener = (t) => {
      const id = Math.random().toString(36).slice(2, 9);
      setToasts((prev) => [...prev, { ...t, id }]);
    };
    listeners.push(handler);
    return () => {
      const idx = listeners.indexOf(handler);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  // Jangan render apapun saat SSR
  if (!mounted) return null;

  return createPortal(
    <div className="fixed bottom-5 right-5 z-[99999] flex flex-col-reverse gap-2.5">
      {toasts.map((t) => (
        <ToastCard key={t.id} item={t} onRemove={remove} />
      ))}
    </div>,
    document.body
  );
}