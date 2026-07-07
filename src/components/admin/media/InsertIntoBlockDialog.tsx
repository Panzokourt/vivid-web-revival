import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminPageBlocksQueryOptions, adminSetBlockMediaField, adminClearBlockMediaField } from "@/lib/admin.functions";
import { getSchema, type Field, type FieldType } from "@/lib/cms/schemas";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, ImageIcon, Film, FileText, Check, X } from "lucide-react";
import { getFileKind } from "@/lib/media-utils";


type MediaFieldType = Extract<FieldType, "image" | "video" | "document">;
const MEDIA_TYPES: MediaFieldType[] = ["image", "video", "document"];
const isMediaField = (t: FieldType): t is MediaFieldType => (MEDIA_TYPES as string[]).includes(t);

type Block = {
  id: string;
  page_slug: string;
  block_key: string;
  content: Record<string, unknown>;
};

type Target = {
  key: string;           // unique key for React
  block: Block;
  path: string;          // dot notation
  fieldLabel: string;    // label shown to user
  currentValue: string;  // existing value
  fieldType: MediaFieldType;
  context: string;       // e.g. "Ορόσημο #2: Λανσάρισμα"
};

const PAGE_LABELS: Record<string, string> = {
  home: "Αρχική", about: "Σχετικά", contact: "Επικοινωνία",
  dealers: "Dealers", configurator: "Configurator", models: "Μοντέλα",
};

function walkTargets(block: Block, fields: Field[], content: Record<string, unknown>, pathPrefix: string, ctx: string, out: Target[]) {
  for (const field of fields) {
    const value = content?.[field.key];
    const fullPath = pathPrefix ? `${pathPrefix}.${field.key}` : field.key;
    if (isMediaField(field.type)) {
      out.push({
        key: `${block.id}::${fullPath}`,
        block,
        path: fullPath,
        fieldLabel: field.label,
        currentValue: typeof value === "string" ? value : "",
        fieldType: field.type,
        context: ctx,
      });
    } else if (field.type === "list" && field.itemSchema && Array.isArray(value)) {
      value.forEach((item, i) => {
        if (item && typeof item === "object") {
          const itemLabel = field.itemLabel?.(item as Record<string, unknown>, i)
            ?? (typeof (item as Record<string, unknown>).title === "string" ? (item as Record<string, unknown>).title as string : `#${i + 1}`);
          const nextCtx = ctx ? `${ctx} › ${field.label} · ${itemLabel}` : `${field.label} · ${itemLabel}`;
          walkTargets(block, field.itemSchema!, item as Record<string, unknown>, `${fullPath}.${i}`, nextCtx, out);
        }
      });
    }
  }
}

type Props = {
  mediaName: string | null;
  mediaKind: ReturnType<typeof getFileKind> | null;
  onClose: () => void;
};

