import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { systemInfoQueryOptions, type SystemInfo } from "@/lib/system.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, RefreshCw, Server, Database, HardDrive, Users, Cpu, Key, Plug, Globe, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/system")({
  head: () => ({ meta: [{ title: "System — RIBALI Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminShell>
      <SystemPage />
    </AdminShell>
  ),
});

function copy(v: string) {
  navigator.clipboard.writeText(v).then(() => toast.success("Copied"));
}

function SystemPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery(systemInfoQueryOptions());

  if (isLoading) return <div className="text-sm text-ink/50">Loading…</div>;
  if (error) return <div className="text-sm text-red-600">{(error as Error).message}</div>;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">Operations</div>
          <h1 className="text-3xl font-display mt-1">System</h1>
          <p className="text-sm text-ink/60 mt-2">
            Domain, hosting, backend, AI & API status. Ενημερώνεται αυτόματα κάθε 60″.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </header>

      <DomainCard data={data} />

      <div className="grid gap-4 md:grid-cols-2">
        <HostingCard data={data} />
        <BackendCard data={data} />
      </div>

      <ActivityCard data={data} />

      <div className="grid gap-4 md:grid-cols-2">
        <AiCard data={data} />
        <ConnectorsCard data={data} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SecretsCard data={data} />
        <ApiCard data={data} />
      </div>

      <div className="text-[11px] text-ink/40 text-right">
        Fetched {formatDistanceToNow(new Date(data.fetchedAt), { addSuffix: true })}
      </div>
    </div>
  );
}

function Row({ label, value, mono, action }: { label: string; value: React.ReactNode; mono?: boolean; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-ink/5 last:border-0">
      <div className="text-xs uppercase tracking-widest text-ink/50">{label}</div>
      <div className="flex items-center gap-2 min-w-0">
        <div className={`text-sm truncate ${mono ? "font-mono text-xs" : ""}`}>{value}</div>
        {action}
      </div>
    </div>
  );
}

function CopyBtn({ v }: { v: string }) {
  return (
    <button onClick={() => copy(v)} className="p-1 hover:bg-ink/5 rounded" title="Copy">
      <Copy className="h-3 w-3" />
    </button>
  );
}

function LinkBtn({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-ink/5 rounded" title="Open">
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function DomainCard({ data }: { data: SystemInfo }) {
  const d = data.domain;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Globe className="h-4 w-4" /> Domain & URLs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Row label="Preview" value={d.previewUrl} mono action={<><CopyBtn v={d.previewUrl} /><LinkBtn href={d.previewUrl} /></>} />
        <Row label="Published" value={d.publishedUrl} mono action={<><CopyBtn v={d.publishedUrl} /><LinkBtn href={d.publishedUrl} /></>} />
        <Row
          label="Custom domain"
          value={d.customDomains.length ? d.customDomains.join(", ") : <span className="text-ink/40">Δεν έχει ρυθμιστεί</span>}
        />
        <Row label="Project ID" value={d.projectId || "—"} mono action={d.projectId ? <CopyBtn v={d.projectId} /> : undefined} />
        <Row label="Backend URL" value={d.supabaseUrl} mono action={<CopyBtn v={d.supabaseUrl} />} />
        <Row label="Publishable key" value={d.supabasePublishableKey || "—"} mono />
      </CardContent>
    </Card>
  );
}

function HostingCard({ data }: { data: SystemInfo }) {
  const h = data.hosting;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Server className="h-4 w-4" /> Hosting & Runtime
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Row label="Provider" value={h.provider} />
        <Row label="Runtime" value={h.runtime} />
        <Row label="Region" value={h.region} />
        <Row label="Node compat" value={h.nodeCompat ? <Badge variant="outline" className="text-green-700 border-green-700/40">enabled</Badge> : "disabled"} />
        <Row label="SSR" value={<Badge variant="outline">TanStack Start · Vite 7</Badge>} />
      </CardContent>
    </Card>
  );
}

function BackendCard({ data }: { data: SystemInfo }) {
  const b = data.backend;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Database className="h-4 w-4" /> Backend (Cloud)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Row label="Status" value={<Badge className="bg-green-600 hover:bg-green-600">healthy</Badge>} />
        <Row label="Public tables" value={b.dbTables} />
        <Row label="Storage buckets" value={b.storageBuckets} action={<HardDrive className="h-3 w-3 text-ink/40" />} />
        <Row label="Users total" value={b.usersTotal} action={<Users className="h-3 w-3 text-ink/40" />} />
        <Row label="New users (7d)" value={b.usersNew7d} />
        <Row label="Last sign-in" value={b.lastSignInAt ? formatDistanceToNow(new Date(b.lastSignInAt), { addSuffix: true }) : "—"} />
      </CardContent>
    </Card>
  );
}

function ActivityCard({ data }: { data: SystemInfo }) {
  const a = data.activity;
  const kpis = [
    { label: "Page views 24h", value: a.pageViews24h },
    { label: "Page views 30d", value: a.pageViews30d },
    { label: "Leads total", value: a.leadsTotal },
    { label: "Leads this month", value: a.leadsThisMonth },
    { label: "Models", value: a.modelsTotal },
    { label: "Dealers", value: a.dealersTotal },
    { label: "Content blocks", value: a.contentBlocks },
    { label: "Drafts", value: a.contentDrafts },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Cpu className="h-4 w-4" /> Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label}>
              <div className="text-[10px] uppercase tracking-widest text-ink/50">{k.label}</div>
              <div className="mt-1 text-2xl font-display">{k.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AiCard({ data }: { data: SystemInfo }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> AI Gateway
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Row
          label="Status"
          value={
            data.ai.available ? (
              <Badge className="bg-green-600 hover:bg-green-600">connected</Badge>
            ) : (
              <Badge variant="outline">not configured</Badge>
            )
          }
        />
        <Row label="Provider" value="Lovable AI Gateway" />
        <Row label="Auth" value="LOVABLE_API_KEY (server-side)" mono />
        <p className="mt-4 text-xs text-ink/60 leading-relaxed">{data.ai.hint}</p>
      </CardContent>
    </Card>
  );
}

function ConnectorsCard({ data }: { data: SystemInfo }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Plug className="h-4 w-4" /> Connectors
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.connectors.map((c) => (
          <Row
            key={c.name}
            label={c.name}
            value={
              c.status === "active" ? (
                <Badge className="bg-green-600 hover:bg-green-600">active</Badge>
              ) : (
                <Badge variant="outline">inactive</Badge>
              )
            }
          />
        ))}
      </CardContent>
    </Card>
  );
}

function SecretsCard({ data }: { data: SystemInfo }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Key className="h-4 w-4" /> Secrets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-ink/60 mb-3">Ονόματα μόνο. Οι τιμές δεν εκτίθενται στο admin UI.</p>
        <div className="flex flex-wrap gap-2">
          {data.secrets.map((s) => (
            <Badge key={s.name} variant="outline" className="font-mono text-[11px]">
              {s.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ApiCard({ data }: { data: SystemInfo }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Server className="h-4 w-4" /> API surface
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs uppercase tracking-widest text-ink/50 mb-2">Server functions</div>
        <ul className="space-y-1 mb-4">
          {data.api.serverFunctions.map((s) => (
            <li key={s} className="text-sm font-mono text-xs">{s}</li>
          ))}
        </ul>
        <div className="text-xs uppercase tracking-widest text-ink/50 mb-2">Public endpoints</div>
        <ul className="space-y-1">
          {data.api.publicEndpoints.map((s) => (
            <li key={s} className="text-sm font-mono text-xs">{s}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
