import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, getApiToken } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { FileText, Image as ImageIcon, Archive, Upload, Download, Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/files")({
  head: () => ({ meta: [{ title: "File Management — ProjectFlow" }] }),
  component: AdminFiles,
});

export type ApiFile = {
  id: string;
  name: string;
  type: string;
  size: string;
  sizeBytes: number;
  projectId: string | null;
  uploadedBy: string;
  date: string;
  url: string | null;
};

export function useFiles() {
  const { data, isLoading } = useQuery({
    queryKey: ["files"],
    queryFn: async () => {
      const res = await apiFetch<{ files: ApiFile[] }>("/api/files");
      return res.files ?? [];
    },
    staleTime: 5_000,
  });
  return { files: data ?? [], isLoading };
}

const iconFor = (t: string) =>
  t === "Image" ? ImageIcon : t === "ZIP" ? Archive : FileText;

function AdminFiles() {
  const qc = useQueryClient();
  const { files, isLoading } = useFiles();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      await apiFetch<{ file: ApiFile }>("/api/files", { method: "POST", body: form });
      await qc.invalidateQueries({ queryKey: ["files"] });
    } catch (err: any) {
      alert(err?.message ?? "Upload gagal.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus file ini?")) return;
    setDeleting(id);
    try {
      await apiFetch<{ ok: boolean }>(`/api/files/${id}`, { method: "DELETE" });
      await qc.invalidateQueries({ queryKey: ["files"] });
    } catch (err: any) {
      alert(err?.message ?? "Gagal menghapus.");
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (file: ApiFile) => {
    setDownloading(file.id);
    try {
      const token = getApiToken();
      const res = await fetch(`http://127.0.0.1:8000/api/files/${file.id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Gagal download file.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err?.message ?? "Gagal download.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="File Management"
        description="Semua file dari seluruh project."
        actions={
          <>
            <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Mengupload..." : "Upload"}
            </button>
          </>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Memuat file...
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Belum ada file. Upload file pertama!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {files.map((f) => {
            const Icon = iconFor(f.type);
            return (
              <div key={f.id} className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:shadow-card">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 truncate font-medium" title={f.name}>{f.name}</p>
                <p className="text-xs text-muted-foreground">{f.size} · {f.date}</p>
                <div className="mt-4 flex gap-2 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => handleDownload(f)}
                    disabled={downloading === f.id}
                    className="flex-1 rounded-lg border border-border py-1.5 text-xs hover:bg-muted disabled:opacity-50"
                    title="Download"
                  >
                    {downloading === f.id
                      ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" />
                      : <Download className="mx-auto h-3.5 w-3.5" />
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(f.id)}
                    disabled={deleting === f.id}
                    className="flex-1 rounded-lg border border-border py-1.5 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    title="Hapus"
                  >
                    {deleting === f.id
                      ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="mx-auto h-3.5 w-3.5" />
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}