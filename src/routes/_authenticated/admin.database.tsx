import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  tablesListQueryOptions,
  tableRowsQueryOptions,
  insertRow,
  updateRow,
  deleteRows,
  type ColumnMeta,
} from "@/lib/database.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ChevronRight,
  Database as DatabaseIcon,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/database")({
  head: () => ({
    meta: [
      { title: "Database — RIBALI Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AdminShell>
      <DatabasePage />
    </AdminShell>
  ),
});

type TableInfo = {
  schema: "public" | "auth";
  name: string;
  label: string;
  readOnly: boolean;
  pk: string;
  columns: ColumnMeta[];
};

function DatabasePage() {
  const { data: tables, isLoading } = useQuery(tablesListQueryOptions());
  const [selected, setSelected] = useState<string>("public.models");

  if (isLoading || !tables) return <div className="text-sm text-ink/50">Loading…</div>;

  const current = tables.find((t) => `${t.schema}.${t.name}` === selected) ?? tables[0];

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">Operations</div>
        <h1 className="text-3xl font-display mt-1 flex items-center gap-2">
          <DatabaseIcon className="h-6 w-6" /> Database
        </h1>
        <p className="text-sm text-ink/60 mt-2">
          Πλήρης πρόσβαση CRUD στους πίνακες του public schema. Οι χρήστες auth είναι read-only.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <aside className="space-y-4">
          <TableGroup
            title="Public"
            tables={tables.filter((t) => t.schema === "public")}
            selected={selected}
            onSelect={setSelected}
          />
          <TableGroup
            title="Auth"
            tables={tables.filter((t) => t.schema === "auth")}
            selected={selected}
            onSelect={setSelected}
          />
        </aside>
        <TableViewer key={`${current.schema}.${current.name}`} table={current} />
      </div>
    </div>
  );
}

