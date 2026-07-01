import { motion } from "framer-motion";

export function DealersCTA() {
  return (
    <section
      id="dealers"
      className="relative py-24 md:py-32 px-6 md:px-10 text-center overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:60px_60px]" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative max-w-3xl mx-auto"
      >
        <span className="text-brand-red font-bold text-xs uppercase tracking-[0.3em] mb-6 block">
          Dealers Network
        </span>
        <h2 className="text-white text-3xl md:text-5xl font-display uppercase mb-6 leading-tight">
          Γίνετε Μέλος της Οικογένειας RIBOLI
        </h2>
        <p className="text-white/60 mb-10 max-w-xl mx-auto">
          Βρείτε τον πλησιέστερο εξουσιοδοτημένο συνεργάτη και προγραμματίστε
          ένα test drive σήμερα.
        </p>
        <a
          href="#"
          className="inline-block bg-brand-red text-white px-12 py-5 font-bold uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-brand-navy transition-all"
        >
          Δίκτυο Συνεργατών
        </a>
      </motion.div>
    </section>
  );
}
