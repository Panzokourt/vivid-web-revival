import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type ConfiguratorPreset = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  modelSlug: string;
  hullColor: string;
  tubeColor: string;
  canopyColor: string;
  engineHp: number;
  equipment: string[];
  featured: boolean;
  sortOrder: number;
};

function makePublicClient() {
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

export const listPresets = createServerFn({ method: "GET" }).handler(async (): Promise<ConfiguratorPreset[]> => {
  const supabase = makePublicClient();
  const { data, error } = await supabase
    .from("configurator_presets")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    tagline: r.tagline,
    description: r.description,
    modelSlug: r.model_slug,
    hullColor: r.hull_color,
    tubeColor: r.tube_color,
    canopyColor: r.canopy_color,
    engineHp: r.engine_hp,
    equipment: Array.isArray(r.equipment) ? (r.equipment as string[]) : [],
    featured: r.featured,
    sortOrder: r.sort_order,
  }));
});

export const presetsQueryOptions = () =>
  queryOptions({
    queryKey: ["configurator-presets"],
    queryFn: () => listPresets(),
    staleTime: 5 * 60_000,
  });
