import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import {
  ALL_ENGINE_HPS,
  ENGINE_BRAND_IDS,
  EQUIPMENT_IDS,
  FINANCE_MONTHS,
  MODEL_SLUGS,
  TRAILER_IDS,
} from "./configurator-options";

const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

const priceLine = z.object({ label: z.string().max(80), amount: z.number() });

const schema = z.object({
  modelSlug: z.enum(MODEL_SLUGS as [string, ...string[]]),
  hullColor: hex,
  tubeColor: hex,
  canopyColor: hex,
  engineHp: z.number().int().refine((n) => ALL_ENGINE_HPS.includes(n), "Invalid HP"),
  engineBrand: z.enum(ENGINE_BRAND_IDS as [string, ...string[]]),
  equipment: z.array(z.enum(EQUIPMENT_IDS as [string, ...string[]])).max(30),
  trailerId: z.enum(TRAILER_IDS as [string, ...string[]]),
  financeMonths: z.number().int().refine((n) => FINANCE_MONTHS.includes(n), "Invalid term"),
  financeDown: z.number().min(0).max(1_000_000),
  totalPrice: z.number().min(0).max(10_000_000),
  breakdown: z.object({
    lines: z.array(priceLine).max(50),
    subtotal: z.number(),
    vat: z.number(),
    total: z.number(),
  }),
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
      engine_brand: data.engineBrand,
      equipment: data.equipment,
      trailer_id: data.trailerId,
      finance_months: data.financeMonths,
      finance_down_payment: data.financeDown,
      total_price_eur: data.totalPrice,
      price_breakdown: data.breakdown,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone || null,
      country: data.country || null,
      message: data.message || null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    if (error) throw new Error(error.message);
    return { ok: true, id };
  });
