import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminMediaQueryOptions, adminDeleteMedia } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Trash2, Copy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/media")({
  head: () => ({ meta: [{ title: "Media — RIBALI Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => <AdminShell><MediaPage /></AdminShell>,
});

function MediaPage() {
  const { data: files = [], isLoading } = useQuery(adminMediaQueryOptions());
  const qc = useQueryClient();
  const del = useServerFn(adminDeleteMedia);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const delMutation = useMutation({
    mutationFn: (name: string) => del({ data: { name } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success("File deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage.from("media").upload(safeName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      toast.success(`Uploaded ${safeName}`);
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
      void ext;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">Storage</div>
          <h1 className="text-3xl font-display mt-1">Media library</h1>
          <p className="text-sm text-ink/60 mt-2">Upload photography and reference imagery.</p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading…" : "Upload image"}
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="text-sm text-ink/50">Loading…</div>
      ) : files.length === 0 ? (
        <Card className="p-6 text-sm text-ink/60">No files yet.</Card>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {files.map((f) => (
            <Card key={f.name} className="overflow-hidden group">
              <div className="aspect-square bg-ink/5 overflow-hidden">
                <img src={f.url} alt={f.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-3">
                <div className="text-xs truncate" title={f.name}>{f.name}</div>
                <div className="text-[10px] text-ink/50">{(f.size / 1024).toFixed(1)} KB</div>
                <div className="mt-2 flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => {
                    navigator.clipboard.writeText(f.url);
                    toast.success("URL copied");
                  }}><Copy className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => confirm(`Delete ${f.name}?`) && delMutation.mutate(f.name)}>
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
