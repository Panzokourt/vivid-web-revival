import sanitizeHtml from "sanitize-html";
import { useMemo } from "react";

const OPTS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li", "code"],
  allowedAttributes: { a: ["href", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

type Props = { html?: string | null; className?: string; as?: "p" | "div" | "span" };

/**
 * Render sanitized HTML for CMS rich-text fields.
 * If value is plain text (no `<`), renders as text safely.
 */
export function RichText({ html, className, as = "div" }: Props) {
  const clean = useMemo(() => {
    if (!html) return "";
    if (!html.includes("<")) return html;
    return sanitizeHtml(html, OPTS);
  }, [html]);
  if (!clean) return null;
  const Comp = as;
  if (!html?.includes("<")) return <Comp className={className}>{clean}</Comp>;
  return <Comp className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
