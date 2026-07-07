import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminAnalyticsQueryOptions } from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useMemo } from "react";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — RIBALI Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => <AdminShell><AnalyticsPage /></AdminShell>,
});

function AnalyticsPage() {
  const { data, isLoading } = useQuery(adminAnalyticsQueryOptions());

  const { daily, byPath, byModel, totalViews, totalLeads } = useMemo(() => {
    if (!data) return { daily: [], byPath: [], byModel: [], totalViews: 0, totalLeads: 0 };
    const days: Record<string, { date: string; views: number; leads: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      days[key] = { date: key.slice(5), views: 0, leads: 0 };
    }
    let views = 0;
    data.events.forEach((e) => {
      if (e.event_type === "page_view") {
        views++;
        const key = e.created_at.slice(0, 10);
        if (days[key]) days[key].views++;
      }
    });
    data.leads.forEach((l) => {
      const key = l.created_at.slice(0, 10);
      if (days[key]) days[key].leads++;
    });
    const pathCounts: Record<string, number> = {};
    data.events.forEach((e) => {
      if (e.event_type === "page_view" && e.path) {
        pathCounts[e.path] = (pathCounts[e.path] ?? 0) + 1;
      }
    });
    const modelCounts: Record<string, number> = {};
    data.leads.forEach((l) => {
      modelCounts[l.model_slug] = (modelCounts[l.model_slug] ?? 0) + 1;
    });
    return {
      daily: Object.values(days),
      byPath: Object.entries(pathCounts).map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 8),
      byModel: Object.entries(modelCounts).map(([model, count]) => ({ model, count })),
      totalViews: views,
      totalLeads: data.leads.length,
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">Last 30 days</div>
        <h1 className="text-3xl font-display mt-1">Analytics</h1>
      </header>

      {isLoading ? (
        <div className="text-sm text-ink/50">Loading…</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Kpi label="Page views" value={totalViews} />
            <Kpi label="Leads" value={totalLeads} />
            <Kpi label="Conversion" value={totalViews > 0 ? `${((totalLeads / totalViews) * 100).toFixed(1)}%` : "—"} />
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base font-medium">Traffic & leads</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#0A1628" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="leads" stroke="#B87A5A" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base font-medium">Top pages</CardTitle></CardHeader>
              <CardContent>
                {byPath.length === 0 ? <div className="text-sm text-ink/50">No data yet.</div> : (
                  <ul className="divide-y divide-ink/10 text-sm">
                    {byPath.map((p) => (
                      <li key={p.path} className="flex justify-between py-2">
                        <span className="truncate mr-4">{p.path}</span>
                        <span className="text-ink/60">{p.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base font-medium">Leads by model</CardTitle></CardHeader>
              <CardContent className="h-56">
                {byModel.length === 0 ? <div className="text-sm text-ink/50">No leads yet.</div> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byModel}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="model" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#B87A5A" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
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
