import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { Nav } from "@/components/riboli/Nav";
import { Footer } from "@/components/riboli/Footer";
import { MagneticButton } from "@/components/riboli/MagneticButton";
import techImg from "@/assets/tech-detail.jpg";
import heroImg from "@/assets/hero.jpg";
import r520 from "@/assets/model-r520.jpg";
import r680 from "@/assets/model-r680.jpg";
import r950 from "@/assets/model-r950.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About RIBALI — Handcrafted RIBs from the Aegean" },
      {
        name: "description",
        content:
          "Since 1998, RIBALI has been building rigid inflatable boats by hand in Piraeus. Discover our story, our craft, and the people behind every hull.",
      },
      { property: "og:title", content: "About RIBALI — Handcrafted RIBs from the Aegean" },
      {
        property: "og:description",
        content:
          "The story, craft, and people behind RIBALI — handcrafted RIBs from Piraeus since 1998.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://vivid-web-revival.lovable.app/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://vivid-web-revival.lovable.app/about" }],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    index: "01",
    title: "Craft",
    body: "Every hull is laid by hand in our Piraeus workshop. No shortcuts, no compromises — only the patience of people who have shaped fiberglass for three decades.",
  },
  {
    index: "02",
    title: "Sea",
    body: "The Aegean is our proving ground. We test in the meltemi, in the swell, in the salt — because a boat is only as honest as the water it has answered to.",
  },
  {
    index: "03",
    title: "Precision",
    body: "Millimeters matter. Deck angles, tube pressure, hull geometry — measured, re-measured, and refined until each detail earns its place on the water.",
  },
  {
    index: "04",
    title: "Endurance",
    body: "A RIBALI is built to outlast trends. We use marine-grade materials, over-engineered fittings, and finishes that age the way good things should.",
  },
];

const TEAM = [
  {
    initials: "AR",
    color: "#0A1628",
    name: "Andreas Riboli",
    role: "Founder & Chief Designer",
    bio: "Third-generation shipwright. Founded RIBALI in 1998 with a sketch and a stubborn belief in Greek craftsmanship.",
  },
  {
    initials: "EM",
    color: "#B87A5A",
    name: "Elena Marinaki",
    role: "Head of Design",
    bio: "Naval architect, ex-Ferretti. Leads the studio behind every RIBALI hull silhouette since 2014.",
  },
  {
    initials: "NK",
    color: "#4A5D3A",
    name: "Nikos Kavvadias",
    role: "Master Craftsman",
    bio: "Twenty-eight years on the shop floor. Signs off on every hull before it leaves the yard.",
  },
];

const CHAPTERS = [
  {
    year: "1998",
    title: "The first hull.",
    body: "RIBALI begins in a rented garage in Perama. Two brothers, one salvaged mold, and a friend from Aegina who needed a boat. He is still on the water. So is the boat.",
    image: heroImg,
  },
  {
    year: "2010",
    title: "Open-sea DNA.",
    body: "The shipyard doubles. We stop copying and start designing — Deep-V hulls, welded tubes, and a stubborn refusal to hurry. Word travels the way it does in a small industry: slowly, then all at once.",
    image: r680,
  },
  {
    year: "2026",
    title: "The RIBALI line.",
    body: "R-520, R-680, R-950 — three hulls, one philosophy. Fewer than eighty boats a year, each one carrying the name of the person who finished her deck.",
    image: r950,
  },
];

