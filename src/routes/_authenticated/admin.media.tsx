import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useRef, useState, useCallback, type DragEvent } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  adminMediaQueryOptions,
  adminDeleteMedia,
  adminBulkDeleteMedia,
  type MediaFile,
} from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Upload, Trash2, Copy, Search, LayoutGrid, List, X, Download, Folder, FolderPlus,
  FileText, ImageIcon, Film, ExternalLink,
} from "lucide-react";
import { FilePreview } from "@/components/admin/media/FilePreview";
import { getFileKind, formatSize, formatDate, basename, dirname, type FileKind } from "@/lib/media-utils";

export const Route = createFileRoute("/_authenticated/admin/media")({
  head: () => ({ meta: [{ title: "Media — RIBALI Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => <AdminShell><MediaPage /></AdminShell>,
});

const DEFAULT_FOLDERS = ["site", "models", "dealers", "uploads"];
const MAX_SIZE = 20 * 1024 * 1024;

type SortKey = "newest" | "oldest" | "name" | "size";
type KindFilter = "all" | "image" | "video" | "doc" | "other";

type UploadItem = { id: string; file: File; folder: string; progress: number; status: "queued" | "uploading" | "done" | "error"; error?: string };

function MediaPage() {
  const { data: files = [], isLoading } = useQuery(adminMediaQueryOptions());
  const qc = useQueryClient();

  const del = useServerFn(adminDeleteMedia);
  const bulkDel = useServerFn(adminBulkDeleteMedia);

  // UI state
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [folder, setFolder] = useState<string>("all"); // "all" | "root" | prefix
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [details, setDetails] = useState<MediaFile | null>(null);
  const [previewImg, setPreviewImg] = useState<MediaFile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ names: string[]; label: string } | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [uploadFolder, setUploadFolder] = useState<string>("site");
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Folder list with counts
  const folders = useMemo(() => {
    const counts = new Map<string, number>();
    counts.set("root", 0);
    for (const p of DEFAULT_FOLDERS) counts.set(p, 0);
    for (const f of files) {
      const d = dirname(f.name);
      const key = d || "root";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [files]);

  // Filtered / sorted list
  const visible = useMemo(() => {
    let arr = files.slice();
    if (folder === "root") arr = arr.filter((f) => !dirname(f.name));
    else if (folder !== "all") arr = arr.filter((f) => dirname(f.name) === folder);
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((f) => f.name.toLowerCase().includes(q));
    }
    if (kindFilter !== "all") {
      arr = arr.filter((f) => {
        const k = getFileKind(f.mime_type, f.name);
        if (kindFilter === "image") return k === "image";
        if (kindFilter === "video") return k === "video";
        if (kindFilter === "doc") return k === "pdf" || k === "doc" || k === "sheet";
        return k !== "image" && k !== "video" && k !== "pdf" && k !== "doc" && k !== "sheet";
      });
    }
    arr.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "size") return b.size - a.size;
      const at = a.created_at ? Date.parse(a.created_at) : 0;
      const bt = b.created_at ? Date.parse(b.created_at) : 0;
      return sort === "oldest" ? at - bt : bt - at;
    });
    return arr;
  }, [files, folder, search, kindFilter, sort]);

  // Mutations
  const delMutation = useMutation({
    mutationFn: (names: string[]) =>
      names.length === 1 ? del({ data: { name: names[0] } }) : bulkDel({ data: { names } }),
    onSuccess: (_r, names) => {
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
      setSelected(new Set());
      setDetails(null);
      toast.success(names.length === 1 ? "Το αρχείο διαγράφηκε" : `${names.length} αρχεία διαγράφηκαν`);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Η διαγραφή απέτυχε"),
  });

  // Upload
  const startUploads = useCallback(async (list: File[]) => {
    const valid: UploadItem[] = [];
    for (const file of list) {
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name}: υπερβαίνει τα 20 MB`);
        continue;
      }
      valid.push({
        id: crypto.randomUUID(),
        file,
        folder: uploadFolder,
        progress: 0,
        status: "queued",
      });
    }
    if (!valid.length) return;
    setUploads((u) => [...valid, ...u]);

    for (const item of valid) {
      setUploads((u) => u.map((x) => x.id === item.id ? { ...x, status: "uploading", progress: 10 } : x));
      const safeName = `${Date.now()}-${item.file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const path = item.folder && item.folder !== "root" ? `${item.folder}/${safeName}` : safeName;
      try {
        const { error } = await supabase.storage.from("media").upload(path, item.file, {
          cacheControl: "3600",
          upsert: false,
          contentType: item.file.type || undefined,
        });
        if (error) throw error;
        setUploads((u) => u.map((x) => x.id === item.id ? { ...x, status: "done", progress: 100 } : x));
      } catch (err) {
        setUploads((u) => u.map((x) => x.id === item.id ? { ...x, status: "error", progress: 100, error: err instanceof Error ? err.message : "upload failed" } : x));
      }
    }
    qc.invalidateQueries({ queryKey: ["admin", "media"] });
  }, [uploadFolder, qc]);

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    if (fileRef.current) fileRef.current.value = "";
    if (list.length) void startUploads(list);
  }

  // Page-level DnD
  function onDragEnter(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer?.types.includes("Files")) {
      dragCounter.current++;
      setIsDragging(true);
    }
  }
  function onDragLeave(e: DragEvent) {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current <= 0) { setIsDragging(false); dragCounter.current = 0; }
  }
  function onDragOver(e: DragEvent) { e.preventDefault(); }
  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const list = Array.from(e.dataTransfer?.files ?? []);
    if (list.length) void startUploads(list);
  }

  const toggleSelect = (name: string) => setSelected((s) => {
    const next = new Set(s);
    if (next.has(name)) next.delete(name); else next.add(name);
    return next;
  });
  const selectAllVisible = () => setSelected(new Set(visible.map((f) => f.name)));
  const clearSelection = () => setSelected(new Set());

  const activeUploads = uploads.filter((u) => u.status === "uploading" || u.status === "queued").length;

  return (
    <div
      className="space-y-6 relative min-h-[70vh]"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">Storage</div>
          <h1 className="text-3xl font-display mt-1">Media library</h1>
          <p className="text-sm text-ink/60 mt-2">
            Ανέβασε φωτογραφίες, video ή έγγραφα. Σύρε αρχεία οπουδήποτε για γρήγορο upload.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={uploadFolder} onValueChange={setUploadFolder}>
            <SelectTrigger className="w-[160px]">
              <Folder className="h-3.5 w-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="root">/ (root)</SelectItem>
              {DEFAULT_FOLDERS.map((f) => <SelectItem key={f} value={f}>{f}/</SelectItem>)}
            </SelectContent>
          </Select>
          <input ref={fileRef} type="file" multiple onChange={onFileInput} className="hidden" />
          <Button onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />Upload
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Folders sidebar */}
        <aside className="space-y-1">
          <div className="text-[11px] uppercase tracking-[0.3em] text-ink/40 mb-2 px-2">Folders</div>
          <FolderItem label="All files" count={files.length} active={folder === "all"} onClick={() => setFolder("all")} />
          <FolderItem label="/ (root)" count={folders.get("root") ?? 0} active={folder === "root"} onClick={() => setFolder("root")} />
          {Array.from(folders.entries())
            .filter(([k]) => k !== "root")
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([name, count]) => (
              <FolderItem key={name} label={`${name}/`} count={count} active={folder === name} onClick={() => setFolder(name)} />
            ))}
          <button
            onClick={() => {
              const n = prompt("Όνομα νέου folder (π.χ. gallery)");
              if (!n) return;
              const clean = n.trim().replace(/[^a-zA-Z0-9_-]/g, "");
              if (!clean) return toast.error("Άκυρο όνομα");
              setUploadFolder(clean);
              setFolder(clean);
              toast.info(`Ο φάκελος "${clean}/" θα δημιουργηθεί με το πρώτο upload.`);
            }}
            className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded text-xs text-ink/50 hover:text-ink hover:bg-ink/5 mt-2"
          >
            <FolderPlus className="h-3.5 w-3.5" /> Νέος φάκελος
          </button>
        </aside>

        {/* Main */}
        <div className="space-y-4 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
              <Input
                placeholder="Αναζήτηση αρχείου…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center rounded-md border border-ink/15 p-0.5">
              {([
                ["all", "All", null],
                ["image", "Images", ImageIcon],
                ["video", "Video", Film],
                ["doc", "Docs", FileText],
                ["other", "Other", null],
              ] as const).map(([k, label, Icon]) => (
                <button
                  key={k}
                  onClick={() => setKindFilter(k)}
                  className={`px-2.5 py-1 text-xs rounded inline-flex items-center gap-1 ${kindFilter === k ? "bg-ink text-white" : "text-ink/60 hover:text-ink"}`}
                >
                  {Icon && <Icon className="h-3 w-3" />} {label}
                </button>
              ))}
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Νεότερα</SelectItem>
                <SelectItem value="oldest">Παλαιότερα</SelectItem>
                <SelectItem value="name">Όνομα A→Z</SelectItem>
                <SelectItem value="size">Μέγεθος ↓</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center rounded-md border border-ink/15 p-0.5">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded ${view === "grid" ? "bg-ink text-white" : "text-ink/50 hover:text-ink"}`}
                title="Grid"
              ><LayoutGrid className="h-4 w-4" /></button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded ${view === "list" ? "bg-ink text-white" : "text-ink/50 hover:text-ink"}`}
                title="List"
              ><List className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Bulk actions bar */}
          {selected.size > 0 && (
            <Card className="p-3 flex items-center justify-between bg-ink/5">
              <div className="text-sm">
                <span className="font-medium">{selected.size}</span> επιλεγμένα
                <button onClick={selectAllVisible} className="ml-3 text-xs text-copper hover:underline">Επιλογή όλων ({visible.length})</button>
                <button onClick={clearSelection} className="ml-2 text-xs text-ink/50 hover:text-ink">Καθαρισμός</button>
              </div>
              <Button
                variant="destructive" size="sm"
                onClick={() => setConfirmDelete({ names: Array.from(selected), label: `${selected.size} αρχεία` })}
              >
                <Trash2 className="h-4 w-4 mr-2" />Διαγραφή
              </Button>
            </Card>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-ink/10 overflow-hidden">
                  <div className="aspect-square bg-ink/5 animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-ink/10 rounded animate-pulse" />
                    <div className="h-2 w-1/2 bg-ink/10 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState onUpload={() => fileRef.current?.click()} hasFilter={search !== "" || kindFilter !== "all" || folder !== "all"} />
          ) : view === "grid" ? (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visible.map((f) => (
                <FileCard
                  key={f.name}
                  file={f}
                  selected={selected.has(f.name)}
                  onToggleSelect={() => toggleSelect(f.name)}
                  onOpen={() => {
                    if (getFileKind(f.mime_type, f.name) === "image") setPreviewImg(f);
                    else setDetails(f);
                  }}
                  onDetails={() => setDetails(f)}
                  onCopy={() => { navigator.clipboard.writeText(f.name); toast.success("Path copied"); }}
                  onDelete={() => setConfirmDelete({ names: [f.name], label: basename(f.name) })}
                />
              ))}
            </div>
          ) : (
            <FileList
              files={visible}
              selected={selected}
              onToggle={toggleSelect}
              onSelectAll={() => selected.size === visible.length ? clearSelection() : selectAllVisible()}
              onOpen={(f) => setDetails(f)}
              onCopy={(f) => { navigator.clipboard.writeText(f.name); toast.success("Path copied"); }}
              onDelete={(f) => setConfirmDelete({ names: [f.name], label: basename(f.name) })}
            />
          )}
        </div>
      </div>

      {/* Upload queue (bottom-right) */}
      {uploads.length > 0 && (
        <Card className="fixed bottom-4 right-4 w-80 z-40 shadow-lg">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="text-sm font-medium">
              {activeUploads > 0 ? `Ανέβασμα ${activeUploads}…` : "Ολοκληρώθηκε"}
            </div>
            <button onClick={() => setUploads([])} className="text-ink/50 hover:text-ink"><X className="h-4 w-4" /></button>
          </div>
          <div className="max-h-64 overflow-y-auto p-2 space-y-2">
            {uploads.map((u) => (
              <div key={u.id} className="text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate flex-1" title={u.file.name}>{u.file.name}</span>
                  <span className="text-ink/50">{formatSize(u.file.size)}</span>
                </div>
                {u.status === "error" ? (
                  <div className="text-red-600 text-[11px] mt-1">{u.error}</div>
                ) : (
                  <Progress value={u.progress} className="h-1 mt-1" />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Drop overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="absolute inset-4 border-4 border-dashed border-copper rounded-2xl bg-copper/5 flex items-center justify-center">
            <div className="text-center">
              <Upload className="h-12 w-12 text-copper mx-auto mb-3" />
              <div className="text-lg font-medium text-ink">Άφησε τα αρχεία εδώ</div>
              <div className="text-sm text-ink/60 mt-1">Ανέβασμα στο: <span className="font-mono">{uploadFolder}/</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Details drawer */}
      <DetailsSheet
        file={details}
        onClose={() => setDetails(null)}
        onDelete={(f) => setConfirmDelete({ names: [f.name], label: basename(f.name) })}
      />

      {/* Image lightbox */}
      <Dialog open={!!previewImg} onOpenChange={(o) => !o && setPreviewImg(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          {previewImg && (
            <div className="bg-black">
              <img src={previewImg.url} alt={previewImg.name} className="w-full max-h-[85vh] object-contain" />
              <div className="p-3 bg-white flex items-center justify-between text-xs">
                <span className="font-mono truncate">{previewImg.name}</span>
                <span className="text-ink/50">{formatSize(previewImg.size)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Διαγραφή {confirmDelete?.label};</AlertDialogTitle>
            <AlertDialogDescription>
              Αυτή η ενέργεια είναι μη αναστρέψιμη. Το/τα αρχείο/α θα διαγραφούν οριστικά από το storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => { if (confirmDelete) { delMutation.mutate(confirmDelete.names); setConfirmDelete(null); } }}
            >Διαγραφή</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────

function FolderItem({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-sm ${active ? "bg-ink text-white" : "text-ink/70 hover:bg-ink/5"}`}
    >
      <span className="inline-flex items-center gap-2 truncate">
        <Folder className="h-3.5 w-3.5" /> {label}
      </span>
      <span className={`text-[11px] tabular-nums ${active ? "text-white/70" : "text-ink/40"}`}>{count}</span>
    </button>
  );
}

