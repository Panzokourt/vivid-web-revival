import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { myAdminRoleQueryOptions, adminUpsertPageBlock } from "@/lib/admin.functions";
import type { FieldType } from "@/lib/cms/schemas";

type BlockKey = string; // `${page}/${block}`
const bk = (page: string, block: string): BlockKey => `${page}/${block}`;

export type EditableFieldType = Extract<FieldType, "text" | "textarea" | "richtext" | "url" | "image">;

export type OpenField = {
  page: string;
  block: string;
  field: string;
  label: string;
  type: EditableFieldType;
};

type Ctx = {
  isAdmin: boolean;
  mode: "view" | "edit";
  enable: () => void;
  disable: () => void;

  drafts: Record<BlockKey, Record<string, unknown>>;
  dirty: Set<BlockKey>;

  registerBaseline: (page: string, block: string, content: Record<string, unknown>) => void;
  getFieldValue: (page: string, block: string, field: string) => unknown;
  setFieldValue: (page: string, block: string, field: string, value: unknown) => void;

  open: OpenField | null;
  openField: (o: OpenField) => void;
  closeField: () => void;

  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  discard: () => void;
  saving: boolean;
};

const EditorCtx = createContext<Ctx | null>(null);

export function useEditor() {
  const c = useContext(EditorCtx);
  if (!c) throw new Error("useEditor must be used within EditorProvider");
  return c;
}

export function useEditorOptional() {
  return useContext(EditorCtx);
}

export function EditorProvider({ children }: { children: ReactNode }) {
  const { data: me } = useQuery({ ...myAdminRoleQueryOptions(), retry: false });
  const isAdmin = me?.role === "admin" || me?.role === "editor";

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [drafts, setDrafts] = useState<Record<BlockKey, Record<string, unknown>>>({});
  const [baselines, setBaselines] = useState<Record<BlockKey, Record<string, unknown>>>({});
  const [dirty, setDirty] = useState<Set<BlockKey>>(new Set());
  const [open, setOpen] = useState<OpenField | null>(null);
  const [saving, setSaving] = useState(false);

  const qc = useQueryClient();
  const upsert = useServerFn(adminUpsertPageBlock);

  // Add ?preview=1 in edit mode so drafts render.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const has = url.searchParams.get("preview") === "1";
    if (mode === "edit" && !has) {
      url.searchParams.set("preview", "1");
      window.history.replaceState({}, "", url.toString());
      qc.invalidateQueries({ queryKey: ["page_block"] });
    } else if (mode === "view" && has) {
      url.searchParams.delete("preview");
      window.history.replaceState({}, "", url.toString());
      qc.invalidateQueries({ queryKey: ["page_block"] });
    }
  }, [mode, qc]);

  const registerBaseline = useCallback(
    (page: string, block: string, content: Record<string, unknown>) => {
      const key = bk(page, block);
      setBaselines((b) => (b[key] ? b : { ...b, [key]: content }));
    },
    [],
  );

  const getFieldValue = useCallback(
    (page: string, block: string, field: string) => {
      const key = bk(page, block);
      const merged = { ...(baselines[key] ?? {}), ...(drafts[key] ?? {}) };
      return deepGet(merged, field);
    },
    [drafts, baselines],
  );

  const setFieldValue = useCallback(
    (page: string, block: string, field: string, value: unknown) => {
      const key = bk(page, block);
      setDrafts((prev) => {
        const base = baselines[key] ?? {};
        const current = prev[key] ?? deepClone(base);
        const next = deepClone(current);
        deepSet(next, field, value);
        return { ...prev, [key]: next };
      });
      setDirty((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
    },
    [baselines],
  );

  const saveWithMode = useCallback(
    async (published: boolean) => {
      if (dirty.size === 0) {
        toast.info("Δεν υπάρχουν αλλαγές");
        return;
      }
      setSaving(true);
      try {
        // Merge draft over baseline for each dirty block.
        const entries = Array.from(dirty).map((key) => {
          const [page_slug, block_key] = key.split("/");
          const merged = { ...(baselines[key] ?? {}), ...(drafts[key] ?? {}) };
          return { key, page_slug, block_key, content: merged };
        });
        for (const e of entries) {
          await upsert({
            data: {
              page_slug: e.page_slug,
              block_key: e.block_key,
              content: e.content,
              published,
            },
          });
        }
        setDirty(new Set());
        // Update baseline to reflect saved state so re-edits diff correctly.
        setBaselines((prev) => {
          const next = { ...prev };
          for (const e of entries) next[e.key] = { ...(next[e.key] ?? {}), ...drafts[e.key] };
          return next;
        });
        setDrafts({});
        await qc.invalidateQueries({ queryKey: ["page_block"] });
        toast.success(published ? "Δημοσιεύτηκε" : "Αποθηκεύτηκε ως πρόχειρο");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Η αποθήκευση απέτυχε");
      } finally {
        setSaving(false);
      }
    },
    [baselines, drafts, dirty, qc, upsert],
  );

  const saveDraft = useCallback(() => saveWithMode(false), [saveWithMode]);
  const publish = useCallback(() => saveWithMode(true), [saveWithMode]);

  const discard = useCallback(() => {
    setDrafts({});
    setDirty(new Set());
    qc.invalidateQueries({ queryKey: ["page_block"] });
    toast.info("Οι αλλαγές απορρίφθηκαν");
  }, [qc]);

  const value = useMemo<Ctx>(
    () => ({
      isAdmin,
      mode,
      enable: () => setMode("edit"),
      disable: () => setMode("view"),
      drafts,
      dirty,
      registerBaseline,
      getFieldValue,
      setFieldValue,
      open,
      openField: setOpen,
      closeField: () => setOpen(null),
      saveDraft,
      publish,
      discard,
      saving,
    }),
    [isAdmin, mode, drafts, dirty, registerBaseline, getFieldValue, setFieldValue, open, saveDraft, publish, discard, saving],
  );

  return <EditorCtx.Provider value={value}>{children}</EditorCtx.Provider>;
}
