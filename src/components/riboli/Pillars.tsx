import { motion } from "framer-motion";
import { usePageBlock } from "@/lib/page-blocks";
import { EditableField } from "@/components/editor/EditableField";
import { RichText } from "@/components/admin/cms/RichText";

type Pillar = { title: string; body: string; n?: string };
type PillarsContent = { items: Pillar[] };

const FALLBACK: PillarsContent = {
  items: [
    {
      n: "01",
      title: "ΠΟΙΟΤΗΤΑ",
      body: "Χειροποίητη κατασκευή με ORCA Hypalon και υψηλά πρότυπα φινιρίσματος που αντέχουν στο Αιγαίο.",
    },
    {
      n: "02",
      title: "ΑΠΟΔΟΣΗ",
      body: "Σχεδιασμός Deep-V γάστρας για ταχύτητα, σταθερότητα και ασφάλεια σε κάθε κύμα.",
    },
    {
      n: "03",
      title: "ΕΞΥΠΗΡΕΤΗΣΗ",
      body: "Υποστήριξη από εξειδικευμένο δίκτυο αντιπροσώπων σε όλη την Ελλάδα.",
    },
  ],
};

export function Pillars() {
  const block = usePageBlock<PillarsContent>("home", "pillars", FALLBACK);
  const items = Array.isArray(block.items) && block.items.length ? block.items : FALLBACK.items;

  return (
    <section id="pillars" className="relative py-20 md:py-28 px-6 md:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10">
        {items.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.12 }}
            className="bg-brand-navy/60 backdrop-blur-sm p-10 md:p-12 group hover:bg-brand-navy-2/70 transition-colors"
          >
            <span className="block text-brand-red font-mono text-xs mb-6">
              {p.n ?? String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
            <EditableField
              page="home"
              block="pillars"
              field={`items.${i}.title`}
              type="text"
              label={`Pillar #${i + 1} title`}
              as="div"
              className="text-2xl font-display uppercase text-white mb-4"
            >
              <h3 className="text-2xl font-display uppercase text-white">{p.title}</h3>
            </EditableField>
            <EditableField
              page="home"
              block="pillars"
              field={`items.${i}.body`}
              type="richtext"
              label={`Pillar #${i + 1} body`}
              as="div"
              className="text-white/60 text-sm leading-relaxed max-w-xs"
            >
              <RichText html={p.body} className="text-white/60 text-sm leading-relaxed max-w-xs" />
            </EditableField>
            <div className="mt-8 w-8 h-[1px] bg-brand-red group-hover:w-16 transition-all" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
