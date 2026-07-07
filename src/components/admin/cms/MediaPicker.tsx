import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminMediaQueryOptions } from "@/lib/admin.functions";
import { Image as ImageIcon, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function MediaPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: media = [], isLoading } = useQuery(adminMediaQueryOptions());

  const filtered = (media as Array<{ name: string; url: string }>).filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()),
  );

  const current = (media as Array<{ name: string; url: string }>).find((m) => m.name === value);

  return (
    <div className="flex items-center gap-3">
      <div className="h-16 w-16 rounded border border-ink/15 bg-ink/5 flex items-center justify-center overflow-hidden shrink-0">
        {current ? (
          <img src={current.url} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-5 w-5 text-ink/40" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-ink/60 truncate">{value || "—"}</div>
        <div className="flex gap-2 mt-1">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">Επιλογή…</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader><DialogTitle>Media library</DialogTitle></DialogHeader>
              <Input
                placeholder="Αναζήτηση αρχείου…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                  <div className="text-sm text-ink/50 py-6 text-center">Φόρτωση…</div>
                ) : filtered.length === 0 ? (
                  <div className="text-sm text-ink/50 py-6 text-center">Κανένα αρχείο.</div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {filtered.map((m) => (
                      <button
                        key={m.name}
                        type="button"
                        onClick={() => { onChange(m.name); setOpen(false); }}
                        className={`group border rounded overflow-hidden text-left hover:border-copper transition-colors ${value === m.name ? "border-copper ring-1 ring-copper" : "border-ink/15"}`}
                      >
                        <div className="aspect-square bg-ink/5">
                          <img src={m.url} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="p-2 text-[11px] truncate">{m.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              <X className="h-4 w-4 mr-1" />Καθαρισμός
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
