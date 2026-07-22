import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { queryOptions } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

export type ModelListItem = {
  id: string;
  slug: string;
  code: string;
  name: string;
  number: string;
  tag: string | null;
  tagline: string | null;
  length_m: number | null;
  max_hp: number | null;
  pax: number | null;
  hero_image: string | null;
  order_index: number;
  series_slug: string | null;
  hull_material: string | null;
};

export type ModelSeries = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  hull_material: "polyester" | "aluminium";
  hero_image: string | null;
  sort_order: number;
};

export type ModelDetail = ModelListItem & {
  description: string | null;
  beam_m: number | null;
  fuel_l: number | null;
  weight_kg: number | null;
  hull_type: string | null;
  tube_material: string | null;
  gallery: {
    id: string;
    image_url: string;
    caption: string | null;
    order_index: number;
  }[];
};

function serverClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

export const listModels = createServerFn({ method: "GET" }).handler(
  async (): Promise<ModelListItem[]> => {
    const supabase = serverClient();
    const { data, error } = await supabase
      .from("models")
      .select(
        "id, slug, code, name, number, tag, tagline, length_m, max_hp, pax, hero_image, order_index",
      )
      .order("order_index", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
);

export const getModelBySlug = createServerFn({ method: "GET" })
  .inputValidator((raw) => z.object({ slug: z.string().min(1) }).parse(raw))
  .handler(async ({ data }): Promise<ModelDetail> => {
    const supabase = serverClient();
    const { data: model, error } = await supabase
      .from("models")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!model) throw notFound();

    const { data: gallery, error: gErr } = await supabase
      .from("model_gallery")
      .select("id, image_url, caption, order_index")
      .eq("model_id", model.id)
      .order("order_index", { ascending: true });
    if (gErr) throw new Error(gErr.message);

    return { ...model, gallery: gallery ?? [] } as ModelDetail;
  });

export const modelsListQueryOptions = () =>
  queryOptions({
    queryKey: ["models"],
    queryFn: () => listModels(),
  });

export const modelDetailQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["models", slug],
    queryFn: () => getModelBySlug({ data: { slug } }),
  });
