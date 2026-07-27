import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  adminProposalsQueryOptions,
  adminUpsertProposal,
  adminDeleteProposal,
} from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/proposals")({
  head: () => ({ meta: [{ title: "Proposals — RIBALI Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => <AdminShell><ProposalsAdmin /></AdminShell>,
});

type ProposalRow = {
  id: string;
  slug: string;
  persona: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  hero_image: string | null;
  price_from: number | null;
  preset_id: string | null;
  equipment_summary: unknown;
  cta_label: string | null;
  sort_order: number;
  published: boolean;
  title_en: string | null;
  subtitle_en: string | null;
  description_en: string | null;
  cta_label_en: string | null;
};

const EMPTY: ProposalRow = {
  id: "",
  slug: "",
  persona: "family",
  title: "",
  subtitle: null,
  description: null,
  hero_image: null,
  price_from: null,
  preset_id: null,
  equipment_summary: [],
  cta_label: null,
  sort_order: 0,
  published: true,
  title_en: null,
  subtitle_en: null,
  description_en: null,
  cta_label_en: null,
};

function ProposalsAdmin() {
  const { data: rows = [], isLoading } = useQuery(adminProposalsQueryOptions());
  const [editing, setEditing] = useState<ProposalRow | null>(null);
  const [creating, setCreating] = useState(false);
  const del = useServerFn(adminDeleteProposal);
  const qc = useQueryClient();

  const removeMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "proposals"] });
      qc.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">Catalog</div>
          <h1 className="text-3xl font-display mt-1">Proposals</h1>
          <p className="text-sm text-ink/60 mt-2">Curated persona packages linked to a configurator preset.</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4 mr-2" /> New</Button>
      </header>

      {isLoading ? (
        <div className="text-sm text-ink/50">Loading…</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(rows as ProposalRow[]).map((p) => (
            <Card key={p.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50 flex gap-2 items-center">
                    <span>{p.persona}</span>
                    {!p.published && <span className="text-copper">draft</span>}
                  </div>
                  <div className="text-xl font-display mt-1 truncate">{p.title}</div>
                  {p.subtitle && <div className="text-sm text-ink/60 mt-1 line-clamp-2">{p.subtitle}</div>}
                  <div className="text-[11px] text-ink/40 mt-2">/{p.slug}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { if (confirm(`Delete "${p.title}"?`)) removeMut.mutate(p.id); }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              {p.price_from != null && (
                <div className="mt-4 text-[11px] uppercase tracking-[0.3em] text-ink/50">
                  From €{p.price_from.toLocaleString("el-GR")}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing || creating} onOpenChange={(o) => { if (!o) { setEditing(null); setCreating(false); } }}>
        {(editing || creating) && (
          <ProposalEditor
            proposal={editing ?? EMPTY}
            isNew={creating}
            onDone={() => { setEditing(null); setCreating(false); }}
          />
        )}
      </Dialog>
    </div>
  );
}

function ProposalEditor({ proposal, isNew, onDone }: { proposal: ProposalRow; isNew: boolean; onDone: () => void }) {
  const upsert = useServerFn(adminUpsertProposal);
  const qc = useQueryClient();
  const [form, setForm] = useState({
    slug: proposal.slug,
    persona: proposal.persona,
    title: proposal.title,
    subtitle: proposal.subtitle ?? "",
    description: proposal.description ?? "",
    hero_image: proposal.hero_image ?? "",
    price_from: proposal.price_from?.toString() ?? "",
    preset_id: proposal.preset_id ?? "",
    equipment_summary: Array.isArray(proposal.equipment_summary)
      ? (proposal.equipment_summary as string[]).join("\n")
      : "",
    cta_label: proposal.cta_label ?? "",
    sort_order: proposal.sort_order.toString(),
    published: proposal.published,
    title_en: proposal.title_en ?? "",
    subtitle_en: proposal.subtitle_en ?? "",
    description_en: proposal.description_en ?? "",
    cta_label_en: proposal.cta_label_en ?? "",
  });

  const mutation = useMutation({
    mutationFn: () => upsert({
      data: {
        id: isNew ? null : proposal.id,
        patch: {
          slug: form.slug.trim(),
          persona: form.persona.trim(),
          title: form.title.trim(),
          subtitle: form.subtitle || null,
          description: form.description || null,
          hero_image: form.hero_image || null,
          price_from: form.price_from ? Number(form.price_from) : null,
          preset_id: form.preset_id || null,
          equipment_summary: form.equipment_summary
            .split("\n").map((s) => s.trim()).filter(Boolean),
          cta_label: form.cta_label || null,
          sort_order: Number(form.sort_order) || 0,
          published: form.published,
          title_en: form.title_en || null,
          subtitle_en: form.subtitle_en || null,
          description_en: form.description_en || null,
          cta_label_en: form.cta_label_en || null,
        },
      },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "proposals"] });
      qc.invalidateQueries({ queryKey: ["proposals"] });
      toast.success(isNew ? "Created" : "Saved");
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>{isNew ? "New proposal" : `Edit ${proposal.title}`}</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="family-cruiser" /></div>
          <div>
            <Label>Persona</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.persona}
              onChange={(e) => setForm({ ...form, persona: e.target.value })}
            >
              <option value="family">Family</option>
              <option value="sport">Sport</option>
              <option value="adventure">Adventure</option>
              <option value="pro">Pro / Charter</option>
            </select>
          </div>
        </div>
        <div><Label>Title (EL)</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label>Subtitle (EL)</Label><Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
        <div><Label>Description (EL)</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div><Label>Title (EN)</Label><Input value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} /></div>
        <div><Label>Subtitle (EN)</Label><Input value={form.subtitle_en} onChange={(e) => setForm({ ...form, subtitle_en: e.target.value })} /></div>
        <div><Label>Description (EN)</Label><Textarea rows={3} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} /></div>
        <div><Label>Equipment summary (one per line)</Label><Textarea rows={5} value={form.equipment_summary} onChange={(e) => setForm({ ...form, equipment_summary: e.target.value })} /></div>
        <div className="grid grid-cols-3 gap-4">
          <div><Label>Price from (€)</Label><Input type="number" value={form.price_from} onChange={(e) => setForm({ ...form, price_from: e.target.value })} /></div>
          <div><Label>Sort order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></div>
          <div className="flex items-end gap-2">
            <input id="pub" type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            <Label htmlFor="pub">Published</Label>
          </div>
        </div>
        <div><Label>Preset ID (uuid, optional)</Label><Input value={form.preset_id} onChange={(e) => setForm({ ...form, preset_id: e.target.value })} placeholder="configurator_presets.id" /></div>
        <div><Label>Hero image URL</Label><Input value={form.hero_image} onChange={(e) => setForm({ ...form, hero_image: e.target.value })} /></div>
        <div><Label>CTA label (EL / EN)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} placeholder="Δες τη σύνθεση" />
            <Input value={form.cta_label_en} onChange={(e) => setForm({ ...form, cta_label_en: e.target.value })} placeholder="See setup" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving…" : "Save"}</Button>
        </div>
      </form>
    </DialogContent>
  );
}
