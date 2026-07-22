import { useRouterState } from "@tanstack/react-router";

/**
 * Returns "/en" when the current URL is under the /en subtree, else "".
 * Use to prefix href strings so intra-locale navigation stays in the same
 * language subtree. Safe during SSR (returns "" until pathname is known).
 */
export function useLocalePrefix(): "" | "/en" {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return pathname.startsWith("/en") ? "/en" : "";
}

export function localizeHref(prefix: "" | "/en", href: string): string {
  if (!prefix) return href;
  if (href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return href;
  if (href === "/") return "/en";
  if (href.startsWith("/en")) return href;
  return `${prefix}${href}`;
}
