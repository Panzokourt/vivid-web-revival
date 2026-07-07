import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ─── Role check for gate ────────────────────────────────────────────────────
export const getMyAdminRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: isAdmin }, { data: isEditor }] = await Promise.all([
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "editor" }),
    ]);
    return {
      userId: context.userId,
      email: (context.claims.email as string | undefined) ?? null,
      role: isAdmin ? ("admin" as const) : isEditor ? ("editor" as const) : null,
    };
  });

export const myAdminRoleQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "me"],
    queryFn: () => getMyAdminRole(),
    staleTime: 30_000,
  });

// ─── Dashboard KPIs ─────────────────────────────────────────────────────────
export const getAdminDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    const { data: isEditor } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "editor" });
    if (!isAdmin && !isEditor) throw new Error("Forbidden");

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const [today, month, latest, byStatus, viewsMonth] = await Promise.all([
      context.supabase.from("quote_requests").select("id", { count: "exact", head: true }).gte("created_at", startOfDay),
      context.supabase.from("quote_requests").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth),
      context.supabase.from("quote_requests").select("id, full_name, email, model_slug, status, created_at").order("created_at", { ascending: false }).limit(5),
      context.supabase.from("quote_requests").select("status"),
      context.supabase.from("analytics_events").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth).eq("event_type", "page_view"),
    ]);
    const statusCounts: Record<string, number> = {};
    (byStatus.data ?? []).forEach((r) => {
      const s = (r as { status: string }).status;
      statusCounts[s] = (statusCounts[s] ?? 0) + 1;
    });
    return {
      leadsToday: today.count ?? 0,
      leadsThisMonth: month.count ?? 0,
      viewsThisMonth: viewsMonth.count ?? 0,
      statusCounts,
      latest: (latest.data ?? []) as Array<{
        id: string;
        full_name: string;
        email: string;
        model_slug: string;
        status: string;
        created_at: string;
      }>,
    };
  });

export const adminDashboardQueryOptions = () =>
  queryOptions({ queryKey: ["admin", "dashboard"], queryFn: () => getAdminDashboard() });

// ─── Models ─────────────────────────────────────────────────────────────────
export const adminListModels = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("models")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminModelsQueryOptions = () =>
  queryOptions({ queryKey: ["admin", "models"], queryFn: () => adminListModels() });

const modelUpdateSchema = z.object({
  id: z.string().uuid(),
  patch: z.object({
    name: z.string().min(1).max(120).optional(),
    number: z.string().max(40).optional(),
    tag: z.string().max(40).nullable().optional(),
    tagline: z.string().max(300).nullable().optional(),
    description: z.string().max(4000).nullable().optional(),
    length_m: z.number().nullable().optional(),
    beam_m: z.number().nullable().optional(),
    max_hp: z.number().int().nullable().optional(),
    pax: z.number().int().nullable().optional(),
    weight_kg: z.number().int().nullable().optional(),
    fuel_l: z.number().int().nullable().optional(),
    hull_type: z.string().max(80).nullable().optional(),
    tube_material: z.string().max(80).nullable().optional(),
    hero_image: z.string().max(500).nullable().optional(),
    order_index: z.number().int().optional(),
  }),
});

export const adminUpdateModel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => modelUpdateSchema.parse(raw))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("models").update(data.patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─── Quote requests / Leads ─────────────────────────────────────────────────
export const adminListLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminLeadsQueryOptions = () =>
  queryOptions({ queryKey: ["admin", "leads"], queryFn: () => adminListLeads() });

const leadUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "qualified", "closed"]).optional(),
  notes: z.string().max(4000).nullable().optional(),
});