function TableGroup({
  title,
  tables,
  selected,
  onSelect,
}: {
  title: string;
  tables: TableInfo[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-ink/40 mb-2 px-2">{title}</div>
      <div className="space-y-0.5">
        {tables.map((t) => {
          const id = `${t.schema}.${t.name}`;
          const active = selected === id;
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center justify-between gap-2 transition ${
                active ? "bg-ink text-paper" : "hover:bg-ink/5 text-ink/80"
              }`}
            >
              <span className="truncate">{t.name}</span>
              {t.readOnly && <Lock className="h-3 w-3 opacity-60" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TableViewer({ table }: { table: TableInfo }) {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string[] | null>(null);

  // debounce search
  useEffect(() => {
    const h = setTimeout(() => {
      setDebounced(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(h);
  }, [search]);

  const { data, isFetching, refetch } = useQuery(
    tableRowsQueryOptions({
      schema: table.schema,
      table: table.name,
      search: debounced,
      sortColumn,
      sortAsc,
      page,
      pageSize,
    }),
  );

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "db", "rows"] });

  const insertMut = useMutation({
    mutationFn: (values: Record<string, any>) => insertRow({ data: { table: table.name, values } }),
    onSuccess: () => {
      toast.success("Row created");
      setCreating(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: (payload: { pk: string; values: Record<string, any> }) =>
      updateRow({ data: { table: table.name, pk: payload.pk, values: payload.values } }),
    onSuccess: () => {
      toast.success("Row updated");
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (ids: string[]) => deleteRows({ data: { table: table.name, ids } }),
    onSuccess: (r) => {
      toast.success(`Deleted ${r.deleted}`);
      setConfirmDelete(null);
      setSelectedIds(new Set());
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleSort = (col: string) => {
    if (sortColumn === col) setSortAsc((v) => !v);
    else {
      setSortColumn(col);
      setSortAsc(true);
    }
  };

  const allSelected = rows.length > 0 && rows.every((r: any) => selectedIds.has(String(r[table.pk])));

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-display">{table.label}</h2>
          <Badge variant="outline" className="text-[10px] font-mono">
            {table.schema}.{table.name}
          </Badge>
          {table.readOnly && (
            <Badge variant="outline" className="text-[10px] gap-1">
              <Lock className="h-3 w-3" /> read-only
            </Badge>
          )}
          <span className="text-xs text-ink/50">{total} rows</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="pl-8 h-9 w-52"
            />
          </div>
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(0); }}>
            <SelectTrigger className="h-9 w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[25, 50, 100, 200].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
          {selectedIds.size > 0 && !table.readOnly && (
            <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(Array.from(selectedIds))}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete ({selectedIds.size})
            </Button>
          )}
          {!table.readOnly && (
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> New row
            </Button>
          )}
        </div>
      </div>

      <div className="border border-ink/10 rounded-md overflow-auto max-h-[calc(100vh-320px)]">
        <Table>
          <TableHeader className="bg-ink/[0.03] sticky top-0 z-10">
            <TableRow>
              {!table.readOnly && (
                <TableHead className="w-8">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(v) => {
                      const next = new Set(selectedIds);
                      if (v) rows.forEach((r: any) => next.add(String(r[table.pk])));
                      else rows.forEach((r: any) => next.delete(String(r[table.pk])));
                      setSelectedIds(next);
                    }}
                  />
                </TableHead>
              )}
              {table.columns.map((c) => (
                <TableHead
                  key={c.name}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => toggleSort(c.name)}
                >
                  <span className="text-[11px] uppercase tracking-wider">{c.name}</span>
                  {sortColumn === c.name && (
                    <span className="ml-1 text-ink/40">{sortAsc ? "↑" : "↓"}</span>
                  )}
                </TableHead>
              ))}
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={table.columns.length + 2} className="text-center text-sm text-ink/40 py-8">
                  No rows
                </TableCell>
              </TableRow>
            )}
            {rows.map((row: any) => {
              const rid = String(row[table.pk]);
              const isSel = selectedIds.has(rid);
              return (
                <TableRow key={rid} className={isSel ? "bg-ink/5" : ""}>
                  {!table.readOnly && (
                    <TableCell>
                      <Checkbox
                        checked={isSel}
                        onCheckedChange={(v) => {
                          const next = new Set(selectedIds);
                          if (v) next.add(rid);
                          else next.delete(rid);
                          setSelectedIds(next);
                        }}
                      />
                    </TableCell>
                  )}
                  {table.columns.map((c) => (
                    <TableCell key={c.name} className="max-w-[280px] truncate align-top">
                      <CellValue col={c} value={row[c.name]} />
                    </TableCell>
                  ))}
                  <TableCell>
                    {!table.readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditing(row)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-xs text-ink/60">
        <div>Page {page + 1} of {totalPages}</div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {(editing || creating) && (
        <RowEditor
          table={table}
          initial={editing ?? {}}
          isNew={creating}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSubmit={(values) => {
            if (creating) insertMut.mutate(values);
            else if (editing) updateMut.mutate({ pk: String(editing[table.pk]), values });
          }}
          isSubmitting={insertMut.isPending || updateMut.isPending}
        />
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {confirmDelete?.length} row(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes rows from <b>{table.name}</b>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && deleteMut.mutate(confirmDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CellValue({ col, value }: { col: ColumnMeta; value: any }) {
  if (value === null || value === undefined) return <span className="text-ink/30">null</span>;
  switch (col.type) {
    case "bool":
      return <Badge variant={value ? "default" : "outline"} className="text-[10px]">{String(value)}</Badge>;
    case "timestamp":
      try { return <span className="text-xs font-mono text-ink/70">{new Date(value).toLocaleString()}</span>; }
      catch { return <span>{String(value)}</span>; }
    case "uuid":
      return <span className="font-mono text-xs text-ink/60">{String(value).slice(0, 8)}…</span>;
    case "json":
      return <span className="font-mono text-xs text-ink/60">{JSON.stringify(value).slice(0, 60)}</span>;
    default:
      return <span className="text-sm">{String(value)}</span>;
  }
}

function RowEditor({
  table,
  initial,
  isNew,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  table: TableInfo;
  initial: Record<string, any>;
  isNew: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => void;
  isSubmitting: boolean;
}) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const base: Record<string, any> = {};
    for (const c of table.columns) {
      const v = initial[c.name];
      base[c.name] = c.type === "json" && v != null ? JSON.stringify(v, null, 2) : v ?? "";
    }
    return base;
  });
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});

  const setField = (name: string, v: any) => setValues((s) => ({ ...s, [name]: v }));

  function submit() {
    const errors: Record<string, string> = {};
    const clean: Record<string, any> = {};
    for (const c of table.columns) {
      if (c.isReadonly && !isNew) continue;
      if (c.isReadonly && c.name !== "id") continue;
      if (c.name === "id" && !values.id) continue;
      let v = values[c.name];
      if (c.type === "json" && typeof v === "string" && v.trim()) {
        try { v = JSON.parse(v); } catch (e: any) { errors[c.name] = "Invalid JSON"; continue; }
      }
      clean[c.name] = v;
    }
    if (Object.keys(errors).length) { setJsonErrors(errors); return; }
    onSubmit(clean);
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isNew ? "New row" : "Edit row"} · {table.name}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {table.columns.map((c) => {
            const disabled = c.isReadonly && !(isNew && c.name === "id");
            return (
              <div key={c.name} className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-ink/60 flex items-center gap-1">
                  {c.name}
                  {!c.nullable && <span className="text-red-500">*</span>}
                  <span className="text-ink/30 font-mono normal-case text-[10px]">{c.type}</span>
                  {c.fkRef && <span className="text-ink/40 text-[10px]">→ {c.fkRef}</span>}
                </Label>
                {c.type === "bool" ? (
                  <div className="flex items-center gap-2">
                    <Switch checked={!!values[c.name]} onCheckedChange={(v) => setField(c.name, v)} disabled={disabled} />
                    <span className="text-xs text-ink/60">{String(!!values[c.name])}</span>
                  </div>
                ) : c.type === "enum" && c.enumValues ? (
                  <Select value={String(values[c.name] ?? "")} onValueChange={(v) => setField(c.name, v)} disabled={disabled}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      {c.enumValues.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : c.type === "json" ? (
                  <>
                    <Textarea
                      value={values[c.name] ?? ""}
                      onChange={(e) => setField(c.name, e.target.value)}
                      className="font-mono text-xs min-h-32"
                      disabled={disabled}
                    />
                    {jsonErrors[c.name] && <div className="text-xs text-red-600">{jsonErrors[c.name]}</div>}
                  </>
                ) : (
                  <Input
                    value={values[c.name] ?? ""}
                    onChange={(e) => setField(c.name, e.target.value)}
                    type={c.type === "int" || c.type === "float" ? "number" : "text"}
                    step={c.type === "float" ? "any" : undefined}
                    disabled={disabled}
                  />
                )}
              </div>
            );
          })}
        </div>
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : isNew ? "Create" : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
