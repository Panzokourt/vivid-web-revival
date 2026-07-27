import type { ReactNode } from "react";
import { Nav } from "@/components/riboli/Nav";
import { Footer } from "@/components/riboli/Footer";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <main className="relative bg-paper min-h-screen text-ink">
      <Nav />
      <section className="pt-40 pb-16 px-6 md:px-10 border-b border-ink/10 max-w-4xl mx-auto">
        <div className="text-[10px] uppercase tracking-[0.35em] text-copper mb-4">Legal</div>
        <h1 className="font-display text-[10vw] md:text-[5vw] leading-[0.9] tracking-tight">{title}</h1>
        {updated && (
          <div className="mt-6 text-[11px] uppercase tracking-[0.25em] text-ink/50">
            Last updated · {updated}
          </div>
        )}
      </section>
      <article className="max-w-3xl mx-auto px-6 md:px-10 py-16 prose prose-ink prose-headings:font-display prose-headings:tracking-tight prose-p:text-ink/75 prose-p:leading-relaxed prose-a:text-copper hover:prose-a:underline">
        {children}
      </article>
      <Footer />
    </main>
  );
}