function FileCard({
  file, selected, onToggleSelect, onOpen, onDetails, onCopy, onDelete,
}: {
  file: MediaFile; selected: boolean;
  onToggleSelect: () => void; onOpen: () => void; onDetails: () => void;
  onCopy: () => void; onDelete: () => void;
}) {
  const kind = getFileKind(file.mime_type, file.name);
  return (
    <Card className={`overflow-hidden group relative ${selected ? "ring-2 ring-copper" : ""}`}>
      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 data-[selected=true]:opacity-100" data-selected={selected}>
        <div className="bg-white/95 rounded p-0.5 shadow-sm">
          <Checkbox checked={selected} onCheckedChange={onToggleSelect} />
        </div>
      </div>
      <button onClick={onOpen} className="block w-full text-left">
        <FilePreview name={file.name} url={file.url} mime={file.mime_type} />
      </button>
      <div className="p-2.5 border-t border-ink/5">
        <div className="text-xs font-medium truncate" title={file.name}>{basename(file.name)}</div>
        <div className="flex items-center justify-between mt-0.5">
          <div className="text-[10px] text-ink/50 uppercase tracking-wider">{kind === "other" ? "file" : kind}</div>
          <div className="text-[10px] text-ink/50">{formatSize(file.size)}</div>
        </div>
        <div className="flex items-center gap-0.5 mt-2 -ml-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onCopy} title="Copy path"><Copy className="h-3 w-3" /></Button>
          <a href={file.url} download={basename(file.name)} target="_blank" rel="noreferrer">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Download"><Download className="h-3 w-3" /></Button>
          </a>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onDetails} title="Details"><ExternalLink className="h-3 w-3" /></Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 ml-auto" onClick={onDelete} title="Delete"><Trash2 className="h-3 w-3 text-red-600" /></Button>
        </div>
      </div>
    </Card>
  );
}

