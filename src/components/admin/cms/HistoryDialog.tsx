import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  adminBlockVersionsQueryOptions,
  adminGetBlockVersion,
  adminRestoreBlockVersion,
} from "@/lib/admin.functions";
import { toast } from "sonner";
import { RotateCcw, Eye, ArrowLeft } from "lucide-react";
import { diffLines } from "diff";

type Props = {
  blockId: string;
  onClose: () => void;
  onRestored: () => void;
};

export function HistoryDialog({ blockId, onClose, onRestored }: Props) {
  const { data: versions = [], isLoading } = useQuery(adminBlockVersionsQueryOptions(blockId));
  const [previewId, setPreviewId] = useState<string | null>(null);
  const qc = useQueryClient();
  const restore = useServerFn(adminRestoreBlockVersion);

  const restoreMutation = useMutation({
    mutationFn: (version_id: string) => restore({ data: { version_id } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "page_blocks"] });
      await qc.invalidateQueries({ queryKey: ["admin", "block_versions", blockId] });
      await qc.invalidateQueries({ queryKey: ["admin", "recent_changes"] });
      toast.success("Επαναφορά έγινε");
      onRestored();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Η επαναφορά απέτυχε"),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {previewId && (
              <Button size="sm" variant="ghost" onClick={() => setPreviewId(null)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
              </Button>
            )}
            Ιστορικό εκδόσεων
          </DialogTitle>
        </DialogHeader>

        {previewId ? (
          <VersionPreview versionId={previewId} onRestore={() => restoreMutation.mutate(previewId)} pending={restoreMutation.isPending} />
        ) : isLoading ? (
          <div className="text-sm text-ink/50 py-6 text-center">Φόρτωση…</div>
        ) : versions.length === 0 ? (
          <div className="text-sm text-ink/50 py-6 text-center">Καμία έκδοση.</div>
        ) : (
          <div className="grid gap-2">
            {versions.map((v, i) => (
              <div key={v.id} className="flex items-center gap-3 border border-ink/15 rounded p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-ink/50">v{v.version}</span>
                    {i === 0 && <Badge variant="outline">τρέχουσα</Badge>}
                    {v.published ? <Badge>δημοσιευμένη</Badge> : <Badge variant="outline">πρόχειρη</Badge>}
                  </div>
                  <div className="text-xs text-ink/60 mt-1 truncate">
                    {new Date(v.created_at).toLocaleString("el-GR")}
                    {v.created_by_email && <> · {v.created_by_email}</>}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setPreviewId(v.id)}>
                  <Eye className="h-4 w-4 mr-1" /> Προβολή
                </Button>
                {i !== 0 && (
                  <Button
                    size="sm"
                    onClick={() => {
                      if (confirm(`Επαναφορά της έκδοσης v${v.version};`)) restoreMutation.mutate(v.id);
                    }}
                    disabled={restoreMutation.isPending}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" /> Επαναφορά
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Κλείσιμο</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VersionPreview({ versionId, onRestore, pending }: { versionId: string; onRestore: () => void; pending: boolean }) {
  const get = useServerFn(adminGetBlockVersion);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "block_version", versionId],
    queryFn: () => get({ data: { version_id: versionId } }),
  });

  if (isLoading) return <div className="text-sm text-ink/50 py-6 text-center">Φόρτωση…</div>;
  if (!data) return null;

  return (
    <div className="grid gap-3">
      <div className="text-xs text-ink/60">
        v{data.version} · {new Date(data.created_at).toLocaleString("el-GR")} ·{" "}
        {data.published ? "δημοσιευμένη" : "πρόχειρη"}
      </div>
      <pre className="bg-ink/5 rounded p-3 text-[11px] leading-relaxed max-h-[50vh] overflow-auto whitespace-pre-wrap">
        {JSON.stringify(data.content, null, 2)}
      </pre>
      <div className="flex justify-end">
        <Button onClick={onRestore} disabled={pending}>
          <RotateCcw className="h-4 w-4 mr-1" /> {pending ? "Επαναφορά…" : "Επαναφορά αυτής της έκδοσης"}
        </Button>
      </div>
    </div>
  );
}

// Compact JSON diff between two arbitrary objects (used elsewhere if needed)
export function jsonDiff(a: unknown, b: unknown) {
  return diffLines(JSON.stringify(a, null, 2), JSON.stringify(b, null, 2));
}
