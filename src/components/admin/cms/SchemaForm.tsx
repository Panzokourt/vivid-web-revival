import { useState } from "react";
import type { BlockSchema, Field } from "@/lib/cms/schemas";
import { emptyItem } from "@/lib/cms/schemas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "./MediaPicker";
import { ChevronDown, ChevronRight, ArrowUp, ArrowDown, Copy, Trash2, Plus } from "lucide-react";

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

function ListField({ field, value, onChange }: { field: Field; value: Value[]; onChange: (v: Value[]) => void }) {
  const itemSchema = field.itemSchema ?? [];
  const [openIdx, setOpenIdx] = useState<Set<number>>(new Set([0]));

  const toggle = (i: number) => {
    const next = new Set(openIdx);
    next.has(i) ? next.delete(i) : next.add(i);
    setOpenIdx(next);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const remove = (i: number) => {
    if (!confirm("Διαγραφή στοιχείου;")) return;
    onChange(value.filter((_, k) => k !== i));
  };

  const duplicate = (i: number) => {
    const next = [...value];
    next.splice(i + 1, 0, JSON.parse(JSON.stringify(value[i])));
    onChange(next);
  };

  const add = () => {
    const next = [...value, emptyItem(itemSchema)];
    onChange(next);
    setOpenIdx(new Set([...openIdx, next.length - 1]));
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label>{field.label}</Label>
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="h-4 w-4 mr-1" /> Προσθήκη
        </Button>
      </div>
      {value.length === 0 && (
        <div className="text-xs text-ink/50 border border-dashed border-ink/20 rounded p-4 text-center">
          Κανένα στοιχείο ακόμη.
        </div>
      )}
      <div className="grid gap-2">
        {value.map((item, i) => {
          const isOpen = openIdx.has(i);
          const label = field.itemLabel ? field.itemLabel(item, i) : `Στοιχείο ${i + 1}`;
          return (
            <div key={i} className="border border-ink/15 rounded bg-white/60">
              <div className="flex items-center gap-1 px-2 py-2">
                <button type="button" onClick={() => toggle(i)} className="flex-1 flex items-center gap-2 text-left min-w-0">
                  {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                  <span className="text-xs text-ink/50 shrink-0">#{i + 1}</span>
                  <span className="text-sm truncate">{label || `Στοιχείο ${i + 1}`}</span>
                </button>
                <Button type="button" size="sm" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => move(i, 1)} disabled={i === value.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => duplicate(i)}><Copy className="h-4 w-4" /></Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => remove(i)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
              </div>
              {isOpen && (
                <div className="p-3 pt-2 border-t border-ink/10 grid gap-4">
                  {itemSchema.map((sub) => (
                    <FieldRenderer
                      key={sub.key}
                      field={sub}
                      value={item[sub.key]}
                      onChange={(nv) => {
                        const next = [...value];
                        next[i] = { ...item, [sub.key]: nv };
                        onChange(next);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
