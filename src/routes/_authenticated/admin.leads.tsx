import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminLeadsQueryOptions, adminUpdateLead } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { Download } from "lucide-react";

const STATUSES = ["new", "contacted", "qualified", "closed"] as const;

export const Route = createFileRoute("/_authenticated/admin/leads")({
  head: () => ({ meta: [{ title: "Leads — RIBALI Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => <AdminShell><LeadsPage /></AdminShell>,
});

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  model_slug: string;
  hull_color: string;
  tube_color: string;
  canopy_color: string;
  engine_hp: number;
  equipment: unknown;
  message: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

function LeadsPage() {
  const { data: leads = [], isLoading } = useQuery(adminLeadsQueryOptions());
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Lead | null>(null);

  const filtered = (leads as Lead[]).filter((l) => filter === "all" || l.status === filter);

  function exportCsv() {
    const headers = ["created_at", "full_name", "email", "phone", "country", "model_slug", "engine_hp", "hull_color", "tube_color", "canopy_color", "status"];
    const rows = filtered.map((l) => headers.map((h) => JSON.stringify((l as unknown as Record<string, unknown>)[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ribali-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">Configurator</div>
          <h1 className="text-3xl font-display mt-1">Leads</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
        </div>
      </header>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-sm text-ink/50">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-ink/50">No leads found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs text-ink/60 whitespace-nowrap">
                    {format(new Date(l.created_at), "MMM d, HH:mm")}
                  </TableCell>
                  <TableCell className="font-medium">{l.full_name}</TableCell>
                  <TableCell>{l.model_slug}</TableCell>
                  <TableCell className="text-sm">
                    <div>{l.email}</div>
                    {l.phone && <div className="text-xs text-ink/60">{l.phone}</div>}
                  </TableCell>
                  <TableCell><Badge variant="outline">{l.status}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelected(l)}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <LeadDialog lead={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function LeadDialog({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  const qc = useQueryClient();
  const update = useServerFn(adminUpdateLead);
  const [status, setStatus] = useState<string>(lead?.status ?? "new");
  const [notes, setNotes] = useState<string>(lead?.notes ?? "");

  const mutation = useMutation({
    mutationFn: (input: { id: string; status: string; notes: string }) =>
      update({ data: { id: input.id, status: input.status as "new", notes: input.notes } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "leads"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      toast.success("Lead updated");
      onClose();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
  });

  if (!lead) return null;

  return (
    <Dialog open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{lead.full_name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Email" value={lead.email} />
          <Field label="Phone" value={lead.phone ?? "—"} />
          <Field label="Country" value={lead.country ?? "—"} />
          <Field label="Model" value={lead.model_slug} />
          <Field label="Engine" value={`${lead.engine_hp} hp`} />
          <Field label="Colors" value={`${lead.hull_color} / ${lead.tube_color} / ${lead.canopy_color}`} />
          <Field label="Equipment" value={Array.isArray(lead.equipment) ? (lead.equipment as string[]).join(", ") : "—"} className="col-span-2" />
          {lead.message && <Field label="Message" value={lead.message} className="col-span-2" />}
        </div>

        <div className="grid gap-4 mt-4 pt-4 border-t border-ink/10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-[0.3em] text-ink/50">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.3em] text-ink/50">Internal notes</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={() => mutation.mutate({ id: lead.id, status, notes })} disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">{label}</div>
      <div className="mt-1">{value}</div>
    </div>
  );
}
