import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  adminPageBlocksQueryOptions,
  adminUpsertPageBlock,
  adminDeletePageBlock,
} from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/content")({
  head: () => ({ meta: [{ title: "Content — RIBALI Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => <AdminShell><ContentPage /></AdminShell>,
});

type Block = {
  id: string;
  page_slug: string;
  block_key: string;
  content: Record<string, unknown>;
  published: boolean;
  updated_at: string;
};

function ContentPage() {
  const { data: blocks = [], isLoading } = useQuery(adminPageBlocksQueryOptions());
  const [editing, setEditing] = useState<Block | null>(null);
  const [open, setOpen] = useState(false);
  const del = useServerFn(adminDeletePageBlock);
  const qc = useQueryClient();

  const delMutation = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "page_blocks"] });
      toast.success("Block deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const grouped = (blocks as Block[]).reduce<Record<string, Block[]>>((acc, b) => {
    (acc[b.page_slug] ??= []).push(b);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">Pages</div>
          <h1 className="text-3xl font-display mt-1">Content blocks</h1>
          <p className="text-sm text-ink/60 mt-2">
            Structured JSON blocks organized by page and key (e.g. <code>home / hero</code>).
          </p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild><Button onClick={() => setEditing(null)}><Plus className="h-4 w-4 mr-2" />New block</Button></DialogTrigger>
          <BlockDialog editing={editing} onDone={() => { setOpen(false); setEditing(null); }} />
        </Dialog>
      </header>

      {isLoading ? (
        <div className="text-sm text-ink/50">Loading…</div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card className="p-6 text-sm text-ink/60">
          No content blocks yet. Create your first one — e.g. <code>page_slug=home, block_key=hero</code> with content
          <code className="mx-1">{'{ "title": "…", "subtitle": "…" }'}</code>.
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([page, items]) => (
            <div key={page}>
              <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50 mb-2">{page}</div>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((b) => {
                  const preview =
                    (b.content as Record<string, unknown>)?.title as string | undefined ??
                    (b.content as Record<string, unknown>)?.eyebrow as string | undefined ??
                    "";
                  return (
                  <Card key={b.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{b.block_key}</div>
                        {preview && (
                          <div className="text-xs text-ink/60 mt-1 line-clamp-2 whitespace-pre-line">{preview}</div>
                        )}
                        <div className="mt-2">
                          {b.published ? <Badge>Published</Badge> : <Badge variant="outline">Draft</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setEditing(b); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => confirm(`Delete ${b.block_key}?`) && delMutation.mutate(b.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                      </div>
                    </div>
                    <pre className="mt-3 text-[11px] leading-relaxed bg-ink/5 rounded p-2 overflow-x-auto max-h-32">{JSON.stringify(b.content, null, 2)}</pre>
                  </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BlockDialog({ editing, onDone }: { editing: Block | null; onDone: () => void }) {
  const upsert = useServerFn(adminUpsertPageBlock);
  const qc = useQueryClient();
  const [pageSlug, setPageSlug] = useState(editing?.page_slug ?? "home");
  const [blockKey, setBlockKey] = useState(editing?.block_key ?? "");
  const [contentJson, setContentJson] = useState(JSON.stringify(editing?.content ?? {}, null, 2));
  const [published, setPublished] = useState(editing?.published ?? true);

  const mutation = useMutation({
    mutationFn: () => {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(contentJson);
      } catch {
        throw new Error("Content must be valid JSON");
      }
      return upsert({ data: { page_slug: pageSlug, block_key: blockKey, content: parsed, published } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "page_blocks"] });
      toast.success(editing ? "Block updated" : "Block created");
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader><DialogTitle>{editing ? "Edit block" : "New block"}</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Page slug</Label><Input required value={pageSlug} onChange={(e) => setPageSlug(e.target.value)} placeholder="home" disabled={!!editing} /></div>
          <div><Label>Block key</Label><Input required value={blockKey} onChange={(e) => setBlockKey(e.target.value)} placeholder="hero" disabled={!!editing} /></div>
        </div>
        <div>
          <Label>Content (JSON)</Label>
          <Textarea rows={12} value={contentJson} onChange={(e) => setContentJson(e.target.value)} className="font-mono text-xs" />
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={published} onCheckedChange={setPublished} />
          <Label>Published</Label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving…" : "Save"}</Button>
        </div>
      </form>
    </DialogContent>
  );
}
