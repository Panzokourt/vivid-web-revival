import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const RICH_ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li", "code"];
const RICH_ALLOWED_ATTR = { a: ["href", "target", "rel"] } as const;

function sanitizeContent(input: unknown): unknown {
  if (typeof input === "string") {
    // Only sanitize obvious HTML strings; leave plain text alone
    if (input.includes("<")) {
      return sanitizeHtml(input, {
        allowedTags: RICH_ALLOWED_TAGS,
        allowedAttributes: RICH_ALLOWED_ATTR as unknown as sanitizeHtml.IOptions["allowedAttributes"],
        allowedSchemes: ["http", "https", "mailto", "tel"],
        transformTags: {
          a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
        },
      });
    }
    return input;
  }
  if (Array.isArray(input)) return input.map(sanitizeContent);
  if (input && typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) out[k] = sanitizeContent(v);
    return out;
  }
  return input;
}


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
      .order("sort_order", { ascending: true })
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
    const clean = sanitizeContent(data.content) as Record<string, unknown>;
    const { error } = await context.supabase
      .from("page_blocks")
      .upsert(
        {
          page_slug: data.page_slug,
          block_key: data.block_key,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content: clean as any,
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

// Per-block publish toggle
export const adminSetBlockPublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ id: z.string().uuid(), published: z.boolean() }).parse(raw))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("page_blocks")
      .update({ published: data.published, updated_by: context.userId, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Per-page bulk publish
export const adminSetPagePublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ page_slug: z.string().min(1).max(80), published: z.boolean() }).parse(raw))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("page_blocks")
      .update({ published: data.published, updated_by: context.userId, updated_at: new Date().toISOString() })
      .eq("page_slug", data.page_slug);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Reorder blocks within a page
export const adminReorderBlocks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({
      page_slug: z.string().min(1).max(80),
      ordered_ids: z.array(z.string().uuid()).min(1).max(200),
    }).parse(raw),
  )
  .handler(async ({ context, data }) => {
    // Sequential updates, small N (typically <20)
    for (let i = 0; i < data.ordered_ids.length; i++) {
      const { error } = await context.supabase
        .from("page_blocks")
        .update({ sort_order: (i + 1) * 10 })
        .eq("id", data.ordered_ids[i])
        .eq("page_slug", data.page_slug);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ─── Versioning ─────────────────────────────────────────────────────────────
export const adminListBlockVersions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ block_id: z.string().uuid() }).parse(raw))
  .handler(async ({ context, data }) => {
    const { data: rows, error } = await context.supabase
      .from("page_block_versions")
      .select("id, version, published, created_at, created_by")
      .eq("block_id", data.block_id)
      .order("version", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);

    // Enrich with email via admin API
    const userIds = Array.from(new Set((rows ?? []).map((r) => r.created_by).filter((x): x is string => !!x)));
    let emailById: Record<string, string> = {};
    if (userIds.length > 0) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      emailById = Object.fromEntries((usersData?.users ?? []).map((u) => [u.id, u.email ?? ""]));
    }
    return (rows ?? []).map((r) => ({
      id: r.id,
      version: r.version,
      published: r.published,
      created_at: r.created_at,
      created_by: r.created_by,
      created_by_email: r.created_by ? (emailById[r.created_by] ?? null) : null,
    }));
  });

export const adminGetBlockVersion = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ version_id: z.string().uuid() }).parse(raw))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("page_block_versions")
      .select("*")
      .eq("id", data.version_id)
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminRestoreBlockVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ version_id: z.string().uuid() }).parse(raw))
  .handler(async ({ context, data }) => {
    const { data: v, error: vErr } = await context.supabase
      .from("page_block_versions")
      .select("block_id, content, published")
      .eq("id", data.version_id)
      .single();
    if (vErr) throw new Error(vErr.message);
    const { error } = await context.supabase
      .from("page_blocks")
      .update({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content: v.content as any,
        published: v.published,
        updated_by: context.userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", v.block_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Recent changes across all blocks
export const adminRecentBlockChanges = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: rows, error } = await context.supabase
      .from("page_block_versions")
      .select("id, block_id, page_slug, block_key, version, published, created_at, created_by")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);

    const userIds = Array.from(new Set((rows ?? []).map((r) => r.created_by).filter((x): x is string => !!x)));
    let emailById: Record<string, string> = {};
    if (userIds.length > 0) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      emailById = Object.fromEntries((usersData?.users ?? []).map((u) => [u.id, u.email ?? ""]));
    }
    return (rows ?? []).map((r) => ({
      ...r,
      created_by_email: r.created_by ? (emailById[r.created_by] ?? null) : null,
    }));
  });