function FileList({
  files, selected, onToggle, onSelectAll, onOpen, onCopy, onDelete,
}: {
  files: MediaFile[]; selected: Set<string>;
  onToggle: (name: string) => void; onSelectAll: () => void;
  onOpen: (f: MediaFile) => void; onCopy: (f: MediaFile) => void; onDelete: (f: MediaFile) => void;
}) {
  const allChecked = files.length > 0 && files.every((f) => selected.has(f.name));
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-ink/5 text-ink/60 text-xs uppercase tracking-wider">
          <tr>
            <th className="p-3 w-8"><Checkbox checked={allChecked} onCheckedChange={onSelectAll} /></th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left w-20">Type</th>
            <th className="p-3 text-right w-24">Size</th>
            <th className="p-3 text-left w-32">Modified</th>
            <th className="p-3 w-32"></th>
          </tr>
        </thead>
        <tbody>
          {files.map((f) => {
            const kind = getFileKind(f.mime_type, f.name);
            return (
              <tr key={f.name} className="border-t border-ink/5 hover:bg-ink/2.5">
                <td className="p-3"><Checkbox checked={selected.has(f.name)} onCheckedChange={() => onToggle(f.name)} /></td>
                <td className="p-3">
                  <button onClick={() => onOpen(f)} className="flex items-center gap-3 text-left hover:text-copper">
                    <div className="w-10 h-10 shrink-0 rounded overflow-hidden">
                      <FilePreview name={f.name} url={f.url} mime={f.mime_type} className="w-full h-full" />
                    </div>
                    <span className="truncate max-w-[400px] font-mono text-xs">{f.name}</span>
                  </button>
                </td>
                <td className="p-3"><Badge variant="outline" className="text-[10px] uppercase">{kind}</Badge></td>
                <td className="p-3 text-right text-ink/60 tabular-nums">{formatSize(f.size)}</td>
                <td className="p-3 text-ink/50 text-xs">{formatDate(f.created_at)}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-0.5">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onCopy(f)}><Copy className="h-3 w-3" /></Button>
                    <a href={f.url} download={basename(f.name)} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Download className="h-3 w-3" /></Button>
                    </a>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onDelete(f)}><Trash2 className="h-3 w-3 text-red-600" /></Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

function EmptyState({ onUpload, hasFilter }: { onUpload: () => void; hasFilter: boolean }) {
  return (
    <Card className="p-12 flex flex-col items-center text-center border-dashed">
      <Upload className="h-10 w-10 text-ink/30 mb-3" />
      <div className="text-lg font-medium">{hasFilter ? "Δεν βρέθηκαν αρχεία" : "Δεν υπάρχουν αρχεία ακόμη"}</div>
      <div className="text-sm text-ink/50 mt-1">
        {hasFilter ? "Δοκίμασε άλλο φίλτρο ή καθάρισε την αναζήτηση." : "Σύρε αρχεία εδώ ή πάτα Upload."}
      </div>
      {!hasFilter && (
        <Button onClick={onUpload} className="mt-4"><Upload className="h-4 w-4 mr-2" />Upload αρχείων</Button>
      )}
    </Card>
  );
}

function DetailsSheet({ file, onClose, onDelete }: { file: MediaFile | null; onClose: () => void; onDelete: (f: MediaFile) => void }) {
  const kind: FileKind | null = file ? getFileKind(file.mime_type, file.name) : null;
  return (
    <Sheet open={!!file} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[400px] sm:w-[480px] overflow-y-auto">
        {file && (
          <>
            <SheetHeader>
              <SheetTitle className="truncate font-mono text-sm">{basename(file.name)}</SheetTitle>
              <SheetDescription className="text-xs">{dirname(file.name) || "/"}</SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg overflow-hidden border border-ink/10">
                {kind === "image" && <img src={file.url} alt={file.name} className="w-full max-h-[400px] object-contain bg-ink/5" />}
                {kind === "video" && <video src={file.url} controls className="w-full max-h-[400px] bg-black" />}
                {kind === "audio" && <div className="p-4 bg-ink/5"><audio src={file.url} controls className="w-full" /></div>}
                {kind === "pdf" && <iframe src={file.url} title={file.name} className="w-full h-[400px]" />}
                {(!kind || (kind !== "image" && kind !== "video" && kind !== "audio" && kind !== "pdf")) && (
                  <div className="aspect-video"><FilePreview name={file.name} url={file.url} mime={file.mime_type} className="w-full h-full" /></div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <MetaRow label="Path" value={file.name} mono />
                <MetaRow label="Type" value={file.mime_type ?? kind ?? "—"} />
                <MetaRow label="Size" value={formatSize(file.size)} />
                <MetaRow label="Uploaded" value={formatDate(file.created_at)} />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { navigator.clipboard.writeText(file.name); toast.success("Path copied"); }}>
                  <Copy className="h-4 w-4 mr-2" />Copy path
                </Button>
                <a href={file.url} download={basename(file.name)} target="_blank" rel="noreferrer" className="flex-1">
                  <Button variant="outline" className="w-full"><Download className="h-4 w-4 mr-2" />Download</Button>
                </a>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => onDelete(file)}
              ><Trash2 className="h-4 w-4 mr-2" />Διαγραφή</Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="text-xs uppercase tracking-wider text-ink/40">{label}</div>
      <div className={`text-xs text-ink/80 truncate max-w-[280px] ${mono ? "font-mono" : ""}`} title={value}>{value}</div>
    </div>
  );
}
