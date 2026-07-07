import { useState, useMemo } from "react";
import type { BlockSchema, Field } from "@/lib/cms/schemas";
import { emptyItem } from "@/lib/cms/schemas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "./MediaPicker";
import { RichTextField } from "./RichTextField";
import { Sortable } from "./Sortable";
import { ChevronDown, ChevronRight, Copy, Trash2, Plus } from "lucide-react";

type Value = Record<string, unknown>;

type Props = {
  schema: BlockSchema;
  value: Value;
  onChange: (v: Value) => void;
};

export function SchemaForm({ schema, value, onChange }: Props) {
  return (
    <div className="grid gap-5">
      {schema.fields.map((f) => (
        <FieldRenderer
          key={f.key}
          field={f}
          value={value[f.key]}
          onChange={(nv) => onChange({ ...value, [f.key]: nv })}
        />
      ))}
    </div>
  );
}

function FieldRenderer({ field, value, onChange }: { field: Field; value: unknown; onChange: (v: unknown) => void }) {
  if (field.type === "list") {
    return (
      <ListField
        field={field}
        value={Array.isArray(value) ? (value as Value[]) : []}
        onChange={(v) => onChange(v)}
      />
    );
  }

  const strVal = value == null ? "" : String(value);

  if (field.type === "textarea") {
    return (
      <div className="grid gap-1.5">
        <Label>{field.label}</Label>
        <Textarea rows={field.rows ?? 3} value={strVal} onChange={(e) => onChange(e.target.value)} />
        {field.help && <div className="text-[11px] text-ink/50">{field.help}</div>}
      </div>
    );
  }

  if (field.type === "richtext") {
    return (
      <div className="grid gap-1.5">
        <Label>{field.label}</Label>
        <RichTextField value={strVal} onChange={onChange as (v: string) => void} />
        {field.help && <div className="text-[11px] text-ink/50">{field.help}</div>}
      </div>
    );
  }

  if (field.type === "image") {
    return (
      <div className="grid gap-1.5">
        <Label>{field.label}</Label>
        <MediaPicker value={strVal} onChange={onChange as (v: string) => void} />
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div className="grid gap-1.5">
        <Label>{field.label}</Label>
        <Input
          type="number"
          value={strVal}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-1.5">
      <Label>{field.label}</Label>
      <Input
        type={field.type === "url" ? "url" : "text"}
        value={strVal}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.type === "url" ? "https://…  ή  /route" : undefined}
      />
      {field.help && <div className="text-[11px] text-ink/50">{field.help}</div>}
    </div>
  );
}

// Stable per-render synthetic IDs for list items so dnd-kit can track them
// even when items don't have an id field.
type ItemWithId = { _id: string; data: Value };

function ListField({ field, value, onChange }: { field: Field; value: Value[]; onChange: (v: Value[]) => void }) {
  const itemSchema = field.itemSchema ?? [];
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [idMap] = useState(() => new WeakMap<Value, string>());

  const withIds: ItemWithId[] = useMemo(() => {
    return value.map((v) => {
      let id = idMap.get(v);
      if (!id) {
        id = `item-${Math.random().toString(36).slice(2, 10)}`;
        idMap.set(v, id);
      }
      return { _id: id, data: v };
    });
  }, [value, idMap]);

  const toggle = (id: string) => {
    const next = new Set(openIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setOpenIds(next);
  };

  const remove = (id: string) => {
    if (!confirm("Διαγραφή στοιχείου;")) return;
    onChange(withIds.filter((it) => it._id !== id).map((it) => it.data));
  };

  const duplicate = (id: string) => {
    const idx = withIds.findIndex((it) => it._id === id);
    if (idx < 0) return;
    const cloned = JSON.parse(JSON.stringify(withIds[idx].data)) as Value;
    const next = [...withIds];
    next.splice(idx + 1, 0, { _id: `item-${Math.random().toString(36).slice(2, 10)}`, data: cloned });
    onChange(next.map((it) => it.data));
  };

  const add = () => {
    const newItem = emptyItem(itemSchema);
    const newId = `item-${Math.random().toString(36).slice(2, 10)}`;
    idMap.set(newItem, newId);
    onChange([...value, newItem]);
    setOpenIds(new Set([...openIds, newId]));
  };

  const reorder = (nextItems: ItemWithId[]) => {
    onChange(nextItems.map((it) => it.data));
  };

  const updateItem = (id: string, patch: Value) => {
    const next = withIds.map((it) => {
      if (it._id !== id) return it;
      const merged = { ...it.data, ...patch };
      idMap.set(merged, it._id);
      return { _id: it._id, data: merged };
    });
    onChange(next.map((it) => it.data));
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label>{field.label}</Label>
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="h-4 w-4 mr-1" /> Προσθήκη
        </Button>
      </div>
      {withIds.length === 0 && (
        <div className="text-xs text-ink/50 border border-dashed border-ink/20 rounded p-4 text-center">
          Κανένα στοιχείο ακόμη.
        </div>
      )}
      <div className="grid gap-2">
        <Sortable
          items={withIds.map((it) => ({ ...it, id: it._id }))}
          onReorder={(next) => reorder(next.map(({ id, ...rest }) => ({ _id: id, data: (rest as unknown as ItemWithId).data })))}
          renderItem={(item, handle) => {
            const isOpen = openIds.has(item._id);
            const idx = withIds.findIndex((w) => w._id === item._id);
            const label = field.itemLabel ? field.itemLabel(item.data, idx) : `Στοιχείο ${idx + 1}`;
            return (
              <div className="border border-ink/15 rounded bg-white/60 mb-2">
                <div className="flex items-center gap-1 px-1 py-2">
                  {handle}
                  <button type="button" onClick={() => toggle(item._id)} className="flex-1 flex items-center gap-2 text-left min-w-0">
                    {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                    <span className="text-xs text-ink/50 shrink-0">#{idx + 1}</span>
                    <span className="text-sm truncate">{label || `Στοιχείο ${idx + 1}`}</span>
                  </button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => duplicate(item._id)}><Copy className="h-4 w-4" /></Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => remove(item._id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                </div>
                {isOpen && (
                  <div className="p-3 pt-2 border-t border-ink/10 grid gap-4">
                    {itemSchema.map((sub) => (
                      <FieldRenderer
                        key={sub.key}
                        field={sub}
                        value={item.data[sub.key]}
                        onChange={(nv) => updateItem(item._id, { [sub.key]: nv })}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
