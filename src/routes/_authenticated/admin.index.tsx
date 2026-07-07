import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminDashboardQueryOptions } from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — RIBALI Admin" }, { name: "robots", content: "noindex" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AdminShell>
      <Dashboard />
    </AdminShell>
  );
}

function Dashboard() {
  const { data, isLoading, error } = useQuery(adminDashboardQueryOptions());

  if (isLoading) return <div className="text-sm text-ink/50">Loading…</div>;
  if (error) return <div className="text-sm text-red-600">{(error as Error).message}</div>;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <header>
        <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">Overview</div>
        <h1 className="text-3xl font-display mt-1">Dashboard</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Leads today" value={data.leadsToday} />
        <Kpi label="Leads this month" value={data.leadsThisMonth} />
        <Kpi label="Page views (30d)" value={data.viewsThisMonth} />
        <Kpi label="New / Contacted" value={`${data.statusCounts.new ?? 0} / ${data.statusCounts.contacted ?? 0}`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Latest quote requests</CardTitle>
        </CardHeader>
        <CardContent>
          {data.latest.length === 0 ? (
            <div className="text-sm text-ink/50">No requests yet.</div>
          ) : (
            <ul className="divide-y divide-ink/10">
              {data.latest.map((l) => (
                <li key={l.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{l.full_name}</div>
                    <div className="text-xs text-ink/60">{l.email} · {l.model_slug}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{l.status}</Badge>
                    <span className="text-xs text-ink/50">{formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">{label}</div>
        <div className="mt-2 text-3xl font-display">{value}</div>
      </CardContent>
    </Card>
  );
}
