import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: {
  supabase: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }> };
  userId: string;
}) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

export type SystemInfo = {
  domain: {
    previewUrl: string;
    publishedUrl: string;
    customDomains: string[];
    supabaseUrl: string;
    supabasePublishableKey: string;
    projectId: string;
  };
  hosting: {
    provider: string;
    runtime: string;
    region: string;
    nodeCompat: boolean;
  };
  backend: {
    dbTables: number;
    dbSizeMb: number | null;
    storageBuckets: number;
    storageObjects: number;
    storageSizeMb: number | null;
    usersTotal: number;
    usersNew7d: number;
    lastSignInAt: string | null;
  };
  activity: {
    pageViews24h: number;
    pageViews30d: number;
    leadsTotal: number;
    leadsThisMonth: number;
    modelsTotal: number;
    modelsPublished: number;
    dealersTotal: number;
    contentBlocks: number;
    contentDrafts: number;
  };
  secrets: { name: string; managed: boolean }[];
  connectors: { name: string; status: "active" | "inactive" }[];
  api: {
    serverFunctions: string[];
    publicEndpoints: string[];
  };
  ai: {
    available: boolean;
    hint: string;
  };
  fetchedAt: string;
};

export const getSystemInfo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SystemInfo> => {
    await assertAdmin(context);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const now = new Date();
    const day = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const month = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Parallel queries (privileged reads for aggregate counts)
    const [
      views24h,
      views30d,
      leadsTotal,
      leadsMonth,
      modelsAll,
      modelsPub,
      dealersAll,
      blocksAll,
      blocksDraft,
      storageObjs,
    ] = await Promise.all([
      supabaseAdmin.from("analytics_events").select("id", { count: "exact", head: true }).gte("created_at", day).eq("event_type", "page_view"),
      supabaseAdmin.from("analytics_events").select("id", { count: "exact", head: true }).gte("created_at", month).eq("event_type", "page_view"),
      supabaseAdmin.from("quote_requests").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("quote_requests").select("id", { count: "exact", head: true }).gte("created_at", month),
      supabaseAdmin.from("models").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("models").select("id", { count: "exact", head: true }).eq("published", true),
      supabaseAdmin.from("dealers").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("page_blocks").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("page_blocks").select("id", { count: "exact", head: true }).eq("published", false),
    ]);

    // Users
    let usersTotal = 0;
    let usersNew7d = 0;
    let lastSignInAt: string | null = null;
    try {
      const { data: usersList } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const users = usersList?.users ?? [];
      usersTotal = users.length;
      usersNew7d = users.filter((u) => u.created_at && u.created_at >= week).length;
      lastSignInAt = users
        .map((u) => u.last_sign_in_at)
        .filter((x): x is string => !!x)
        .sort()
        .reverse()[0] ?? null;
    } catch {
      // ignore
    }

    // Storage
    let storageBuckets = 0;
    let storageSizeMb: number | null = null;
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      storageBuckets = buckets?.length ?? 0;
    } catch {
      // ignore
    }

    // Public tables count (best-effort)
    const publicTables = [
      "analytics_events",
      "dealers",
      "model_gallery",
      "models",
      "page_block_versions",
      "page_blocks",
      "quote_requests",
      "user_roles",
    ];

    // Known secrets (from project knowledge; names only)
    const secrets = [
      { name: "SUPABASE_URL", managed: true },
      { name: "SUPABASE_PUBLISHABLE_KEY", managed: true },
      { name: "SUPABASE_SERVICE_ROLE_KEY", managed: true },
      { name: "SUPABASE_DB_URL", managed: true },
      { name: "LOVABLE_API_KEY", managed: true },
      { name: "GOOGLE_MAPS_API_KEY", managed: true },
      { name: "GOOGLE_MAPS_BROWSER_KEY", managed: true },
      { name: "GOOGLE_MAPS_TRACKING_ID", managed: true },
    ];

    const connectors = [
      { name: "Google Maps", status: "active" as const },
      { name: "Lovable AI Gateway", status: process.env.LOVABLE_API_KEY ? ("active" as const) : ("inactive" as const) },
    ];

    const supabaseUrl = process.env.SUPABASE_URL ?? "";
    const projectId = supabaseUrl.match(/https?:\/\/([^.]+)\./)?.[1] ?? "";
    const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? "";
    const maskedKey = publishableKey
      ? `${publishableKey.slice(0, 12)}…${publishableKey.slice(-4)}`
      : "";

    return {
      domain: {
        previewUrl: "https://id-preview--0f9a1051-31b4-43a0-bb0f-f10def8a5029.lovable.app",
        publishedUrl: "https://vivid-web-revival.lovable.app",
        customDomains: [],
        supabaseUrl,
        supabasePublishableKey: maskedKey,
        projectId,
      },
      hosting: {
        provider: "Lovable",
        runtime: "Cloudflare Workers (edge)",
        region: "Auto (global edge)",
        nodeCompat: true,
      },
      backend: {
        dbTables: publicTables.length,
        dbSizeMb: null,
        storageBuckets,
        storageObjects: 0,
        storageSizeMb,
        usersTotal,
        usersNew7d,
        lastSignInAt,
      },
      activity: {
        pageViews24h: views24h.count ?? 0,
        pageViews30d: views30d.count ?? 0,
        leadsTotal: leadsTotal.count ?? 0,
        leadsThisMonth: leadsMonth.count ?? 0,
        modelsTotal: modelsAll.count ?? 0,
        modelsPublished: modelsPub.count ?? 0,
        dealersTotal: dealersAll.count ?? 0,
        contentBlocks: blocksAll.count ?? 0,
        contentDrafts: blocksDraft.count ?? 0,
      },
      secrets,
      connectors,
      api: {
        serverFunctions: [
          "admin.* (roles, dashboard, content, media, dealers, leads, models)",
          "system.* (this page)",
          "models.* (public reads)",
          "quote.* (lead submission)",
        ],
        publicEndpoints: ["/sitemap.xml"],
      },
      ai: {
        available: !!process.env.LOVABLE_API_KEY,
        hint: "Λεπτομερή AI usage & tokens (per-request logs, credits balance) διαχειρίζονται από το Lovable dashboard του workspace.",
      },
      fetchedAt: new Date().toISOString(),
    };
  });

export const systemInfoQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "system"],
    queryFn: () => getSystemInfo(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
