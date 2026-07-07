import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  preview: boolean,
): Promise<PageBlockContent | null> {
  let query = supabase
    .from("page_blocks")
    .select("content, published, updated_at")
    .eq("page_slug", page)
    .eq("block_key", key);

  if (!preview) query = query.eq("published", true);

  const { data, error } = await query.order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return (data?.content as PageBlockContent) ?? null;
}

/**
 * Fetch a CMS-managed block with a hardcoded fallback so the site never breaks
 * if the block is missing or unpublished. When ?preview=1 is present in the URL,
 * unpublished drafts are shown too (requires admin/editor read access via RLS).
 */
export function usePageBlock<T extends PageBlockContent>(
  page: string,
  key: string,
  fallback: T,
): T {
  const preview = isPreviewMode();
  const { data } = useQuery({
    queryKey: ["page_block", page, key, preview ? "preview" : "live"],
    queryFn: () => fetchPageBlock(page, key, preview),
    staleTime: preview ? 0 : 5 * 60_000,
    gcTime: 30 * 60_000,
  });
  return { ...fallback, ...(data ?? {}) } as T;
}
