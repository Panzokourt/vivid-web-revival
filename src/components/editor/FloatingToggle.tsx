import { useEditor } from "./EditorProvider";
import { Pencil, Eye } from "lucide-react";

export function FloatingToggle() {
  const e = useEditor();
  if (!e.isAdmin) return null;
  if (e.mode === "edit") {
    return (
      <button
        type="button"
        onClick={() => e.disable()}
        className="fixed bottom-6 right-6 z-[9998] rounded-full bg-ink text-paper shadow-2xl px-4 py-3 text-xs uppercase tracking-[0.25em] flex items-center gap-2 hover:bg-copper transition-colors"
        title="Προεπισκόπηση"
      >
        <Eye className="h-4 w-4" /> View
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => e.enable()}
      className="fixed bottom-6 right-6 z-[9998] rounded-full bg-copper text-paper shadow-2xl px-4 py-3 text-xs uppercase tracking-[0.25em] flex items-center gap-2 hover:bg-ink transition-colors"
      title="Live editing"
    >
      <Pencil className="h-4 w-4" /> Edit
    </button>
  );
}