export const adminUpdateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => leadUpdateSchema.parse(raw))
  .handler(async ({ context, data }) => {
    const patch: { status?: string; notes?: string | null } = {};
    if (data.status !== undefined) patch.status = data.status;
    if (data.notes !== undefined) patch.notes = data.notes;
    const { error } = await context.supabase.from("quote_requests").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─── Dealers ────────────────────────────────────────────────────────────────
export const adminListDealers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("dealers")
      .select("*")
      .order("order_index", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminDealersQueryOptions = () =>
  queryOptions({ queryKey: ["admin", "dealers"], queryFn: () => adminListDealers() });

const dealerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  city: z.string().max(80).nullable().optional(),
  country: z.string().max(80).nullable().optional(),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  email: z.string().max(255).nullable().optional(),
  website: z.string().max(500).nullable().optional(),
  order_index: z.number().int().optional(),
  active: z.boolean().optional(),
});

export const adminUpsertDealer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ id: z.string().uuid().nullable(), values: dealerSchema }).parse(raw))
  .handler(async ({ context, data }) => {
    const values = {
      ...data.values,
      email: data.values.email === "" ? null : data.values.email,
      name: data.values.name,
    };
    if (data.id) {
      const { error } = await context.supabase.from("dealers").update(values).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("dealers").insert(values);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminDeleteDealer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("dealers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─── Page blocks ────────────────────────────────────────────────────────────
export const adminListPageBlocks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("page_blocks")
      .select("*")
      .order("page_slug", { ascending: true })
      .order("block_key", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminPageBlocksQueryOptions = () =>
  queryOptions({ queryKey: ["admin", "page_blocks"], queryFn: () => adminListPageBlocks() });

const blockSchema = z.object({
  page_slug: z.string().trim().min(1).max(80),
  block_key: z.string().trim().min(1).max(80),
  content: z.record(z.string(), z.unknown()),
  published: z.boolean().optional(),
});

export const adminUpsertPageBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => blockSchema.parse(raw))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("page_blocks")
      .upsert(
        {
          page_slug: data.page_slug,
          block_key: data.block_key,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content: data.content as any,
          published: data.published ?? true,
          updated_by: context.userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "page_slug,block_key" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeletePageBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("page_blocks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─── Analytics ──────────────────────────────────────────────────────────────
export const adminGetAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [events, leads] = await Promise.all([
      context.supabase.from("analytics_events").select("event_type, path, model_slug, created_at").gte("created_at", since).limit(5000),
      context.supabase.from("quote_requests").select("created_at, model_slug").gte("created_at", since).limit(2000),
    ]);
    return {
      events: (events.data ?? []) as Array<{ event_type: string; path: string | null; model_slug: string | null; created_at: string }>,
      leads: (leads.data ?? []) as Array<{ created_at: string; model_slug: string }>,
    };
  });

export const adminAnalyticsQueryOptions = () =>
  queryOptions({ queryKey: ["admin", "analytics"], queryFn: () => adminGetAnalytics() });

// ─── User roles / Settings ──────────────────────────────────────────────────
export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden: admin required");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: rolesData }, { data: usersData, error: usersErr }] = await Promise.all([
      context.supabase.from("user_roles").select("user_id, role"),
      supabaseAdmin.auth.admin.listUsers(),
    ]);
    if (usersErr) throw new Error(usersErr.message);
    const rolesByUser: Record<string, string[]> = {};
    (rolesData ?? []).forEach((r) => {
      const row = r as { user_id: string; role: string };
      rolesByUser[row.user_id] = [...(rolesByUser[row.user_id] ?? []), row.role];
    });
    return (usersData.users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? "",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      roles: rolesByUser[u.id] ?? [],
    }));
  });

export const adminUsersQueryOptions = () =>
  queryOptions({ queryKey: ["admin", "users"], queryFn: () => adminListUsers() });

export const adminGrantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({ user_id: z.string().uuid(), role: z.enum(["admin", "editor", "user"]) }).parse(raw),
  )
  .handler(async ({ context, data }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden: admin required");
    const { error } = await context.supabase
      .from("user_roles")
      .insert({ user_id: data.user_id, role: data.role });
    if (error && !error.message.toLowerCase().includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

export const adminRevokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({ user_id: z.string().uuid(), role: z.enum(["admin", "editor", "user"]) }).parse(raw),
  )
  .handler(async ({ context, data }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden: admin required");
    if (data.user_id === context.userId && data.role === "admin") {
      throw new Error("You cannot revoke your own admin role");
    }
    const { error } = await context.supabase
      .from("user_roles")
      .delete()
      .eq("user_id", data.user_id)
      .eq("role", data.role);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─── Media (Storage) ────────────────────────────────────────────────────────
export const adminListMedia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const prefixes = ["", "site"];
    const results: Array<{ name: string; size: number; created_at: string | null; url: string }> = [];
    for (const prefix of prefixes) {
      const { data, error } = await context.supabase.storage.from("media").list(prefix, {
        limit: 200,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) throw new Error(error.message);
      for (const f of data ?? []) {
        if (!f.name || f.name.startsWith(".")) continue;
        // Skip subfolder entries (their metadata is null)
        if (!f.metadata) continue;
        const fullPath = prefix ? `${prefix}/${f.name}` : f.name;
        results.push({
          name: fullPath,
          size: (f.metadata as { size?: number } | null)?.size ?? 0,
          created_at: f.created_at ?? null,
          url: `${SUPABASE_URL}/storage/v1/object/public/media/${fullPath.split("/").map(encodeURIComponent).join("/")}`,
        });
      }
    }
    return results;
  });

export const adminMediaQueryOptions = () =>
  queryOptions({ queryKey: ["admin", "media"], queryFn: () => adminListMedia() });

export const adminDeleteMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ name: z.string().min(1).max(500) }).parse(raw))
  .handler(async ({ context, data }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden: admin required");
    const { error } = await context.supabase.storage.from("media").remove([data.name]);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
