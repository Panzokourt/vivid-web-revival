import { createFileRoute, Link } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { Nav } from "@/components/riboli/Nav";
import { Footer } from "@/components/riboli/Footer";
import { MagneticButton } from "@/components/riboli/MagneticButton";
import r520 from "@/assets/model-r520.jpg";
import r680 from "@/assets/model-r680.jpg";
import r950 from "@/assets/model-r950.jpg";

export const Route = createFileRoute("/models")({
  head: () => ({
    meta: [
      { title: "The RIBALI Collection — R-520, R-680, R-950" },
      {
        name: "description",
        content:
          "Three handcrafted RIB hulls from the Piraeus atelier. Compare the R-520 Explore, R-680 Sport, and R-950 Cruise across length, power, and capacity.",
      },
      { property: "og:title", content: "The RIBALI Collection — R-520, R-680, R-950" },
      {
        property: "og:description",
        content:
          "Three hulls, one philosophy. Explore the RIBALI collection of handcrafted Greek RIBs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "The RIBALI Collection" },
      {
        name: "twitter:description",
        content: "R-520, R-680, R-950 — handcrafted RIB hulls from Piraeus.",
      },
    ],
    links: [{ rel: "canonical", href: "https://vivid-web-revival.lovable.app/models" }],
  }),
  component: ModelsPage,
});

const MODELS = [
  {
    to: "/models/r-520" as const,
    img: r520,
    number: "520",
    name: "R-520 Explore",
    tag: "Compact",
    length: "5.2 M",
    power: "115 HP",
    pax: "8",
    body: "The nimble one. Built for coves, quick runs, and days you decide on a whim. A short hull with the full RIBALI hand-lay on every layer.",
  },
  {
    to: "/models/r-680" as const,
    img: r680,
    number: "680",
    name: "R-680 Sport",
    tag: "Best Seller",
    length: "6.8 M",
    power: "250 HP",
    pax: "12",
    body: "The one most families come back for. A deep-V open hull with room for twelve, tuned for open Aegean crossings and long lunches at anchor.",
  },
  {
    to: "/models/r-950" as const,
    img: r950,
    number: "950",
    name: "R-950 Cruise",
    tag: "Flagship",
    length: "9.5 M",
    power: "600 HP",
    pax: "16",
    body: "The flagship. Twin-console, bow cabin, welded ORCA Hypalon tubes. Built for owners who read weather charts before dinner menus.",
  },
] as const;

function ModelsPage() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".models-eyebrow", { y: 12, opacity: 0, duration: 0.6 })
        .from(
          ".models-title span",
          { y: 80, opacity: 0, duration: 0.9, stagger: 0.05 },
          "-=0.3",
        )
        .from(".models-lede", { y: 20, opacity: 0, duration: 0.7 }, "-=0.5");

      gsap.utils.toArray<HTMLElement>(".model-row").forEach((row) => {
        gsap.from(row.querySelectorAll(".row-el"), {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: row, start: "top 80%" },
        });
        gsap.from(row.querySelector(".row-media"), {
          scale: 1.08,
          opacity: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: row, start: "top 80%" },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const title = "The collection.".split("");

  return (
    <main ref={root} className="relative bg-paper min-h-screen text-ink">
      <Nav />

      {/* HERO */}
      <section className="relative pt-32 pb-16 md:pb-24 px-6 md:px-10 overflow-hidden border-b border-ink/10">
        <div className="models-eyebrow text-[10px] uppercase tracking-[0.35em] text-copper mb-6">
          Three hulls · One philosophy
        </div>
        <h1 className="models-title font-display text-[13vw] md:text-[9vw] leading-[0.9] tracking-tight max-w-6xl">
          {title.map((c, i) => (
            <span key={i} className="inline-block whitespace-pre">
              {c}
            </span>
          ))}
        </h1>
        <p className="models-lede mt-10 max-w-2xl text-ink/70 text-base md:text-lg leading-relaxed">
          Fewer than eighty boats leave the Piraeus shipyard each year. Each one
          is a variation on the same idea: a Deep-V hull, hand-laid, welded
          ORCA Hypalon tubes, and finishes that age the way good things should.
        </p>
      </section>

      {/* MODEL ROWS */}
      <section className="px-6 md:px-10 py-16 md:py-24 border-b border-ink/10">
        <div className="max-w-[1600px] mx-auto space-y-24 md:space-y-40">
          {MODELS.map((m, i) => {
            const reverse = i % 2 === 1;
            return (
              <article
                key={m.to}
                className={`model-row grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center`}
              >
                <Link
                  to={m.to}
                  className={`row-media relative block overflow-hidden aspect-[4/3] lg:aspect-[5/4] group isolate col-span-1 lg:col-span-7 ${
                    reverse ? "lg:order-2" : ""
                  }`}
                >
                  <img
                    src={m.img}
                    alt={m.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ filter: "contrast(1.05) saturate(0.85)" }}
                  />
                  <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-ink/40 to-transparent" />
                  <div className="absolute top-6 left-6 text-paper text-[10px] uppercase tracking-[0.3em] flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-copper" /> {m.tag}
                  </div>
                  <div className="absolute bottom-6 left-6 font-display leading-[0.85] text-paper text-[18vw] md:text-[12vw] lg:text-[8vw] text-invert-blend">
                    {m.number}
                  </div>
                </Link>

                <div
                  className={`col-span-1 lg:col-span-5 space-y-6 ${
                    reverse ? "lg:order-1" : ""
                  }`}
                >
                  <div className="row-el text-[10px] uppercase tracking-[0.35em] text-copper">
                    Model {String(i + 1).padStart(2, "0")}
                  </div>
                  <h2 className="row-el font-display text-5xl md:text-6xl leading-[0.95]">
                    {m.name}
                  </h2>
                  <p className="row-el text-ink/70 text-base md:text-lg leading-relaxed max-w-lg">
                    {m.body}
                  </p>

                  <dl className="row-el grid grid-cols-3 gap-6 pt-4 border-t border-ink/10 max-w-md">
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.3em] text-ink/50 mb-1">
                        Length
                      </dt>
                      <dd className="font-display text-2xl">{m.length}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.3em] text-ink/50 mb-1">
                        Power
                      </dt>
                      <dd className="font-display text-2xl">{m.power}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.3em] text-ink/50 mb-1">
                        Pax
                      </dt>
                      <dd className="font-display text-2xl">{m.pax}</dd>
                    </div>
                  </dl>

                  <div className="row-el pt-4 flex flex-wrap gap-3">
                    <MagneticButton
                      as={Link}
                      to={m.to}
                      className="group inline-flex items-center gap-3 bg-ink text-paper px-7 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-copper transition-colors"
                    >
                      Discover {m.number}
                      <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </MagneticButton>
                    <MagneticButton
                      as={Link}
                      to="/configurator"
                      className="group inline-flex items-center gap-3 border border-ink text-ink px-7 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-ink hover:text-paper transition-colors"
                    >
                      Configure
                    </MagneticButton>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-10 py-20 md:py-32">
        <div className="max-w-5xl">
          <div className="text-[10px] uppercase tracking-[0.35em] text-copper mb-4">
            Not sure which one?
          </div>
          <h2 className="font-display text-6xl md:text-[8vw] leading-[0.9] tracking-tight mb-10">
            Let the sea decide.
          </h2>
          <p className="text-ink/60 text-base md:text-lg max-w-2xl mb-10 leading-relaxed">
            Book a private sea trial with your nearest RIBALI dealer, or start
            a configuration and we'll help you narrow it down.
          </p>
          <div className="flex flex-wrap gap-4">
            <MagneticButton
              as="a"
              href="/#dealers"
              className="group inline-flex items-center gap-3 bg-ink text-paper px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-copper transition-colors"
            >
              Find a dealer
              <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">
                →
              </span>
            </MagneticButton>
            <MagneticButton
              as={Link}
              to="/contact"
              className="group inline-flex items-center gap-3 border border-ink text-ink px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-ink hover:text-paper transition-colors"
            >
              Talk to us
            </MagneticButton>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
