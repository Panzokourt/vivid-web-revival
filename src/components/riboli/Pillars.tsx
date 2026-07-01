import { motion } from "framer-motion";

const pillars = [
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
];

export function Pillars() {
  return (
    <section id="pillars" className="bg-brand-navy py-20 md:py-28 px-6 md:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10">
        {pillars.map((p, i) => (
          <motion.div
            key={p.n}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.12 }}
            className="bg-brand-navy p-10 md:p-12 group hover:bg-brand-navy-2 transition-colors"
          >
            <span className="block text-brand-red font-mono text-xs mb-6">
              {p.n} / 03
            </span>
            <h3 className="text-2xl font-display uppercase text-white mb-4">
              {p.title}
            </h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              {p.body}
            </p>
            <div className="mt-8 w-8 h-[1px] bg-brand-red group-hover:w-16 transition-all" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
