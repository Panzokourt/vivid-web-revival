export function Footer() {
  return (
    <footer id="footer" className="relative bg-ink text-paper overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="grid md:grid-cols-4 gap-10 border-b border-paper/15 pb-12">
          <div>
            <div className="font-display text-3xl tracking-widest">RIBALI</div>
            <p className="mt-4 text-sm text-paper/60 max-w-xs leading-relaxed">
              Handcrafted RIBs for those who read the sea before the map.
            </p>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-paper/50 mb-4">Studio</div>
            <ul className="space-y-2 text-sm text-paper/80">
              <li>Piraeus · Greece</li>
              <li>+30 210 000 0000</li>
              <li>hello@riboli.gr</li>
            </ul>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-paper/50 mb-4">Follow</div>
            <ul className="space-y-2 text-sm text-paper/80">
              <li><a href="#" className="hover:text-copper">Instagram</a></li>
              <li><a href="#" className="hover:text-copper">YouTube</a></li>
              <li><a href="#" className="hover:text-copper">LinkedIn</a></li>
            </ul>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-paper/50 mb-4">Legal</div>
            <ul className="space-y-2 text-sm text-paper/80">
              <li><a href="#" className="hover:text-copper">Privacy policy</a></li>
              <li><a href="#" className="hover:text-copper">Terms</a></li>
              <li><a href="#" className="hover:text-copper">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="text-[10px] uppercase tracking-[0.3em] text-paper/40">
            © {new Date().getFullYear()} RIBALI Marine · Built in Greece
          </div>
          <div className="font-display text-[18vw] md:text-[12vw] leading-[0.8] text-outline text-paper/40 select-none">
            RIBALI
          </div>
        </div>
      </div>
    </footer>
  );
}
