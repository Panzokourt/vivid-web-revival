import { useEditorOptional } from "./EditorProvider";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

type ItemProps = {
  page: string;
  block: string;
  path: string; // e.g. "milestones" or "items"
  index: number;
  total: number;
  className?: string;
};

/**
 * Floating admin controls anchored on a list item (move up/down, delete).
 * Renders nothing when not in edit mode.
 */
export function EditableItemControls({ page, block, path, index, total, className }: ItemProps) {
  const editor = useEditorOptional();
  if (!editor || !editor.isAdmin || editor.mode !== "edit") return null;

  return (
    <div className={`absolute z-[90] flex gap-1 rounded-md bg-ink/90 text-paper p-1 shadow-lg ${className ?? "top-2 right-2"}`}>
      <button
        type="button"
        className="p-1 hover:text-copper disabled:opacity-30"
        disabled={index === 0}
        onClick={(e) => { e.stopPropagation(); editor.arrayMove(page, block, path, index, index - 1); }}
        title="Μετακίνηση πάνω / αριστερά"
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className="p-1 hover:text-copper disabled:opacity-30"
        disabled={index >= total - 1}
        onClick={(e) => { e.stopPropagation(); editor.arrayMove(page, block, path, index, index + 1); }}
        title="Μετακίνηση κάτω / δεξιά"
      >
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className="p-1 hover:text-red-400"
        onClick={(e) => {
          e.stopPropagation();
          if (confirm("Διαγραφή στοιχείου;")) editor.arrayRemove(page, block, path, index);
        }}
        title="Διαγραφή"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

type AddProps = {
  page: string;
  block: string;
  path: string;
  template: unknown;
  label?: string;
  className?: string;
};

export function EditableAddButton({ page, block, path, template, label = "Προσθήκη στοιχείου", className }: AddProps) {
  const editor = useEditorOptional();
  if (!editor || !editor.isAdmin || editor.mode !== "edit") return null;

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); editor.arrayAdd(page, block, path, template); }}
      className={`inline-flex items-center gap-2 rounded-md border border-dashed border-copper/60 bg-copper/10 text-copper px-4 py-2 text-[11px] uppercase tracking-widest hover:bg-copper/20 transition ${className ?? ""}`}
    >
      <Plus className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
