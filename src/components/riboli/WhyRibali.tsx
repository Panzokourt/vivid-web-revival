import { usePageBlock } from "@/lib/page-blocks";
import { EditableField } from "@/components/editor/EditableField";
import { EditableItemControls, EditableAddButton } from "@/components/editor/EditableList";
import { RichText } from "@/components/admin/cms/RichText";

type Pillar = { title: string; body: string };
type WhyContent = {
  eyebrow: string;
  title: string;
  intro: string;
  pillars: Pillar[];
};

const FALLBACK: WhyContent = {
  eyebrow: "Γιατί RIBALI",
  title: "Εξήντα χρόνια\nστη θάλασσα.",
  intro:
    "Η οικογένεια Αλιβιζάτου εισάγει και υποστηρίζει σκάφη από το 1963. Η RIBALI είναι η φυσική συνέχεια: δικές μας κατασκευές, με το ίδιο δίκτυο και την ίδια υπόσχεση.",
  pillars: [
    { title: "Γραπτές εγγυήσεις", body: "10ετής εγγύηση γάστρας, 5ετής tubes ORCA Hypalon, 2ετής εξοπλισμού — γραπτά, σε κάθε παραγγελία." },
    { title: "Πανελλαδικό δίκτυο", body: "Επίσημοι αντιπρόσωποι σε 12 λιμάνια — από την Καβάλα μέχρι τα Χανιά — για service και ανταλλακτικά." },
    { title: "Από το 1963", body: "Έξι δεκαετίες εμπειρίας στην εισαγωγή και συντήρηση επαγγελματικών σκαφών από τον Αλιβιζάτο." },
    { title: "After-sales", body: "Ετήσιο service, χειμερινή φύλαξη και emergency support σε 24 ώρες — ό,τι χρειάζεται για να μείνεις στο νερό." },
    { title: "Επιλεγμένα εργοστάσια", body: "Yamaha, Suzuki, Mercury, Garmin, Simrad — μόνο εργοστάσια που έχουμε ελέγξει και εμπιστευόμαστε." },
    { title: "Χειροποίητη κατασκευή", body: "Κάθε γάστρα φτιάχνεται με το χέρι στον Πειραιά και δοκιμάζεται στο Σαρωνικό πριν παραδοθεί." },
  ],
};

export function WhyRibali() {
  const block = usePageBlock<WhyContent>("home", "why_ribali", FALLBACK);
  const pillars = Array.isArray(block.pillars) && block.pillars.length ? block.pillars : FALLBACK.pillars;

  return (
    <section id="why-ribali" className="relative bg-paper text-ink border-y border-ink/10">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-24 md:py-36 grid lg:grid-cols-[1fr_1.4fr] gap-16">
        <div className="lg:sticky lg:top-24 self-start">
          <EditableField page="home" block="why_ribali" field="eyebrow" type="text" label="Eyebrow" as="div" className="text-[11px] uppercase tracking-[0.3em] text-copper">
            {block.eyebrow}
          </EditableField>
          <EditableField page="home" block="why_ribali" field="title" type="textarea" label="Τίτλος" as="div" className="font-display text-5xl md:text-7xl leading-[0.9] mt-5 whitespace-pre-line">
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9] whitespace-pre-line">{block.title}</h2>
          </EditableField>
          <EditableField page="home" block="why_ribali" field="intro" type="richtext" label="Εισαγωγή" as="div" className="mt-8 max-w-md">
            <RichText html={block.intro} className="text-ink/70 leading-relaxed" />
          </EditableField>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-ink/10">
          {pillars.map((p, i) => (
            <li key={i} className="relative bg-paper p-8 md:p-10 min-h-[220px]">
              <EditableItemControls page="home" block="why_ribali" path="pillars" index={i} total={pillars.length} className="top-2 right-2" />
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-copper mb-5">
                {String(i + 1).padStart(2, "0")} / {String(pillars.length).padStart(2, "0")}
              </div>
              <EditableField page="home" block="why_ribali" field={`pillars.${i}.title`} type="text" label={`Pillar ${i + 1} τίτλος`} as="div" className="font-display text-2xl mb-3">
                {p.title}
              </EditableField>
              <EditableField page="home" block="why_ribali" field={`pillars.${i}.body`} type="richtext" label={`Pillar ${i + 1} κείμενο`} as="div" className="text-ink/70 text-sm leading-relaxed max-w-sm">
                <RichText html={p.body} className="text-ink/70 text-sm leading-relaxed" />
              </EditableField>
            </li>
          ))}
          <li className="bg-paper p-8 md:p-10 flex items-center justify-center">
            <EditableAddButton
              page="home"
              block="why_ribali"
              path="pillars"
              template={{ title: "Νέος πυλώνας", body: "Περιγραφή..." }}
              label="Προσθήκη πυλώνα"
            />
          </li>
        </ul>
      </div>
    </section>
  );
}
