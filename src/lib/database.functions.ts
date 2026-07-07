import { createServerFn } from "@tanstack/react-start";
import { queryOptions, keepPreviousData } from "@tanstack/react-query";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ─── Schema metadata ────────────────────────────────────────────────────────
export type ColumnType =
  | "uuid"
  | "text"
  | "int"
  | "float"
  | "bool"
  | "timestamp"
  | "date"
  | "json"
  | "enum";

export type ColumnMeta = {
  name: string;
  type: ColumnType;
  nullable: boolean;
  isPk?: boolean;
  isReadonly?: boolean;
  enumValues?: string[];
  fkRef?: string;
};

export type TableMeta = {
  schema: "public" | "auth";
  name: string;
  label: string;
  readOnly?: boolean;
  pk: string;
  searchColumns: string[];
  defaultSort: { column: string; ascending: boolean };
  columns: ColumnMeta[];
};

const READONLY_TIMESTAMPS: ColumnMeta[] = [
  { name: "created_at", type: "timestamp", nullable: false, isReadonly: true },
  { name: "updated_at", type: "timestamp", nullable: false, isReadonly: true },
];

const PK_UUID: ColumnMeta = { name: "id", type: "uuid", nullable: false, isPk: true, isReadonly: true };

export const TABLES: TableMeta[] = [
  {
    schema: "public",
    name: "models",
    label: "Models",
    pk: "id",
    searchColumns: ["name", "code", "slug", "tagline"],
    defaultSort: { column: "created_at", ascending: false },
    columns: [
      PK_UUID,
      { name: "slug", type: "text", nullable: false },
      { name: "code", type: "text", nullable: false },
      { name: "name", type: "text", nullable: false },
      { name: "tagline", type: "text", nullable: true },
      { name: "description", type: "text", nullable: true },
      { name: "hero_image_url", type: "text", nullable: true },
      { name: "length_m", type: "float", nullable: true },
      { name: "beam_m", type: "float", nullable: true },
      { name: "weight_kg", type: "int", nullable: true },
      { name: "max_hp", type: "int", nullable: true },
      { name: "fuel_l", type: "int", nullable: true },
      { name: "passengers", type: "int", nullable: true },
      { name: "top_speed_kn", type: "int", nullable: true },
      { name: "price_from_eur", type: "int", nullable: true },
      { name: "featured", type: "bool", nullable: false },
      { name: "published", type: "bool", nullable: false },
      { name: "order_index", type: "int", nullable: false },
      ...READONLY_TIMESTAMPS,
    ],
  },
  {
    schema: "public",
    name: "model_gallery",
    label: "Model gallery",
    pk: "id",
    searchColumns: ["caption", "image_url"],
    defaultSort: { column: "order_index", ascending: true },
    columns: [
      PK_UUID,
      { name: "model_id", type: "uuid", nullable: false, fkRef: "models.id" },
      { name: "image_url", type: "text", nullable: false },
      { name: "caption", type: "text", nullable: true },
      { name: "order_index", type: "int", nullable: false },
      { name: "created_at", type: "timestamp", nullable: false, isReadonly: true },
    ],
  },
  {
    schema: "public",
    name: "dealers",
    label: "Dealers",
    pk: "id",
    searchColumns: ["name", "city", "country", "email"],
    defaultSort: { column: "order_index", ascending: true },
    columns: [
      PK_UUID,
      { name: "name", type: "text", nullable: false },
      { name: "city", type: "text", nullable: true },
      { name: "country", type: "text", nullable: true },
      { name: "email", type: "text", nullable: true },
      { name: "phone", type: "text", nullable: true },
      { name: "website", type: "text", nullable: true },
      { name: "lat", type: "float", nullable: true },
      { name: "lng", type: "float", nullable: true },
      { name: "active", type: "bool", nullable: false },
      { name: "order_index", type: "int", nullable: false },
      ...READONLY_TIMESTAMPS,
    ],
  },
  {
    schema: "public",
    name: "quote_requests",
    label: "Leads (quotes)",
    pk: "id",
    searchColumns: ["full_name", "email", "phone", "model_slug", "message"],
    defaultSort: { column: "created_at", ascending: false },
    columns: [
      PK_UUID,
      { name: "full_name", type: "text", nullable: false },
      { name: "email", type: "text", nullable: false },
      { name: "phone", type: "text", nullable: true },
      { name: "country", type: "text", nullable: true },
      { name: "model_slug", type: "text", nullable: true },
      { name: "configuration", type: "json", nullable: true },
      { name: "message", type: "text", nullable: true },
      { name: "status", type: "text", nullable: false },
      { name: "assigned_to", type: "uuid", nullable: true },
      { name: "notes", type: "text", nullable: true },
      { name: "source", type: "text", nullable: true },
      { name: "utm", type: "json", nullable: true },
      { name: "user_agent", type: "text", nullable: true },
      { name: "ip_address", type: "text", nullable: true },
      ...READONLY_TIMESTAMPS,
    ],
  },
  {
    schema: "public",
    name: "page_blocks",
    label: "Page blocks",
    pk: "id",
    searchColumns: ["page_slug", "block_key"],
    defaultSort: { column: "updated_at", ascending: false },
    columns: [
      PK_UUID,
      { name: "page_slug", type: "text", nullable: false },
      { name: "block_key", type: "text", nullable: false },
      { name: "content", type: "json", nullable: false },
      { name: "published", type: "bool", nullable: false },
      { name: "updated_by", type: "uuid", nullable: true },
      ...READONLY_TIMESTAMPS,
    ],
  },
  {
    schema: "public",
    name: "page_block_versions",
    label: "Block versions",
    pk: "id",
    searchColumns: ["page_slug", "block_key"],
    defaultSort: { column: "created_at", ascending: false },
    columns: [
      PK_UUID,
      { name: "block_id", type: "uuid", nullable: false, fkRef: "page_blocks.id" },
      { name: "page_slug", type: "text", nullable: false },
      { name: "block_key", type: "text", nullable: false },
      { name: "version", type: "int", nullable: false },
      { name: "content", type: "json", nullable: false },
      { name: "published", type: "bool", nullable: false },
      { name: "created_by", type: "uuid", nullable: true },
      { name: "created_at", type: "timestamp", nullable: false, isReadonly: true },
    ],
  },
  {
    schema: "public",
    name: "analytics_events",
    label: "Analytics events",
    pk: "id",
    searchColumns: ["event_type", "path", "model_slug", "session_id"],
    defaultSort: { column: "created_at", ascending: false },
    columns: [
      PK_UUID,
      { name: "event_type", type: "text", nullable: false },
      { name: "path", type: "text", nullable: true },
      { name: "model_slug", type: "text", nullable: true },
      { name: "session_id", type: "text", nullable: true },
      { name: "meta", type: "json", nullable: true },
      { name: "created_at", type: "timestamp", nullable: false, isReadonly: true },
    ],
  },
  {
    schema: "public",
    name: "user_roles",
    label: "User roles",
    pk: "id",
    searchColumns: ["user_id", "role"],
    defaultSort: { column: "created_at", ascending: false },
    columns: [
      PK_UUID,
      { name: "user_id", type: "uuid", nullable: false },
      { name: "role", type: "enum", nullable: false, enumValues: ["admin", "editor", "user"] },
      { name: "created_at", type: "timestamp", nullable: false, isReadonly: true },
    ],
  },
  {
    schema: "auth",
    name: "users",
    label: "Auth users",
    readOnly: true,
    pk: "id",
    searchColumns: ["email"],
    defaultSort: { column: "created_at", ascending: false },
    columns: [
      { name: "id", type: "uuid", nullable: false, isPk: true, isReadonly: true },
      { name: "email", type: "text", nullable: true, isReadonly: true },
      { name: "phone", type: "text", nullable: true, isReadonly: true },
      { name: "created_at", type: "timestamp", nullable: false, isReadonly: true },
      { name: "last_sign_in_at", type: "timestamp", nullable: true, isReadonly: true },
      { name: "email_confirmed_at", type: "timestamp", nullable: true, isReadonly: true },
      { name: "role", type: "text", nullable: true, isReadonly: true },
    ],
  },
];

