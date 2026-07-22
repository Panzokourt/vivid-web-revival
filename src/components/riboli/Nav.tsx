import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { MagneticButton } from "@/components/riboli/MagneticButton";

const links = [
  {
    label: "Models",
    href: "/models",
    children: [
      { label: "Odyssey · Πολυεστέρας", href: "/models/odyssey" },
      { label: "Alu Series · Αλουμίνιο", href: "/models/alu" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Dealers", href: "/dealers" },
  { label: "Contact", href: "/contact" },
];

const NAV_TEXT_SHADOW = "0 2px 12px rgba(0,0,0,0.6), 0 0 2px rgba(0,0,0,0.4)";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hasHero = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overHero = hasHero && !scrolled;
  const textCls = overHero ? "text-paper" : "text-ink";
  const linkCls = overHero ? "text-paper/85 hover:text-copper" : "text-ink/70 hover:text-copper";
  const shadow = overHero ? { textShadow: NAV_TEXT_SHADOW } : undefined;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 transition-colors duration-300 ${textCls} ${
        !overHero ? "bg-paper/85 backdrop-blur-md border-b border-ink/10" : ""
      }`}
    >
      <Link to="/" className="font-display text-2xl tracking-widest" style={shadow}>
        RIBALI
      </Link>
      <div className="hidden md:flex space-x-8 lg:space-x-10 text-[11px] uppercase tracking-[0.25em]">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className={`transition-colors ${linkCls}`}
            style={shadow}
          >
            {l.label}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <MagneticButton
          as={Link}
          to="/configurator"
          className={`hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-[10px] uppercase tracking-[0.25em] transition-colors ${
            overHero
              ? "bg-paper text-ink hover:bg-copper hover:text-paper"
              : "bg-ink text-paper hover:bg-copper"
          }`}
        >
          Configure
          <span className="text-base leading-none">+</span>
        </MagneticButton>
        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className={`md:hidden p-2 border ${overHero ? "border-paper/40" : "border-ink/20"}`}
        >
          <div className={`w-5 h-[2px] mb-1 ${overHero ? "bg-paper" : "bg-ink"}`} />
          <div className={`w-5 h-[2px] mb-1 ${overHero ? "bg-paper" : "bg-ink"}`} />
          <div className={`w-5 h-[2px] ${overHero ? "bg-paper" : "bg-ink"}`} />
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