export function InsertIntoBlockDialog({ mediaName, mediaKind, onClose }: Props) {
  const open = !!mediaName;
  const { data: blocks = [] } = useQuery(adminPageBlocksQueryOptions());
  const qc = useQueryClient();
  const set = useServerFn(adminSetBlockMediaField);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"auto" | "all" | MediaFieldType>("auto");

  const suggestedType: MediaFieldType | null = useMemo(() => {
    if (mediaKind === "image") return "image";
    if (mediaKind === "video") return "video";
    if (mediaKind === "pdf" || mediaKind === "doc" || mediaKind === "sheet" || mediaKind === "archive") return "document";
    return null;
  }, [mediaKind]);

  const activeFilter: "all" | MediaFieldType = filter === "auto" ? (suggestedType ?? "all") : filter;

  const targets = useMemo(() => {
    const out: Target[] = [];
    for (const b of blocks as Block[]) {
      const schema = getSchema(b.page_slug, b.block_key);
      if (!schema) continue;
      walkTargets(b, schema.fields, b.content ?? {}, "", "", out);
    }
    return out;
  }, [blocks]);

  const visible = useMemo(() => {
    const q = search.toLowerCase().trim();
    return targets.filter((t) => {
      if (activeFilter !== "all" && t.fieldType !== activeFilter) return false;
      if (!q) return true;
      const hay = `${t.block.page_slug} ${t.block.block_key} ${t.fieldLabel} ${t.context}`.toLowerCase();
      return hay.includes(q);
    });
  }, [targets, activeFilter, search]);

  const grouped = useMemo(() => {
    const g: Record<string, Target[]> = {};
    for (const t of visible) (g[t.block.page_slug] ??= []).push(t);
    return g;
  }, [visible]);

  const insertMutation = useMutation({
    mutationFn: (t: Target) => set({ data: { block_id: t.block.id, path: t.path, value: mediaName! } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "page_blocks"] });
      toast.success("Το αρχείο εισήχθη στο block");
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Η εισαγωγή απέτυχε"),
  });

  const clear = useServerFn(adminClearBlockMediaField);
  const clearMutation = useMutation({
    mutationFn: (t: Target) => clear({ data: { block_id: t.block.id, path: t.path } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "page_blocks"] });
      toast.success("Το πεδίο ξεζευγαρώθηκε");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Η αφαίρεση απέτυχε"),
  });


  const filterChip = (label: string, value: typeof filter, Icon?: typeof ImageIcon) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-2.5 py-1 text-xs rounded inline-flex items-center gap-1 ${filter === value ? "bg-ink text-white" : "text-ink/60 hover:text-ink"}`}
    >
      {Icon && <Icon className="h-3 w-3" />} {label}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Εισαγωγή σε block</DialogTitle>
          <DialogDescription className="truncate font-mono text-xs">{mediaName}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
            <Input placeholder="Σελίδα, block ή πεδίο…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
          <div className="flex items-center rounded-md border border-ink/15 p-0.5">
            {filterChip(suggestedType ? `Auto (${suggestedType})` : "Auto", "auto")}
            {filterChip("All", "all")}
            {filterChip("Image", "image", ImageIcon)}
            {filterChip("Video", "video", Film)}
            {filterChip("Doc", "document", FileText)}
          </div>
        </div>

        <div className="max-h-[55vh] overflow-y-auto -mx-6 px-6">
          {Object.keys(grouped).length === 0 ? (
            <div className="text-sm text-ink/50 py-10 text-center">
              Δεν βρέθηκαν κατάλληλα πεδία. Δοκίμασε άλλο φίλτρο.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([page, items]) => (
                <div key={page}>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-ink/40 mb-2">
                    {PAGE_LABELS[page] ?? page}
                  </div>
                  <div className="space-y-1.5">
                    {items.map((t) => {
                      const isCurrent = t.currentValue === mediaName;
                      const busy = insertMutation.isPending || clearMutation.isPending;
                      return (
                        <div
                          key={t.key}
                          className={`p-3 rounded border transition-colors ${isCurrent ? "border-emerald-500 bg-emerald-50" : "border-ink/15 hover:border-copper hover:bg-copper/5"} ${busy ? "opacity-60" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              disabled={busy || isCurrent}
                              onClick={() => insertMutation.mutate(t)}
                              className="min-w-0 flex-1 text-left disabled:cursor-default"
                              title={isCurrent ? "Ήδη ανατεθειμένο" : "Εισαγωγή σε αυτό το πεδίο"}
                            >
                              <div className="text-sm font-medium truncate">
                                {t.block.block_key} · <span className="text-ink/70">{t.fieldLabel}</span>
                              </div>
                              {t.context && (
                                <div className="text-[11px] text-ink/50 truncate mt-0.5">{t.context}</div>
                              )}
                              {t.currentValue && (
                                <div className="text-[10px] text-ink/40 truncate mt-1 font-mono">
                                  Τρέχον: {t.currentValue}
                                </div>
                              )}
                            </button>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="outline" className="text-[10px] uppercase">{t.fieldType}</Badge>
                              {isCurrent && (
                                <>
                                  <Check className="h-4 w-4 text-emerald-600" />
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    disabled={busy}
                                    onClick={() => clearMutation.mutate(t)}
                                    title="Αφαίρεση από το πεδίο"
                                  >
                                    <X className="h-3.5 w-3.5 mr-1" />Αφαίρεση
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Κλείσιμο</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