function findTable(schema: string, name: string): TableMeta {
  const t = TABLES.find((x) => x.schema === schema && x.name === name);
  if (!t) throw new Error(`Unknown table ${schema}.${name}`);
  return t;
}

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data: isAdmin } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

// ─── List tables ────────────────────────────────────────────────────────────
export const listTables = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    return TABLES.map((t) => ({
      schema: t.schema,
      name: t.name,
      label: t.label,
      readOnly: !!t.readOnly,
      pk: t.pk,
      columns: t.columns,
    }));
  });

export const tablesListQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "db", "tables"],
    queryFn: () => listTables(),
    staleTime: 60_000 * 10,
  });

// ─── Query rows ─────────────────────────────────────────────────────────────
const QueryInput = z.object({
  schema: z.enum(["public", "auth"]),
  table: z.string(),
  search: z.string().optional().default(""),
  sortColumn: z.string().optional(),
  sortAsc: z.boolean().optional().default(false),
  page: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(200).default(50),
});

export const queryTable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => QueryInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const meta = findTable(data.schema, data.table);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (meta.schema === "auth" && meta.name === "users") {
      const perPage = data.pageSize;
      const { data: res, error } = await supabaseAdmin.auth.admin.listUsers({
        page: data.page + 1,
        perPage,
      });
      if (error) throw error;
      let rows = (res?.users ?? []).map((u: any) => ({
        id: u.id,
        email: u.email ?? null,
        phone: u.phone ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        email_confirmed_at: u.email_confirmed_at ?? null,
        role: u.role ?? null,
      }));
      if (data.search.trim()) {
        const q = data.search.toLowerCase();
        rows = rows.filter((r) => (r.email ?? "").toLowerCase().includes(q));
      }
      return { rows, total: (res as any)?.total ?? rows.length + data.page * perPage };
    }

    const sortColumn = data.sortColumn ?? meta.defaultSort.column;
    const sortAsc = data.sortColumn ? data.sortAsc : meta.defaultSort.ascending;
    const from = data.page * data.pageSize;
    const to = from + data.pageSize - 1;

    let q = supabaseAdmin
      .from(meta.name as any)
      .select("*", { count: "exact" })
      .order(sortColumn, { ascending: sortAsc })
      .range(from, to);

    if (data.search.trim() && meta.searchColumns.length) {
      const pattern = `%${data.search.replace(/[%_]/g, "\\$&")}%`;
      const or = meta.searchColumns.map((c) => `${c}.ilike.${pattern}`).join(",");
      q = q.or(or);
    }

    const { data: rows, count, error } = await q;
    if (error) throw error;
    return { rows: rows ?? [], total: count ?? 0 };
  });

