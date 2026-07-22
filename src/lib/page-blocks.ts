import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useEditorOptional } from "@/components/editor/EditorProvider";
import { DEFAULT_LOCALE, type AppLocale } from "@/lib/i18n";

export type PageBlockContent = Record<string, unknown>;

export function isPreviewMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("preview") === "1";
  } catch {
    return false;
  }
}

async function fetchPageBlock(
  page: string,
  key: string,
  locale: AppLocale,
  preview: boolean,
): Promise<PageBlockContent | null> {
  // Try requested locale first; fall back to default (el) if missing.
  const tryFetch = async (loc: AppLocale) => {
    let query = supabase
      .from("page_blocks")
      .select("content, published, updated_at")
      .eq("page_slug", page)
      .eq("block_key", key)
      .eq("locale", loc);
    if (!preview) query = query.eq("published", true);
    const { data, error } = await query
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (data?.content as PageBlockContent) ?? null;
  };

  const primary = await tryFetch(locale);
  if (primary) return primary;
  if (locale !== DEFAULT_LOCALE) return tryFetch(DEFAULT_LOCALE);
  return null;
}

/**
 * Fetch a CMS-managed block with a hardcoded fallback so the site never breaks
 * if the block is missing or unpublished. When ?preview=1 is present in the URL,
 * unpublished drafts are shown too (requires admin/editor read access via RLS).
 *
 * When the live editor is active, in-progress drafts (from EditorProvider) are
 * overlaid on top of the server content so edits reflect immediately.
 */
export function usePageBlock<T extends PageBlockContent>(
  page: string,
  key: string,
  fallback: T,
): T {
  const preview = isPreviewMode();
  const { i18n } = useTranslation();
  const locale = ((i18n.resolvedLanguage ?? i18n.language ?? DEFAULT_LOCALE).slice(0, 2) as AppLocale);
  const { data } = useQuery({
    queryKey: ["page_block", page, key, locale, preview ? "preview" : "live"],
    queryFn: () => fetchPageBlock(page, key, locale, preview),
    staleTime: preview ? 0 : 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  const editor = useEditorOptional();
  const merged = { ...fallback, ...(data ?? {}) } as T;

  // Register baseline (fallback + server) so the editor can diff drafts against it.
  useEffect(() => {
    if (!editor) return;
    editor.registerBaseline(page, key, merged as Record<string, unknown>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, page, key, JSON.stringify(data ?? null)]);

  // Overlay editor drafts on top when in edit mode.
  const draft = editor?.drafts[`${page}/${key}`];
  if (draft && editor?.mode === "edit") {
    return { ...merged, ...draft } as T;
  }
  return merged;
}

