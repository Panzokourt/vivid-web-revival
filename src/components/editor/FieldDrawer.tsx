import { useEditor } from "./EditorProvider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RichTextField } from "@/components/admin/cms/RichTextField";
import { MediaPicker } from "@/components/admin/cms/MediaPicker";

export function FieldDrawer() {
  const e = useEditor();
  const open = e.open;
  const value = open ? (e.getFieldValue(open.page, open.block, open.field) ?? "") : "";

  return (
    <Sheet open={!!open} onOpenChange={(v) => { if (!v) e.closeField(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md z-[10000]">
        {open && (
          <>
            <SheetHeader>
              <SheetTitle>{open.label}</SheetTitle>
              <SheetDescription className="text-xs">
                {open.page} · {open.block} · {open.field}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 grid gap-3">
              <Label className="text-xs uppercase tracking-widest text-ink/50">Τιμή</Label>
              {open.type === "text" || open.type === "url" ? (
                <Input
                  autoFocus
                  type={open.type === "url" ? "url" : "text"}
                  value={String(value ?? "")}
                  onChange={(ev) => e.setFieldValue(open.page, open.block, open.field, ev.target.value)}
                />
              ) : open.type === "textarea" ? (
                <Textarea
                  autoFocus
                  rows={6}
                  value={String(value ?? "")}
                  onChange={(ev) => e.setFieldValue(open.page, open.block, open.field, ev.target.value)}
                />
              ) : open.type === "richtext" ? (
                <RichTextField
                  value={String(value ?? "")}
                  onChange={(v) => e.setFieldValue(open.page, open.block, open.field, v)}
                />
              ) : open.type === "image" ? (
                <MediaPicker
                  value={String(value ?? "")}
                  onChange={(v) => e.setFieldValue(open.page, open.block, open.field, v)}
                />
              ) : null}
              <p className="text-[11px] text-ink/50 mt-2">
                Οι αλλαγές αποθηκεύονται από το πάνω bar (Πρόχειρο ή Δημοσίευση).
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
