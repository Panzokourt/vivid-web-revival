import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { queryOptions } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

export type StockBoat = {
  id: string;
  slug: string;
  model_name: string;
  series_slug: string | null;
  condition: "new" | "demo" | "used";
  year: number | null;
  length_m: number | null;
  engine: string | null;
  hours: number | null;
  location: string | null;
  price_eur: number | null;
  price_note: string | null;
  available_from: string | null;
  test_drive_available: boolean;
  hero_image: string | null;
  gallery: unknown;
  description: string | null;
  highlights: string[];
  status: "available" | "reserved" | "sold" | "hidden";
  sort_order: number;
};

function serverClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const listStock = createServerFn({ method: "GET" }).handler(async (): Promise<StockBoat[]> => {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from("stock_boats")
    .select("*")
    .neq("status", "hidden")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    ...r,
    highlights: Array.isArray(r.highlights) ? (r.highlights as string[]) : [],
  })) as StockBoat[];
});

export const stockListQueryOptions = () =>
  queryOptions({ queryKey: ["stock"], queryFn: () => listStock() });
