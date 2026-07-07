import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  adminModelsQueryOptions,
  adminUpdateModel,
} from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/models")({
  head: () => ({ meta: [{ title: "Models — RIBALI Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => <AdminShell><ModelsAdmin /></AdminShell>,
});

type ModelRow = {
  id: string;
  slug: string;
  code: string;
  name: string;
  number: string;
  tag: string | null;
  tagline: string | null;
  description: string | null;
  length_m: number | null;
  beam_m: number | null;
  max_hp: number | null;
  pax: number | null;
  weight_kg: number | null;
  fuel_l: number | null;
  hull_type: string | null;
  tube_material: string | null;
  hero_image: string | null;
  order_index: number;
};

function ModelsAdmin() {
  const { data: models = [], isLoading } = useQuery(adminModelsQueryOptions());
  const [editing, setEditing] = useState<ModelRow | null>(null);

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">Catalog</div>
        <h1 className="text-3xl font-display mt-1">Models</h1>
        <p className="text-sm text-ink/60 mt-2">Edit specifications, tagline, and hero image for each RIB.</p>
      </header>

      {isLoading ? (
        <div className="text-sm text-ink/50">Loading…</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(models as ModelRow[]).map((m) => (
            <Card key={m.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">{m.code}</div>
                  <div className="text-xl font-display mt-1">{m.name}</div>
                  {m.tagline && <div className="text-sm text-ink/60 mt-1">{m.tagline}</div>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setEditing(m)}><Pencil className="h-4 w-4" /></Button>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div><dt className="text-ink/50">Length</dt><dd>{m.length_m ?? "—"} m</dd></div>
                <div><dt className="text-ink/50">Max HP</dt><dd>{m.max_hp ?? "—"}</dd></div>
                <div><dt className="text-ink/50">Pax</dt><dd>{m.pax ?? "—"}</dd></div>
              </dl>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && <ModelEditor model={editing} onDone={() => setEditing(null)} />}
      </Dialog>
    </div>
  );
}

function ModelEditor({ model, onDone }: { model: ModelRow; onDone: () => void }) {
  const update = useServerFn(adminUpdateModel);
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: model.name,
    tag: model.tag ?? "",
    tagline: model.tagline ?? "",
    description: model.description ?? "",
    length_m: model.length_m?.toString() ?? "",
    beam_m: model.beam_m?.toString() ?? "",
    max_hp: model.max_hp?.toString() ?? "",
    pax: model.pax?.toString() ?? "",
    weight_kg: model.weight_kg?.toString() ?? "",
    fuel_l: model.fuel_l?.toString() ?? "",
    hull_type: model.hull_type ?? "",
    tube_material: model.tube_material ?? "",
    hero_image: model.hero_image ?? "",
    order_index: model.order_index.toString(),
  });

  const mutation = useMutation({
    mutationFn: () => update({
      data: {
        id: model.id,
        patch: {
          name: form.name,
          tag: form.tag || null,
          tagline: form.tagline || null,
          description: form.description || null,
          length_m: form.length_m ? Number(form.length_m) : null,
          beam_m: form.beam_m ? Number(form.beam_m) : null,
          max_hp: form.max_hp ? Number(form.max_hp) : null,
          pax: form.pax ? Number(form.pax) : null,
          weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
          fuel_l: form.fuel_l ? Number(form.fuel_l) : null,
          hull_type: form.hull_type || null,
          tube_material: form.tube_material || null,
          hero_image: form.hero_image || null,
          order_index: Number(form.order_index) || 0,
        },
      },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "models"] });
      qc.invalidateQueries({ queryKey: ["models"] });
      toast.success("Model saved");
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>Edit {model.code}</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Tag</Label><Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="e.g. New" /></div>
        </div>
        <div><Label>Tagline</Label><Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></div>
        <div><Label>Description</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="grid grid-cols-3 gap-4">
          <div><Label>Length (m)</Label><Input type="number" step="any" value={form.length_m} onChange={(e) => setForm({ ...form, length_m: e.target.value })} /></div>
          <div><Label>Beam (m)</Label><Input type="number" step="any" value={form.beam_m} onChange={(e) => setForm({ ...form, beam_m: e.target.value })} /></div>
          <div><Label>Max HP</Label><Input type="number" value={form.max_hp} onChange={(e) => setForm({ ...form, max_hp: e.target.value })} /></div>
          <div><Label>Pax</Label><Input type="number" value={form.pax} onChange={(e) => setForm({ ...form, pax: e.target.value })} /></div>
          <div><Label>Weight (kg)</Label><Input type="number" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} /></div>
          <div><Label>Fuel (L)</Label><Input type="number" value={form.fuel_l} onChange={(e) => setForm({ ...form, fuel_l: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Hull type</Label><Input value={form.hull_type} onChange={(e) => setForm({ ...form, hull_type: e.target.value })} /></div>
          <div><Label>Tube material</Label><Input value={form.tube_material} onChange={(e) => setForm({ ...form, tube_material: e.target.value })} /></div>
        </div>
        <div><Label>Hero image URL</Label><Input value={form.hero_image} onChange={(e) => setForm({ ...form, hero_image: e.target.value })} placeholder="/storage/media/…" /></div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving…" : "Save"}</Button>
        </div>
      </form>
    </DialogContent>
  );
}
