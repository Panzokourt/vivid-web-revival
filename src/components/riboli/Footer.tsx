import { Link } from "@tanstack/react-router";
import { usePageBlock } from "@/lib/page-blocks";
import { EditableField } from "@/components/editor/EditableField";

const FALLBACK = {
  tagline: "Χειροποίητα σκάφη για όσους διαβάζουν τη θάλασσα πριν τον χάρτη.",
  studio_line1: "Πειραιάς · Ελλάδα",
  studio_line2: "+30 210 000 0000",
  studio_line3: "hello@ribali.gr",
  showroom_label: "Showroom",
  showroom_address: "Ακτή Θεμιστοκλέους 142, Πειραιάς 18538",
  showroom_hours: "Δευ–Παρ · 09:00 – 18:00 · Σάβ κατόπιν ραντεβού",
  wordmark: "RIBALI",
};

export function Footer() {
  const block = usePageBlock("home", "footer", FALLBACK);

  return (
    <footer id="footer" className="relative bg-ink text-paper overflow-hidden isolate">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="grid md:grid-cols-5 gap-10 border-b border-paper/15 pb-12">
          <div>
            <Link to="/" className="font-display text-3xl tracking-widest inline-block hover:text-copper transition-colors">RIBALI</Link>
            <EditableField page="home" block="footer" field="tagline" type="textarea" label="Tagline" as="div" className="mt-4 max-w-xs">
              <p className="text-sm text-paper/60 leading-relaxed">
                {block.tagline}
              </p>
            </EditableField>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-paper/50 mb-4">Studio</div>
            <ul className="space-y-2 text-sm text-paper/80">
              <li>
                <EditableField page="home" block="footer" field="studio_line1" type="text" label="Studio line 1">
                  {block.studio_line1}
                </EditableField>
              </li>
              <li>
                <EditableField page="home" block="footer" field="studio_line2" type="text" label="Studio line 2">
                  {block.studio_line2}
                </EditableField>
              </li>
              <li>
                <EditableField page="home" block="footer" field="studio_line3" type="text" label="Studio line 3">
                  {block.studio_line3}
                </EditableField>
              </li>
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
            {block.wordmark}
          </div>
        </div>
      </div>
    </footer>
  );
}