export const adminBlockVersionsQueryOptions = (block_id: string) =>
  queryOptions({
    queryKey: ["admin", "block_versions", block_id],
    queryFn: () => adminListBlockVersions({ data: { block_id } }),
  });

export const adminRecentChangesQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "recent_changes"],
    queryFn: () => adminRecentBlockChanges(),
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
export type MediaFile = {
  name: string;
  size: number;
  mime_type: string | null;
  created_at: string | null;
  updated_at: string | null;
  url: string;
};

export const adminListMedia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MediaFile[]> => {
    const prefixes = ["", "site", "models", "dealers", "uploads"];
    const collected: Array<Omit<MediaFile, "url"> & { path: string }> = [];
    for (const prefix of prefixes) {
      const { data, error } = await context.supabase.storage.from("media").list(prefix, {
        limit: 500,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) continue; // missing prefix is fine
      for (const f of data ?? []) {
        if (!f.name || f.name.startsWith(".")) continue;
        if (!f.metadata) continue; // skip folder entries
        const fullPath = prefix ? `${prefix}/${f.name}` : f.name;
        const meta = f.metadata as { size?: number; mimetype?: string } | null;
        collected.push({
          name: fullPath,
          path: fullPath,
          size: meta?.size ?? 0,
          mime_type: meta?.mimetype ?? null,
          created_at: f.created_at ?? null,
          updated_at: (f as { updated_at?: string }).updated_at ?? null,
        });
      }
    }
    if (collected.length === 0) return [];
    // Sign all URLs in one batch (1h TTL — refreshed on every list fetch).
    const { data: signed, error: signErr } = await context.supabase.storage
      .from("media")
      .createSignedUrls(collected.map((c) => c.path), 60 * 60);
    if (signErr) throw new Error(signErr.message);
    const urlMap = new Map<string, string>();
    for (const s of signed ?? []) if (s.path && s.signedUrl) urlMap.set(s.path, s.signedUrl);
    return collected.map(({ path, ...rest }) => ({ ...rest, url: urlMap.get(path) ?? "" }));
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

export const adminBulkDeleteMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => z.object({ names: z.array(z.string().min(1).max(500)).min(1).max(200) }).parse(raw))
  .handler(async ({ context, data }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden: admin required");
    const { error } = await context.supabase.storage.from("media").remove(data.names);
    if (error) throw new Error(error.message);
    return { ok: true, count: data.names.length };
  });

// Move a batch of files to a target folder (or root when to_folder === "").
export const adminMoveMediaFiles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({
      names: z.array(z.string().min(1).max(500)).min(1).max(200),
      to_folder: z.string().max(200).regex(/^([a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*)?$/).default(""),
    }).parse(raw),
  )
  .handler(async ({ context, data }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden: admin required");
    const prefix = data.to_folder ? `${data.to_folder}/` : "";
    let moved = 0;
    for (const from of data.names) {
      const base = from.includes("/") ? from.slice(from.lastIndexOf("/") + 1) : from;
      const to = `${prefix}${base}`;
      if (to === from) continue;
      const { error } = await context.supabase.storage.from("media").move(from, to);
      if (!error) moved++;
    }
    return { ok: true, count: moved };
  });

// Rename a folder = move every file whose path starts with `${from}/` to `${to}/…`.
export const adminRenameMediaFolder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({
      from: z.string().min(1).max(200).regex(/^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/),
      to: z.string().min(1).max(200).regex(/^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/),
    }).parse(raw),
  )
  .handler(async ({ context, data }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden: admin required");
    if (data.from === data.to) return { ok: true, count: 0 };
    const { data: list, error } = await context.supabase.storage.from("media").list(data.from, { limit: 1000 });
    if (error) throw new Error(error.message);
    let moved = 0;
    for (const f of list ?? []) {
      if (!f.name || !f.metadata) continue;
      const { error: mErr } = await context.supabase.storage.from("media").move(`${data.from}/${f.name}`, `${data.to}/${f.name}`);
      if (!mErr) moved++;
    }
    return { ok: true, count: moved };
  });

