import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "ΜΟΜΝΤΕΛΑ", href: "#models" },
  { label: "ΤΕΧΝΟΛΟΓΙΑ", href: "#tech" },
  { label: "ΥΠΗΡΕΣΙΕΣ", href: "#pillars" },
  { label: "DEALERS", href: "#dealers" },
  { label: "ΕΠΙΚΟΙΝΩΝΙΑ", href: "#footer" },
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
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 text-white transition-colors duration-300 ${
        scrolled
          ? "bg-brand-navy/85 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <a href="#" className="text-xl md:text-2xl font-display tracking-tighter">
        RIBOLI
      </a>
      <div className="hidden md:flex space-x-8 lg:space-x-10 text-[11px] font-semibold uppercase tracking-widest">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="hover:text-brand-red transition-colors"
          >
            {l.label}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <a
          href="#dealers"
          className="hidden sm:inline-flex px-5 py-2 border border-white/30 hover:bg-white hover:text-brand-navy transition-all uppercase text-[10px] font-bold tracking-widest"
        >
          Find a Dealer
        </a>
        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 border border-white/20"
        >
          <div className="w-5 h-[2px] bg-white mb-1" />
          <div className="w-5 h-[2px] bg-white mb-1" />
          <div className="w-5 h-[2px] bg-white" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-full left-0 right-0 bg-brand-navy border-t border-white/10 flex flex-col py-4"
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:text-brand-red"
              >
                {l.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
