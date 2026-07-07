import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, Link as LinkIcon, Link2Off, RemoveFormatting } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

type Props = { value: string; onChange: (v: string) => void };

export function RichTextField({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false, blockquote: false, horizontalRule: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[100px] max-w-none prose prose-sm focus:outline-none px-3 py-2 [&_p]:my-1 [&_a]:text-copper [&_a]:underline",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Tiptap gives "<p></p>" for empty; treat as empty string
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Sync external changes (e.g., version restore) into the editor
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || "";
    if (current !== incoming && (incoming !== "" || current !== "<p></p>")) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const promptLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Σύνδεσμος (URL):", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border border-ink/15 rounded bg-white">
      <div className="flex items-center gap-1 border-b border-ink/10 px-1 py-1">
        <Button
          type="button" size="sm" variant={editor.isActive("bold") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        ><Bold className="h-4 w-4" /></Button>
        <Button
          type="button" size="sm" variant={editor.isActive("italic") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        ><Italic className="h-4 w-4" /></Button>
        <div className="w-px h-5 bg-ink/10 mx-1" />
        <Button
          type="button" size="sm" variant={editor.isActive("link") ? "default" : "ghost"}
          onClick={promptLink}
          title="Link"
        ><LinkIcon className="h-4 w-4" /></Button>
        <Button
          type="button" size="sm" variant="ghost"
          onClick={() => editor.chain().focus().unsetLink().run()}
          title="Remove link"
        ><Link2Off className="h-4 w-4" /></Button>
        <div className="flex-1" />
        <Button
          type="button" size="sm" variant="ghost"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Clear formatting"
        ><RemoveFormatting className="h-4 w-4" /></Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
