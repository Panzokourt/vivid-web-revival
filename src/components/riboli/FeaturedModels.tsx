import { motion } from "framer-motion";
import r680 from "@/assets/model-r680.jpg";
import r950 from "@/assets/model-r950.jpg";
import r520 from "@/assets/model-r520.jpg";

const models = [
  {
    img: r680,
    name: "R-680 SPORT",
    specs: "6.8m | 250HP Max | 12 Pax",
    tag: "Best Seller",
  },
  {
    img: r950,
    name: "R-950 CRUISE",
    specs: "9.5m | 600HP Max | 16 Pax",
    tag: "Flagship",
  },
  {
    img: r520,
    name: "R-520 EXPLORE",
    specs: "5.2m | 115HP Max | 8 Pax",
    tag: "Compact",
  },
];

export function FeaturedModels() {
  return (
    <section id="models" className="relative py-24 md:py-32 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-16"
        >
          <div>
            <span className="text-brand-red font-bold text-xs uppercase tracking-[0.2em] mb-4 block">
              Η ΣΥΛΛΟΓΗ ΜΑΣ
            </span>
            <h2 className="text-3xl md:text-5xl font-display uppercase text-white leading-tight">
              ΜΟΝΤΕΛΑ
            </h2>
          </div>
          <a
            href="#"
            className="self-start text-xs font-bold uppercase tracking-widest border-b-2 border-brand-red pb-1 text-white hover:text-brand-red transition-colors"
          >
            ΌΛΑ ΤΑ ΣΚΑΦΗ →
          </a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {models.map((m, i) => (
            <motion.a
              key={m.name}
              href="#"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="group cursor-pointer block"
            >
              <div className="overflow-hidden mb-6 relative bg-brand-navy/40 backdrop-blur-sm border border-white/5">
                <img
                  src={m.img}
                  alt={m.name}
                  loading="lazy"
                  width={800}
                  height={1024}
                  className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <span className="absolute top-4 left-4 bg-brand-red text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                  {m.tag}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display text-xl text-white mb-1">
                    {m.name}
                  </h3>
                  <p className="text-white/60 text-sm">{m.specs}</p>
                </div>
                <span className="text-brand-red font-bold text-xl group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
