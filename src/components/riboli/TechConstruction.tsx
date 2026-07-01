import { motion } from "framer-motion";
import techImg from "@/assets/tech-detail.jpg";

const steps = [
  {
    n: "01",
    title: "ORCA Hypalon Fabric",
    body: "Χρησιμοποιούμε αποκλειστικά τα καλύτερα υφάσματα παγκοσμίως για μέγιστη αντοχή στον ήλιο και τη θάλασσα.",
  },
  {
    n: "02",
    title: "Deep-V Hull Design",
    body: "Γάστρες σχεδιασμένες για απόλυτη ευστάθεια και οικονομία καυσίμου ακόμα και σε δύσκολες συνθήκες.",
  },
  {
    n: "03",
    title: "Custom Engineering",
    body: "Κάθε σκάφος RIBOLI είναι μοναδικό, προσαρμοσμένο στις δικές σας ανάγκες και αισθητική.",
  },
];

export function TechConstruction() {
  return (
    <section id="tech" className="py-24 md:py-32 px-6 md:px-10 border-t border-stone-200 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-brand-red font-bold text-xs uppercase tracking-[0.2em] mb-4 block">
            Τεχνολογία & Κατασκευή
          </span>
          <h2 className="text-3xl md:text-5xl font-display uppercase text-brand-navy mb-10 leading-tight">
            Κατασκευή Χωρίς <br />
            Συμβιβασμούς
          </h2>
          <div className="space-y-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
                className="flex gap-6"
              >
                <div className="shrink-0 w-12 h-12 bg-brand-navy text-white grid place-items-center font-display font-bold">
                  {s.n}
                </div>
                <div>
                  <h4 className="font-bold uppercase tracking-wider mb-2 text-brand-navy">
                    {s.title}
                  </h4>
                  <p className="text-brand-stone text-sm leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <img
            src={techImg}
            alt="Λεπτομέρεια κατασκευής γάστρας RIBOLI"
            loading="lazy"
            width={1024}
            height={1024}
            className="w-full aspect-square object-cover"
          />
          <div className="absolute -bottom-6 -left-6 bg-brand-red text-white p-6 md:p-8">
            <div className="text-3xl md:text-4xl font-display">25+</div>
            <div className="text-[10px] font-bold uppercase tracking-widest mt-1">
              Χρόνια Εμπειρίας
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
