import { useEditor } from "./EditorProvider";
import { Button } from "@/components/ui/button";
import { Save, Rocket, Undo2, X, Loader2 } from "lucide-react";
import { FieldDrawer } from "./FieldDrawer";

export function EditorBar() {
  const e = useEditor();
  if (!e.isAdmin || e.mode !== "edit") return null;

  const dirtyCount = e.dirty.size;

  return (
    <>
      <div className="fixed top-0 inset-x-0 z-[9999] bg-ink text-paper shadow-2xl border-b border-copper/40">
        <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em]">
            <span className="inline-block h-2 w-2 rounded-full bg-copper animate-pulse" />
            Live Editing
          </div>
          <div className="text-xs text-paper/60">
            {dirtyCount > 0 ? `${dirtyCount} μη αποθηκευμέν${dirtyCount === 1 ? "ο block" : "α blocks"}` : "Όλα αποθηκευμένα"}
          </div>
          <div className="flex-1" />
          <Button
            size="sm"
            variant="ghost"
            className="text-paper hover:bg-paper/10"
            disabled={dirtyCount === 0 || e.saving}
            onClick={() => e.discard()}
            title="Απόρριψη αλλαγών"
          >
            <Undo2 className="h-4 w-4 mr-1" /> Απόρριψη
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-transparent text-paper border-paper/30 hover:bg-paper/10 hover:text-paper"
            disabled={dirtyCount === 0 || e.saving}
            onClick={() => e.saveDraft()}
          >
            {e.saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Πρόχειρο
          </Button>
          <Button
            size="sm"
            className="bg-copper text-paper hover:bg-copper/90"
            disabled={dirtyCount === 0 || e.saving}
            onClick={() => e.publish()}
          >
            {e.saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Rocket className="h-4 w-4 mr-1" />}
            Δημοσίευση
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-paper hover:bg-paper/10"
            onClick={() => e.disable()}
            title="Έξοδος"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Spacer so content isn't hidden behind the fixed bar */}
      <div aria-hidden className="h-11" />
      <FieldDrawer />
    </>
  );
}
