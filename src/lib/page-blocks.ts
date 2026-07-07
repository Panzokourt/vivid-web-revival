import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PageBlockContent = Record<string, unknown>;

async function fetchPageBlock(page: string, key: string): Promise<PageBlockContent | null> {
  const { data, error } = await supabase
    .from("page_blocks")
    .select("content")
    .eq("page_slug", page)
    .eq("block_key", key)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return (data?.content as PageBlockContent) ?? null;
}

/**
 * Fetch a CMS-managed block with a hardcoded fallback so the site never breaks
 * if the block is missing or unpublished. Content shape is per-block.
 */
export function usePageBlock<T extends PageBlockContent>(
  page: string,
  key: string,
  fallback: T,
): T {
  const { data } = useQuery({
    queryKey: ["page_block", page, key],
    queryFn: () => fetchPageBlock(page, key),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
  return { ...fallback, ...(data ?? {}) } as T;
}
