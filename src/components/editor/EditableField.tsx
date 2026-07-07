import { type ReactNode } from "react";
import { useEditorOptional, type EditableFieldType } from "./EditorProvider";
import { Pencil } from "lucide-react";

type Props = {
  page: string;
  block: string;
  field: string;
  type: EditableFieldType;
  label?: string;
  children: ReactNode;
  className?: string;
  as?: "span" | "div";
};

/**
 * Wraps a field so admins in edit mode can click it to open the field drawer.
 * In view mode (or for non-admins) it renders children transparently.
 */
export function EditableField({
  page,
  block,
  field,
  type,
  label,
  children,
  className,
  as = "span",
}: Props) {
  const editor = useEditorOptional();
  if (!editor || !editor.isAdmin || editor.mode !== "edit") {
    return <>{children}</>;
  }

  const Wrapper = as;
  return (
    <Wrapper
      className={`ribali-editable relative inline-block cursor-pointer align-baseline outline outline-2 outline-transparent outline-offset-2 hover:outline-copper transition-[outline-color] ${className ?? ""}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        editor.openField({ page, block, field, label: label ?? field, type });
      }}
      title={`Επεξεργασία: ${label ?? field}`}
    >
      {children}
      <span className="ribali-editable-pencil pointer-events-none absolute -top-3 -right-3 z-[100] hidden rounded-full bg-copper text-paper p-1 shadow-lg">
        <Pencil className="h-3 w-3" />
      </span>
    </Wrapper>
  );
}
