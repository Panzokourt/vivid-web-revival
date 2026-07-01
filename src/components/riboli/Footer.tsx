export function Footer() {
  return (
    <footer
      id="footer"
      className="bg-brand-navy border-t border-white/5 py-12 px-6 md:px-10 text-white"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-xl font-display tracking-tighter">RIBOLI</div>
        <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-white/40">
          <a href="#" className="hover:text-brand-red transition-colors">
            Instagram
          </a>
          <a href="#" className="hover:text-brand-red transition-colors">
            Facebook
          </a>
          <a href="#" className="hover:text-brand-red transition-colors">
            YouTube
          </a>
        </div>
        <div className="text-[10px] text-white/40 uppercase tracking-widest">
          © {new Date().getFullYear()} RIBOLI Marine. Built in Greece.
        </div>
      </div>
    </footer>
  );
}
