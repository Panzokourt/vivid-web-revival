import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  adminPageBlocksQueryOptions,
  adminUpsertPageBlock,
  adminDeletePageBlock,
  adminSetBlockPublished,
  adminSetPagePublished,
  adminReorderBlocks,
} from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Code, ExternalLink, History, Eye, EyeOff, Sparkles } from "lucide-react";
import { getSchema, SCHEMA_OPTIONS } from "@/lib/cms/schemas";
import { SchemaForm } from "@/components/admin/cms/SchemaForm";
import { Sortable } from "@/components/admin/cms/Sortable";
import { HistoryDialog } from "@/components/admin/cms/HistoryDialog";

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
  sort_order: number;
};

const PAGE_LABELS: Record<string, string> = {
  home: "Αρχική",
  about: "Σχετικά",
  contact: "Επικοινωνία",
  dealers: "Dealers",
  configurator: "Configurator",
  models: "Μοντέλα",
};

function ContentPage() {
  const { data: blocks = [], isLoading } = useQuery(adminPageBlocksQueryOptions());
  const [editing, setEditing] = useState<Block | null>(null);
  const [creating, setCreating] = useState(false);
  const [historyOf, setHistoryOf] = useState<Block | null>(null);
  const qc = useQueryClient();

  const del = useServerFn(adminDeletePageBlock);
  const setBlockPub = useServerFn(adminSetBlockPublished);
  const setPagePub = useServerFn(adminSetPagePublished);
  const reorder = useServerFn(adminReorderBlocks);

  const delMutation = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "page_blocks"] });
      toast.success("Το block διαγράφηκε");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Η διαγραφή απέτυχε"),
  });

  const pubMutation = useMutation({
    mutationFn: (v: { id: string; published: boolean }) => setBlockPub({ data: v }),
    onMutate: async ({ id, published }) => {
      await qc.cancelQueries({ queryKey: ["admin", "page_blocks"] });
      const prev = qc.getQueryData<Block[]>(["admin", "page_blocks"]);
      qc.setQueryData<Block[]>(["admin", "page_blocks"], (old) =>
        (old ?? []).map((b) => (b.id === id ? { ...b, published } : b)),
      );
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["admin", "page_blocks"], ctx.prev);
      toast.error(e instanceof Error ? e.message : "Η αλλαγή απέτυχε");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "page_blocks"] }),
  });

  const pagePubMutation = useMutation({
    mutationFn: (v: { page_slug: string; published: boolean }) => setPagePub({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "page_blocks"] });
      toast.success("Ενημερώθηκαν τα blocks της σελίδας");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Η ενέργεια απέτυχε"),
  });

  const reorderMutation = useMutation({
    mutationFn: (v: { page_slug: string; ordered_ids: string[] }) => reorder({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "page_blocks"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Η αναδιάταξη απέτυχε"),
  });

  const grouped = useMemo(() => {
    return (blocks as Block[]).reduce<Record<string, Block[]>>((acc, b) => {
      (acc[b.page_slug] ??= []).push(b);
      return acc;
    }, {});
  }, [blocks]);

  const handleReorder = (page_slug: string, next: Block[]) => {
    qc.setQueryData<Block[]>(["admin", "page_blocks"], (old) => {
      if (!old) return old;
      const others = old.filter((b) => b.page_slug !== page_slug);
      const withNewOrder = next.map((b, i) => ({ ...b, sort_order: (i + 1) * 10 }));
      return [...others, ...withNewOrder];
    });
    reorderMutation.mutate({ page_slug, ordered_ids: next.map((b) => b.id) });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">Pages</div>
          <h1 className="text-3xl font-display mt-1">Περιεχόμενο σελίδων</h1>
          <p className="text-sm text-ink/60 mt-2">
            Επεξεργάσου blocks με φιλικές φόρμες, σύρε για αναδιάταξη, δημοσίευσε/απόκρυψε άμεσα και επανάφερε παλιές εκδόσεις.
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/?preview=1" target="_blank" rel="noreferrer">
            <Button variant="outline" title="Δες όλες τις αλλαγές (drafts + published) χωρίς να επηρεαστεί το production">
              <Sparkles className="h-4 w-4 mr-2" />Preview live
            </Button>
          </a>
          <Link to="/admin/content/history"><Button variant="outline"><History className="h-4 w-4 mr-2" />Ιστορικό</Button></Link>
          <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4 mr-2" />Νέο block</Button>
        </div>
      </header>

      {isLoading ? (
        <div className="text-sm text-ink/50">Φόρτωση…</div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card className="p-6 text-sm text-ink/60">Δεν υπάρχουν blocks ακόμη.</Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([page, items]) => (
            <div key={page}>
              <div className="flex items-baseline justify-between mb-3 gap-2 flex-wrap">
                <div className="flex items-baseline gap-3">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">
                    {PAGE_LABELS[page] ?? page} <span className="text-ink/30">· {page}</span>
                  </div>
                  <a
                    href={page === "home" ? "/" : `/${page}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-ink/60 hover:text-copper inline-flex items-center gap-1"
                  >
                    Προβολή <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={`${page === "home" ? "/" : `/${page}`}?preview=1`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-amber-700 hover:text-amber-900 inline-flex items-center gap-1"
                    title="Preview drafts + published"
                  >
                    Preview <Sparkles className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm" variant="outline"
                    onClick={() => confirm(`Δημοσίευση ΟΛΩΝ των blocks της σελίδας "${page}";`) && pagePubMutation.mutate({ page_slug: page, published: true })}
                  >
                    <Eye className="h-4 w-4 mr-1" /> Δημοσίευση όλων
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    onClick={() => confirm(`Απόκρυψη ΟΛΩΝ των blocks της σελίδας "${page}";`) && pagePubMutation.mutate({ page_slug: page, published: false })}
                  >
                    <EyeOff className="h-4 w-4 mr-1" /> Απόκρυψη όλων
                  </Button>
                </div>
              </div>

              <div className="grid gap-3">
                <Sortable
                  items={items}
                  onReorder={(next) => handleReorder(page, next)}
                  renderItem={(b, handle) => {
                    const schema = getSchema(b.page_slug, b.block_key);
                    const preview =
                      (typeof b.content?.title === "string" ? (b.content.title as string) : "") ||
                      (typeof b.content?.eyebrow === "string" ? (b.content.eyebrow as string) : "") ||
                      "";
                    return (
                      <Card className="p-4 flex items-start gap-3 mb-3">
                        <div className="pt-1">{handle}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {schema ? schema.title.split("·").slice(1).join("·").trim() || schema.title : b.block_key}
                              </div>
                              <div className="text-[11px] text-ink/40 mt-0.5">
                                {b.page_slug} / {b.block_key}
                                {!schema && <span className="ml-2 text-amber-700">· advanced (JSON)</span>}
                              </div>
                              {preview && (
                                <div className="text-xs text-ink/60 mt-2 line-clamp-2 whitespace-pre-line">{preview}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <div className="flex items-center gap-1.5 mr-1">
                                <Switch
                                  checked={b.published}
                                  onCheckedChange={(v) => pubMutation.mutate({ id: b.id, published: v })}
                                />
                                {b.published ? <Badge>Live</Badge> : <Badge variant="outline">Draft</Badge>}
                              </div>
                              <Button variant="ghost" size="sm" title="Ιστορικό" onClick={() => setHistoryOf(b)}>
                                <History className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Επεξεργασία" onClick={() => setEditing(b)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost" size="sm" title="Διαγραφή"
                                onClick={() => confirm(`Διαγραφή του "${b.block_key}";`) && delMutation.mutate(b.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <EditBlockDialog
          block={editing}
          onClose={() => setEditing(null)}
          onOpenHistory={() => { setHistoryOf(editing); setEditing(null); }}
        />
      )}
      {historyOf && (
        <HistoryDialog
          blockId={historyOf.id}
          onClose={() => setHistoryOf(null)}
          onRestored={() => setHistoryOf(null)}
        />
      )}
      {creating && (
        <NewBlockDialog onClose={() => setCreating(false)} onCreated={(b) => { setCreating(false); setEditing(b); }} />
      )}
    </div>
  );
}

function EditBlockDialog({ block, onClose, onOpenHistory }: { block: Block; onClose: () => void; onOpenHistory: () => void }) {
  const upsert = useServerFn(adminUpsertPageBlock);
  const qc = useQueryClient();
  const schema = getSchema(block.page_slug, block.block_key);
  const [content, setContent] = useState<Record<string, unknown>>(block.content ?? {});
  const [published, setPublished] = useState(block.published);
  const [jsonMode, setJsonMode] = useState(!schema);
  const [jsonText, setJsonText] = useState(JSON.stringify(block.content ?? {}, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      let payload = content;
      if (jsonMode) {
        try {
          payload = JSON.parse(jsonText);
          setJsonError(null);
        } catch {
          setJsonError("Μη έγκυρο JSON");
          throw new Error("Μη έγκυρο JSON");
        }
      }
      return upsert({
        data: { page_slug: block.page_slug, block_key: block.block_key, content: payload, published },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "page_blocks"] });
      qc.invalidateQueries({ queryKey: ["admin", "block_versions", block.id] });
      qc.invalidateQueries({ queryKey: ["admin", "recent_changes"] });
      toast.success("Αποθηκεύτηκε");
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Η αποθήκευση απέτυχε"),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-4">
            <span>{schema ? schema.title : `${block.page_slug} / ${block.block_key}`}</span>
            <div className="flex items-center gap-1">
              <Button type="button" size="sm" variant="ghost" onClick={onOpenHistory}>
                <History className="h-4 w-4 mr-1" /> Ιστορικό
              </Button>
              {schema && (
                <Button
                  type="button" size="sm" variant="ghost"
                  onClick={() => {
                    if (!jsonMode) setJsonText(JSON.stringify(content, null, 2));
                    else {
                      try { setContent(JSON.parse(jsonText)); setJsonError(null); } catch { setJsonError("Μη έγκυρο JSON"); return; }
                    }
                    setJsonMode(!jsonMode);
                  }}
                >
                  <Code className="h-4 w-4 mr-1" /> {jsonMode ? "Φόρμα" : "JSON"}
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="grid gap-5">
          {schema && !jsonMode ? (
            <SchemaForm schema={schema} value={content} onChange={setContent} />
          ) : (
            <div className="grid gap-1.5">
              <Label>Περιεχόμενο (JSON)</Label>
              <Textarea
                rows={18}
                className="font-mono text-xs"
                value={jsonText}
                onChange={(e) => { setJsonText(e.target.value); setJsonError(null); }}
              />
              {jsonError && <div className="text-xs text-red-600">{jsonError}</div>}
            </div>
          )}

          <div className="flex items-center gap-3 border-t pt-4">
            <Switch checked={published} onCheckedChange={setPublished} id="pub" />
            <Label htmlFor="pub">Δημοσιευμένο</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Άκυρο</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Αποθήκευση…" : "Αποθήκευση"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NewBlockDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (b: Block) => void }) {
  const upsert = useServerFn(adminUpsertPageBlock);
  const qc = useQueryClient();
  const [mode, setMode] = useState<"schema" | "custom">("schema");
  const [schemaId, setSchemaId] = useState(SCHEMA_OPTIONS[0]?.id ?? "");
  const [pageSlug, setPageSlug] = useState("home");
  const [blockKey, setBlockKey] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const page_slug = mode === "schema" ? schemaId.split("/")[0] : pageSlug.trim();
      const block_key = mode === "schema" ? schemaId.split("/")[1] : blockKey.trim();
      if (!page_slug || !block_key) throw new Error("Συμπλήρωσε page & key");
      await upsert({ data: { page_slug, block_key, content: {}, published: false } });
      return { page_slug, block_key };
    },
    onSuccess: async (r) => {
      await qc.invalidateQueries({ queryKey: ["admin", "page_blocks"] });
      const list = qc.getQueryData<Block[]>(["admin", "page_blocks"]) ?? [];
      const created = list.find((b) => b.page_slug === r.page_slug && b.block_key === r.block_key);
      toast.success("Δημιουργήθηκε");
      if (created) onCreated(created); else onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Η δημιουργία απέτυχε"),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Νέο block</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="flex gap-2">
            <Button type="button" size="sm" variant={mode === "schema" ? "default" : "outline"} onClick={() => setMode("schema")}>Έτοιμο πρότυπο</Button>
            <Button type="button" size="sm" variant={mode === "custom" ? "default" : "outline"} onClick={() => setMode("custom")}>Custom (JSON)</Button>
          </div>

          {mode === "schema" ? (
            <div className="grid gap-1.5">
              <Label>Πρότυπο</Label>
              <Select value={schemaId} onValueChange={setSchemaId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SCHEMA_OPTIONS.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Page slug</Label><Input value={pageSlug} onChange={(e) => setPageSlug(e.target.value)} placeholder="home" /></div>
              <div><Label>Block key</Label><Input value={blockKey} onChange={(e) => setBlockKey(e.target.value)} placeholder="hero" /></div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Άκυρο</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Δημιουργία…" : "Δημιουργία"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

