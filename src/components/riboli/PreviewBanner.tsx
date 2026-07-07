import { useEffect, useState } from "react";
import { isPreviewMode } from "@/lib/page-blocks";
import { Eye, X } from "lucide-react";

export function PreviewBanner() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isPreviewMode());
  }, []);

  if (!active) return null;

  const exit = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("preview");
    window.location.href = url.toString();
  };

  return (
    <div className="fixed top-0 inset-x-0 z-[100] bg-amber-500 text-black text-sm shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-medium">
          <Eye className="h-4 w-4" />
          <span>Preview mode — βλέπεις drafts + published (δεν επηρεάζει το production site)</span>
        </div>
        <button
          onClick={exit}
          className="inline-flex items-center gap-1 rounded-md bg-black/10 hover:bg-black/20 px-2 py-1 text-xs font-medium"
        >
          <X className="h-3 w-3" /> Έξοδος
        </button>
      </div>
    </div>
  );
}
