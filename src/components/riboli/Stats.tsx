import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 25, suffix: "+", label: "Χρόνια Εμπειρίας" },
  { value: 500, suffix: "+", label: "Σκάφη Παραδοθέντα" },
  { value: 12, suffix: "", label: "Μοντέλα RIB" },
  { value: 10, suffix: "ετής", label: "Εγγύηση Γάστρας" },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to]);
  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="bg-brand-navy-2 py-16 md:py-20 px-6 md:px-10 border-y border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="text-center md:text-left"
          >
            <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
              <Counter to={s.value} suffix={s.suffix} />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
