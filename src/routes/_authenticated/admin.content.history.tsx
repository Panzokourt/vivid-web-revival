import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminRecentChangesQueryOptions, adminRestoreBlockVersion } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/content.history")({
  head: () => ({ meta: [{ title: "Ιστορικό — RIBALI Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => <AdminShell><HistoryPage /></AdminShell>,
});

function HistoryPage() {
  const { data: rows = [], isLoading } = useQuery(adminRecentChangesQueryOptions());
  const qc = useQueryClient();
  const restore = useServerFn(adminRestoreBlockVersion);

  const restoreMutation = useMutation({
    mutationFn: (version_id: string) => restore({ data: { version_id } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "page_blocks"] });
      await qc.invalidateQueries({ queryKey: ["admin", "recent_changes"] });
      toast.success("Επαναφορά έγινε");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Η επαναφορά απέτυχε"),
  });

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">Content</div>
          <h1 className="text-3xl font-display mt-1">Πρόσφατες αλλαγές</h1>
          <p className="text-sm text-ink/60 mt-2">Οι τελευταίες 100 εκδόσεις σε όλα τα blocks.</p>
        </div>
        <Link to="/admin/content"><Button variant="outline">← Πίσω</Button></Link>
      </header>

      {isLoading ? (
        <div className="text-sm text-ink/50">Φόρτωση…</div>
      ) : rows.length === 0 ? (
        <Card className="p-6 text-sm text-ink/60">Καμία αλλαγή ακόμη.</Card>
      ) : (
        <div className="grid gap-2">
          {rows.map((r) => (
            <Card key={r.id} className="p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{r.page_slug} / {r.block_key}</span>
                  <span className="font-mono text-xs text-ink/50">v{r.version}</span>
                  {r.published ? <Badge>δημοσιευμένη</Badge> : <Badge variant="outline">πρόχειρη</Badge>}
                </div>
                <div className="text-xs text-ink/60 mt-1 truncate">
                  {new Date(r.created_at).toLocaleString("el-GR")}
                  {r.created_by_email && <> · {r.created_by_email}</>}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => confirm(`Επαναφορά της έκδοσης v${r.version} του ${r.block_key};`) && restoreMutation.mutate(r.id)}
                disabled={restoreMutation.isPending}
              >
                <RotateCcw className="h-4 w-4 mr-1" /> Επαναφορά
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
