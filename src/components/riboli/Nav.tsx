import { useEffect, useState } from "react";

const links = [
  { label: "Models", href: "#models" },
  { label: "Technology", href: "#tech" },
  { label: "Stats", href: "#stats" },
  { label: "Dealers", href: "#dealers" },
  { label: "Contact", href: "#footer" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 text-ink transition-colors duration-300 ${
        scrolled ? "bg-paper/80 backdrop-blur-md border-b border-ink/10" : ""
      }`}
    >
      <a href="#" className="font-display text-2xl tracking-widest">
        RIBOLI
      </a>
      <div className="hidden md:flex space-x-8 lg:space-x-10 text-[11px] uppercase tracking-[0.25em]">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="text-ink/70 hover:text-copper transition-colors"
          >
            {l.label}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden sm:block text-ink/40 text-lg leading-none">/</span>
        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 border border-ink/20"
        >
          <div className="w-5 h-[2px] bg-ink mb-1" />
          <div className="w-5 h-[2px] bg-ink mb-1" />
          <div className="w-5 h-[2px] bg-ink" />
        </button>
      </div>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-paper border-t border-ink/10 flex flex-col py-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-6 py-3 text-xs uppercase tracking-[0.25em] text-ink/70 hover:text-copper"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
