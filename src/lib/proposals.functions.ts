import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type Proposal = {
  id: string;
  slug: string;
  persona: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  heroImage: string | null;
  priceFrom: number | null;
  presetId: string | null;
  equipmentSummary: string[];
  ctaLabel: string | null;
  sortOrder: number;
  titleEn: string | null;
  subtitleEn: string | null;
  descriptionEn: string | null;
  ctaLabelEn: string | null;
};

function serverClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function mapRow(r: Database["public"]["Tables"]["proposals"]["Row"]): Proposal {
  return {
    id: r.id,
    slug: r.slug,
    persona: r.persona,
    title: r.title,
    subtitle: r.subtitle,
    description: r.description,
    heroImage: r.hero_image,
    priceFrom: r.price_from,
    presetId: r.preset_id,
    equipmentSummary: Array.isArray(r.equipment_summary) ? (r.equipment_summary as string[]) : [],
    ctaLabel: r.cta_label,
    sortOrder: r.sort_order,
    titleEn: r.title_en,
    subtitleEn: r.subtitle_en,
    descriptionEn: r.description_en,
    ctaLabelEn: r.cta_label_en,
  };
}

export const listProposals = createServerFn({ method: "GET" }).handler(async (): Promise<Proposal[]> => {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
});

export const getProposalBySlug = createServerFn({ method: "GET" })
  .inputValidator((raw) => z.object({ slug: z.string().min(1) }).parse(raw))
  .handler(async ({ data }): Promise<Proposal> => {
    const supabase = serverClient();
    const { data: row, error } = await supabase
      .from("proposals")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw notFound();
    return mapRow(row);
  });

export const proposalsListQueryOptions = () =>
  queryOptions({
    queryKey: ["proposals"],
    queryFn: () => listProposals(),
    staleTime: 5 * 60_000,
  });

export const proposalDetailQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["proposals", slug],
    queryFn: () => getProposalBySlug({ data: { slug } }),
  });