// Delete a whole folder = remove every file whose path starts with `${prefix}/`.
export const adminDeleteMediaFolder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({
      prefix: z.string().min(1).max(200).regex(/^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/),
    }).parse(raw),
  )
  .handler(async ({ context, data }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden: admin required");
    const { data: list, error } = await context.supabase.storage.from("media").list(data.prefix, { limit: 1000 });
    if (error) throw new Error(error.message);
    const paths = (list ?? []).filter((f) => f.name && f.metadata).map((f) => `${data.prefix}/${f.name}`);
    if (paths.length === 0) return { ok: true, count: 0 };
    const { error: rmErr } = await context.supabase.storage.from("media").remove(paths);
    if (rmErr) throw new Error(rmErr.message);
    return { ok: true, count: paths.length };
  });

// Set a specific media field on a block. `path` is dot notation (e.g. "image_key" or "items.2.image_key").
export const adminSetBlockMediaField = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({
      block_id: z.string().uuid(),
      path: z.string().min(1).max(200).regex(/^[a-zA-Z0-9_.]+$/),
      value: z.string().min(1).max(500),
    }).parse(raw),
  )
  .handler(async ({ context, data }) => {
    const { data: block, error } = await context.supabase
      .from("page_blocks")
      .select("content")
      .eq("id", data.block_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!block) throw new Error("Block not found");

    // Deep-set the value at the dotted path (numeric segments = array indices).
    const content = (block.content && typeof block.content === "object" ? { ...(block.content as Record<string, unknown>) } : {}) as Record<string, unknown>;
    const segs = data.path.split(".");
    let cursor: Record<string, unknown> | unknown[] = content;
    for (let i = 0; i < segs.length - 1; i++) {
      const key = segs[i];
      const idx = /^\d+$/.test(key) ? Number(key) : key;
      const next = (cursor as Record<string | number, unknown>)[idx as never];
      if (next && typeof next === "object") {
        (cursor as Record<string | number, unknown>)[idx as never] = Array.isArray(next) ? [...next] : { ...(next as Record<string, unknown>) };
      } else {
        (cursor as Record<string | number, unknown>)[idx as never] = /^\d+$/.test(segs[i + 1]) ? [] : {};
      }
      cursor = (cursor as Record<string | number, unknown>)[idx as never] as Record<string, unknown> | unknown[];
    }
    const last = segs[segs.length - 1];
    (cursor as Record<string | number, unknown>)[(/^\d+$/.test(last) ? Number(last) : last) as never] = data.value;

    const { error: uErr } = await context.supabase
      .from("page_blocks")
      .update({ content: content as never, updated_by: context.userId })
      .eq("id", data.block_id);
    if (uErr) throw new Error(uErr.message);
    return { ok: true };
  });

// Clear a specific media field on a block (unlinks the value; sets to "").
export const adminClearBlockMediaField = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) =>
    z.object({
      block_id: z.string().uuid(),
      path: z.string().min(1).max(200).regex(/^[a-zA-Z0-9_.]+$/),
    }).parse(raw),
  )
  .handler(async ({ context, data }) => {
    const { data: block, error } = await context.supabase
      .from("page_blocks")
      .select("content")
      .eq("id", data.block_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!block) throw new Error("Block not found");

    const content = (block.content && typeof block.content === "object" ? { ...(block.content as Record<string, unknown>) } : {}) as Record<string, unknown>;
    const segs = data.path.split(".");
    let cursor: Record<string, unknown> | unknown[] = content;
    for (let i = 0; i < segs.length - 1; i++) {
      const key = segs[i];
      const idx = /^\d+$/.test(key) ? Number(key) : key;
      const next = (cursor as Record<string | number, unknown>)[idx as never];
      if (!next || typeof next !== "object") return { ok: true };
      (cursor as Record<string | number, unknown>)[idx as never] = Array.isArray(next) ? [...next] : { ...(next as Record<string, unknown>) };
      cursor = (cursor as Record<string | number, unknown>)[idx as never] as Record<string, unknown> | unknown[];
    }
    const last = segs[segs.length - 1];
    (cursor as Record<string | number, unknown>)[(/^\d+$/.test(last) ? Number(last) : last) as never] = "";

    const { error: uErr } = await context.supabase
      .from("page_blocks")
      .update({ content: content as never, updated_by: context.userId })
      .eq("id", data.block_id);
    if (uErr) throw new Error(uErr.message);
    return { ok: true };
  });