export const tableRowsQueryOptions = (params: z.infer<typeof QueryInput>) =>
  queryOptions({
    queryKey: ["admin", "db", "rows", params],
    queryFn: () => queryTable({ data: params }),
    staleTime: 5_000,
    placeholderData: keepPreviousData,
  });

// ─── Mutations ──────────────────────────────────────────────────────────────
const MutateSchema = z.object({
  table: z.string(),
  values: z.record(z.string(), z.unknown()),
});

export const insertRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => MutateSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const meta = findTable("public", data.table);
    if (meta.readOnly) throw new Error("Table is read-only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const clean = sanitizeValues(meta, data.values, /*forInsert*/ true);
    const { data: row, error } = await supabaseAdmin.from(meta.name as any).insert(clean).select("*").single();
    if (error) throw new Error(error.message);
    return row;
  });

const UpdateSchema = z.object({
  table: z.string(),
  pk: z.union([z.string(), z.number()]),
  values: z.record(z.string(), z.unknown()),
});

export const updateRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const meta = findTable("public", data.table);
    if (meta.readOnly) throw new Error("Table is read-only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const clean = sanitizeValues(meta, data.values, false);
    const { data: row, error } = await supabaseAdmin
      .from(meta.name as any)
      .update(clean)
      .eq(meta.pk, data.pk as any)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const DeleteSchema = z.object({
  table: z.string(),
  ids: z.array(z.union([z.string(), z.number()])).min(1),
});

export const deleteRows = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => DeleteSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const meta = findTable("public", data.table);
    if (meta.readOnly) throw new Error("Table is read-only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error, count } = await supabaseAdmin
      .from(meta.name as any)
      .delete({ count: "exact" })
      .in(meta.pk, data.ids as any[]);
    if (error) throw new Error(error.message);
    return { deleted: count ?? 0 };
  });

function sanitizeValues(meta: TableMeta, values: Record<string, unknown>, forInsert: boolean) {
  const out: Record<string, unknown> = {};
  for (const col of meta.columns) {
    if (col.isReadonly && !(forInsert && col.name === "id" && values.id)) continue;
    if (!(col.name in values)) continue;
    const raw = values[col.name];
    if (raw === "" && col.nullable) {
      out[col.name] = null;
      continue;
    }
    if (raw === null || raw === undefined) {
      out[col.name] = null;
      continue;
    }
    switch (col.type) {
      case "int":
        out[col.name] = typeof raw === "number" ? raw : parseInt(String(raw), 10);
        break;
      case "float":
        out[col.name] = typeof raw === "number" ? raw : parseFloat(String(raw));
        break;
      case "bool":
        out[col.name] = raw === true || raw === "true";
        break;
      case "json":
        out[col.name] = typeof raw === "string" ? JSON.parse(raw) : raw;
        break;
      default:
        out[col.name] = raw;
    }
  }
  return out;
}