function AboutPage() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".about-eyebrow", { y: 12, opacity: 0, duration: 0.6 })
        .from(
          ".about-title span",
          { y: 80, opacity: 0, duration: 0.9, stagger: 0.05 },
          "-=0.3",
        )
        .from(".about-hero-lede", { y: 20, opacity: 0, duration: 0.7 }, "-=0.5")
        .from(".about-hero-media", { scale: 1.06, opacity: 0, duration: 1.1 }, "-=1.0");

      gsap.to(".about-hero-media", {
        yPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: ".about-hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      gsap.from(".value-card", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: { trigger: ".values-grid", start: "top 80%" },
      });

      gsap.from(".team-card", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: ".team-grid", start: "top 80%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const title = "A boat is a promise.".split("");

  return (
    <main ref={root} className="relative bg-paper min-h-screen text-ink">
      <Nav />

      {/* HERO */}
      <section className="about-hero relative pt-32 pb-16 md:pb-24 px-6 md:px-10 overflow-hidden border-b border-ink/10">
        <div className="about-eyebrow text-[10px] uppercase tracking-[0.35em] text-copper mb-6">
          Since 1998 · Piraeus, Greece
        </div>
        <h1 className="about-title font-display text-[13vw] md:text-[9vw] leading-[0.9] tracking-tight max-w-6xl">
          {title.map((c, i) => (
            <span key={i} className="inline-block whitespace-pre">
              {c}
            </span>
          ))}
        </h1>
        <p className="about-hero-lede mt-10 max-w-2xl text-ink/70 text-base md:text-lg leading-relaxed">
          RIBALI is a small shipyard on the edge of the Piraeus harbor. For almost three decades
          we have built rigid inflatable boats one hull at a time — for fishermen, for coast
          guards, for families who understand that the best sea days begin with a boat you trust.
        </p>

        <div className="about-hero-media mt-16 relative aspect-[16/9] overflow-hidden">
          <img
            src={heroImg}
            alt="RIBALI shipyard workshop in Piraeus"
            className="w-full h-full object-cover"
            style={{ filter: "contrast(1.05) saturate(0.85)" }}
          />
        </div>
      </section>

      {/* STORY */}
      <section className="px-6 md:px-10 py-20 md:py-32 border-b border-ink/10">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10 md:gap-16 max-w-6xl">
          <div className="reveal-up">
            <div className="text-[10px] uppercase tracking-[0.35em] text-copper mb-3">
              Our story
            </div>
            <div className="font-display text-5xl md:text-6xl leading-none text-ink/90">
              27
              <span className="text-copper">.</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-ink/50 mt-2">
              Years in the water
            </div>
          </div>
          <div className="reveal-up space-y-6 text-ink/80 text-base md:text-lg leading-relaxed">
            <p>
              RIBALI began in a rented garage in Perama, with two brothers and a single mold
              recovered from an old fishing coop. The first hull went to a friend of the family
              who ran charters out of Aegina. He is still on the water. So is the boat.
            </p>
            <p>
              Word traveled the way it does in a small industry — slowly, then all at once. By
              2004 we had moved to the current shipyard, doubled the team, and started designing
              our own hulls from scratch. Today RIBALI boats sail from the Cyclades to the
              Adriatic, from the coasts of Morocco to the fjords of Norway.
            </p>
            <p>
              We are still small on purpose. We build fewer than eighty boats a year, so that
              every one of them leaves the yard with a person's name attached to it — the
              craftsman who finished the deck, the designer who signed off the lines, the
              founder who tested the ride.
            </p>
          </div>
        </div>
      </section>

      {/* CRAFT + VALUES */}
      <section className="bg-ink text-paper px-6 md:px-10 py-20 md:py-32">
        <div className="max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10 md:gap-16 mb-16 md:mb-24">
            <div className="reveal-up">
              <div className="text-[10px] uppercase tracking-[0.35em] text-copper-soft mb-3">
                The craft
              </div>
              <h2 className="font-display text-5xl md:text-7xl leading-none">
                Hand-laid.<br />Aegean-tested.
              </h2>
            </div>
            <div className="reveal-up self-end space-y-5 text-paper/70 text-base md:text-lg leading-relaxed">
              <p>
                Every RIBALI hull is laminated by hand — layer by layer, resin by resin — over a
                custom mold. The tubes are welded in-house, the consoles milled from marine ply,
                the fittings sourced from suppliers we have used for twenty years and see for
                coffee.
              </p>
              <p>
                Nothing leaves the yard without spending a day at sea. Under our own hands, under
                our own sky, before it belongs to yours.
              </p>
            </div>
          </div>

          <div className="values-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-paper/10">
            {VALUES.map((v) => (
              <div key={v.index} className="value-card bg-ink p-8 md:p-10 min-h-[280px] flex flex-col">
                <div className="font-display text-6xl text-copper-soft mb-6">{v.index}</div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-paper mb-4">
                  {v.title}
                </div>
                <p className="text-paper/60 text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="px-6 md:px-10 py-20 md:py-32 border-b border-ink/10">
        <div className="max-w-6xl">
          <div className="reveal-up mb-16 md:mb-20 flex items-end justify-between gap-8 flex-wrap">
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-copper mb-3">
                The people
              </div>
              <h2 className="font-display text-5xl md:text-7xl leading-none max-w-2xl">
                A yard is only<br />as good as its hands.
              </h2>
            </div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">
              18 people · 1 shipyard
            </div>
          </div>

          <div className="team-grid grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {TEAM.map((p) => (
              <article key={p.name} className="team-card group">
                <div
                  className="aspect-[4/5] mb-5 flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: p.color }}
                >
                  <span className="font-display text-8xl text-paper/90 tracking-tight">
                    {p.initials}
                  </span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-copper mb-2">
                  {p.role}
                </div>
                <h3 className="font-display text-2xl mb-2">{p.name}</h3>
                <p className="text-sm text-ink/60 leading-relaxed">{p.bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-10 py-20 md:py-32">
        <div className="max-w-5xl">
          <div className="reveal-up">
            <div className="text-[10px] uppercase tracking-[0.35em] text-copper mb-4">
              Come see for yourself
            </div>
            <h2 className="font-display text-6xl md:text-[8vw] leading-[0.9] tracking-tight mb-10">
              Visit the shipyard.
            </h2>
            <p className="text-ink/60 text-base md:text-lg max-w-2xl mb-10 leading-relaxed">
              Our doors are open by appointment. Walk the workshop, meet the team, and see the
              next hull taking shape. Or start yours from the configurator.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/#dealers"
                className="group inline-flex items-center gap-3 bg-ink text-paper px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-copper transition-colors"
              >
                Visit our shipyard
                <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </a>
              <Link
                to="/configurator"
                className="group inline-flex items-center gap-3 border border-ink text-ink px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-ink hover:text-paper transition-colors"
              >
                Configure yours
                <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>
          </div>

          <div className="reveal-up mt-20 pt-10 border-t border-ink/10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-ink/50 mb-2">Address</div>
              <div className="text-ink/80">Akti Themistokleous 142<br />Piraeus 18538, Greece</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-ink/50 mb-2">Hours</div>
              <div className="text-ink/80">Mon–Fri · 09:00–18:00<br />Saturday by appointment</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-ink/50 mb-2">Contact</div>
              <div className="text-ink/80">yard@ribali.gr<br />+30 210 000 0000</div>
            </div>
          </div>
        </div>
        {/* subtle bottom image */}
        <div className="reveal-up mt-24 max-w-6xl aspect-[21/9] overflow-hidden">
          <img
            src={techImg}
            alt="RIBALI hull detail"
            className="w-full h-full object-cover"
            style={{ filter: "contrast(1.05) saturate(0.85)" }}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
