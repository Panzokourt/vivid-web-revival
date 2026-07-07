import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  adminDealersQueryOptions,
  adminUpsertDealer,
  adminDeleteDealer,
} from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/dealers")({
  head: () => ({ meta: [{ title: "Dealers — RIBALI Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => <AdminShell><DealersPage /></AdminShell>,
});

type Dealer = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  order_index: number;
  active: boolean;
};

function DealersPage() {
  const { data: dealers = [], isLoading } = useQuery(adminDealersQueryOptions());
  const [editing, setEditing] = useState<Dealer | null>(null);
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const del = useServerFn(adminDeleteDealer);

  const delMutation = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "dealers"] });
      toast.success("Dealer deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">Network</div>
          <h1 className="text-3xl font-display mt-1">Dealers</h1>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}><Plus className="h-4 w-4 mr-2" />New dealer</Button>
          </DialogTrigger>
          <DealerDialog editing={editing} onDone={() => { setOpen(false); setEditing(null); }} />
        </Dialog>
      </header>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-sm text-ink/50">Loading…</div>
        ) : (dealers as Dealer[]).length === 0 ? (
          <div className="p-6 text-sm text-ink/50">No dealers yet. Add your first one.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Active</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(dealers as Dealer[]).map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{[d.city, d.country].filter(Boolean).join(", ") || "—"}</TableCell>
                  <TableCell className="text-sm">
                    {d.email && <div>{d.email}</div>}
                    {d.phone && <div className="text-ink/60 text-xs">{d.phone}</div>}
                  </TableCell>
                  <TableCell>{d.active ? <Badge>Active</Badge> : <Badge variant="outline">Off</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(d); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (confirm(`Delete ${d.name}?`)) delMutation.mutate(d.id);
                    }}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function DealerDialog({ editing, onDone }: { editing: Dealer | null; onDone: () => void }) {
  const upsert = useServerFn(adminUpsertDealer);
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: editing?.name ?? "",
    city: editing?.city ?? "",
    country: editing?.country ?? "",
    lat: editing?.lat?.toString() ?? "",
    lng: editing?.lng?.toString() ?? "",
    phone: editing?.phone ?? "",
    email: editing?.email ?? "",
    website: editing?.website ?? "",
    order_index: editing?.order_index?.toString() ?? "0",
    active: editing?.active ?? true,
  });

  const mutation = useMutation({
    mutationFn: () => upsert({
      data: {
        id: editing?.id ?? null,
        values: {
          name: form.name,
          city: form.city || null,
          country: form.country || null,
          lat: form.lat ? Number(form.lat) : null,
          lng: form.lng ? Number(form.lng) : null,
          phone: form.phone || null,
          email: form.email || null,
          website: form.website || null,
          order_index: Number(form.order_index) || 0,
          active: form.active,
        },
      },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "dealers"] });
      toast.success(editing ? "Dealer updated" : "Dealer created");
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader><DialogTitle>{editing ? "Edit dealer" : "New dealer"}</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="grid gap-4">
        <div>
          <Label>Name *</Label>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
          <div><Label>Country</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Latitude</Label><Input type="number" step="any" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} /></div>
          <div><Label>Longitude</Label><Input type="number" step="any" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        </div>
        <div><Label>Website</Label><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-4 items-end">
          <div><Label>Order</Label><Input type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: e.target.value })} /></div>
          <div className="flex items-center gap-3 pb-1"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><Label>Active</Label></div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving…" : "Save"}</Button>
        </div>
      </form>
    </DialogContent>
  );
}
