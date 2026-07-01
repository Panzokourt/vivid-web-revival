import { motion } from "framer-motion";
import heroImg from "@/assets/hero.jpg";

const line1 = "Η ΑΠΟΔΟΣΗ";
const line2 = "ΕΠΑΝΑΠΡΟΣΔΙΟΡΙΖΕΤΑΙ";

export function Hero() {
  return (
    <section className="relative h-screen min-h-[640px] flex items-center justify-center overflow-hidden">
      <img
        src={heroImg}
        alt="RIB σκάφος RIBOLI στην ελληνική θάλασσα"
        width={1920}
        height={1088}
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/60 via-transparent to-brand-navy/80" />


      <div className="relative z-10 text-center px-4 max-w-5xl">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="block text-[11px] font-semibold uppercase tracking-[0.4em] text-brand-red mb-6"
        >
          Inflatable Boats · RIB
        </motion.span>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display text-white uppercase leading-[1.05] mb-8">
          <RevealLine text={line1} delay={0.3} />
          <br />
          <span className="text-brand-red">
            <RevealLine text={line2} delay={0.9} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="text-white/80 max-w-xl mx-auto mb-10 text-base md:text-lg font-light leading-relaxed"
        >
          Χειροποίητα σκάφη RIB κορυφαίας ποιότητας, σχεδιασμένα για να δαμάζουν
          τα κύματα του Αιγαίου.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#models"
            className="bg-brand-red text-white px-10 py-4 font-bold uppercase tracking-widest text-xs hover:bg-brand-red/85 transition-colors"
          >
            ΔΕΙΤΕ ΤΗ ΣΕΙΡΑ
          </a>
          <a
            href="#tech"
            className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-4 font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-colors"
          >
            ΤΕΧΝΙΚΑ ΧΑΡΑΚΤΗΡΙΣΤΙΚΑ
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <motion.div
          animate={{ scaleY: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-[1px] h-12 bg-white/40 origin-top"
        />
        <span className="text-[10px] text-white/50 uppercase tracking-[0.3em]">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}

function RevealLine({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span className="inline-block">
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: delay + i * 0.035, ease: "easeOut" }}
          className="inline-block"
          style={{ whiteSpace: "pre" }}
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </span>
  );
}
