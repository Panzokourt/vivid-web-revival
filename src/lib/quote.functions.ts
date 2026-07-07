import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { EQUIPMENT_IDS, MODEL_SLUGS, ALL_ENGINE_HPS } from "./configurator-options";

const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

const schema = z.object({
  modelSlug: z.enum(MODEL_SLUGS as [string, ...string[]]),
  hullColor: hex,
  tubeColor: hex,
  canopyColor: hex,
  engineHp: z.number().int().refine((n) => ALL_ENGINE_HPS.includes(n), "Invalid HP"),
  equipment: z.array(z.enum(EQUIPMENT_IDS as [string, ...string[]])).max(20),
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const submitQuoteRequest = createServerFn({ method: "POST" })
  .inputValidator((raw) => schema.parse(raw))
  .handler(async ({ data }): Promise<{ ok: true; id: string }> => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const id = crypto.randomUUID();
    const { error } = await supabase.from("quote_requests").insert({
      id,
      model_slug: data.modelSlug,
      hull_color: data.hullColor,
      tube_color: data.tubeColor,
      canopy_color: data.canopyColor,
      engine_hp: data.engineHp,
      equipment: data.equipment,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone || null,
      country: data.country || null,
      message: data.message || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true, id };
  });
