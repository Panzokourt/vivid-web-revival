import { createFileRoute, Link } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { Nav } from "@/components/riboli/Nav";
import { Footer } from "@/components/riboli/Footer";
import { MagneticButton } from "@/components/riboli/MagneticButton";
import { DealersMap, type DealerPin } from "@/components/riboli/DealersMap";

export const Route = createFileRoute("/dealers")({
  head: () => ({
    meta: [
      { title: "RIBALI Dealers — Authorised Partners across the Mediterranean" },
      {
        name: "description",
        content:
          "Find your nearest authorised RIBALI dealer. Sea trials, service, and delivery across Greece, Italy, France, Spain, Croatia, and the UAE.",
      },
      { property: "og:title", content: "RIBALI Dealers — Authorised Partners" },
      {
        property: "og:description",
        content:
          "Authorised RIBALI dealers across the Mediterranean and beyond. Book a private sea trial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "RIBALI Dealers" },
      {
        name: "twitter:description",
        content: "Authorised RIBALI partners across the Mediterranean and beyond.",
      },
    ],
    links: [{ rel: "canonical", href: "https://vivid-web-revival.lovable.app/dealers" }],
  }),
  component: DealersPage,
});

const REGIONS = [
  {
    region: "Greece",
    dealers: [
      {
        id: "gr-piraeus",
        name: "RIBALI Piraeus — Flagship",
        address: "Akti Themistokleous 142, Piraeus 18538",
        phone: "+30 210 000 0000",
        email: "piraeus@ribali.gr",
        hours: "Mon–Sat · 09:00 – 19:00",
        lat: 37.9364,
        lng: 23.6511,
      },
      {
        id: "gr-mykonos",
        name: "RIBALI Mykonos",
        address: "Ornos Marina, Mykonos 84600",
        phone: "+30 22890 000 00",
        email: "mykonos@ribali.gr",
        hours: "Apr–Oct · daily",
        lat: 37.4291,
        lng: 25.3389,
      },
      {
        id: "gr-rhodes",
        name: "RIBALI Rhodes",
        address: "Mandraki Harbour, Rhodes 85100",
        phone: "+30 22410 000 00",
        email: "rhodes@ribali.gr",
        hours: "Mon–Fri · 09:00 – 18:00",
        lat: 36.4507,
        lng: 28.2277,
      },
    ],
  },
  {
    region: "Italy",
    dealers: [
      {
        id: "it-portofino",
        name: "RIBALI Portofino",
        address: "Molo Umberto I, 16034 Portofino GE",
        phone: "+39 0185 000 000",
        email: "portofino@ribali.it",
        hours: "Tue–Sun · 10:00 – 19:00",
        lat: 44.3032,
        lng: 9.2094,
      },
      {
        id: "it-sardegna",
        name: "RIBALI Sardegna",
        address: "Porto Cervo Marina, 07021 Arzachena SS",
        phone: "+39 0789 000 000",
        email: "sardegna@ribali.it",
        hours: "May–Sep · daily",
        lat: 41.1387,
        lng: 9.5379,
      },
    ],
  },
  {
    region: "France & Monaco",
    dealers: [
      {
        id: "fr-monaco",
        name: "RIBALI Côte d'Azur",
        address: "Port Hercule, 98000 Monaco",
        phone: "+377 93 00 00 00",
        email: "monaco@ribali.fr",
        hours: "Mon–Sat · 09:30 – 18:30",
        lat: 43.7333,
        lng: 7.4256,
      },
    ],
  },
  {
    region: "Spain & Balearics",
    dealers: [
      {
        id: "es-palma",
        name: "RIBALI Palma",
        address: "Moll Vell 3, 07012 Palma de Mallorca",
        phone: "+34 971 000 000",
        email: "palma@ribali.es",
        hours: "Mon–Fri · 09:00 – 18:00",
        lat: 39.5667,
        lng: 2.6417,
      },
    ],
  },
  {
    region: "Croatia",
    dealers: [
      {
        id: "hr-split",
        name: "RIBALI Split",
        address: "ACI Marina Split, 21000 Split",
        phone: "+385 21 000 000",
        email: "split@ribali.hr",
        hours: "Apr–Oct · daily",
        lat: 43.5027,
        lng: 16.4381,
      },
    ],
  },
  {
    region: "United Arab Emirates",
    dealers: [
      {
        id: "ae-dubai",
        name: "RIBALI Dubai",
        address: "Dubai Marina Yacht Club, Dubai",
        phone: "+971 4 000 0000",
        email: "dubai@ribali.ae",
        hours: "Sun–Thu · 10:00 – 20:00",
        lat: 25.0805,
        lng: 55.1403,
      },
    ],
  },
] as const;

const ALL_PINS: DealerPin[] = REGIONS.flatMap((r) =>
  r.dealers.map((d) => ({
    id: d.id,
    name: d.name,
    region: r.region,
    address: d.address,
    phone: d.phone,
    email: d.email,
    lat: d.lat,
    lng: d.lng,
  })),
);

function DealersPage() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".dealers-eyebrow", { y: 12, opacity: 0, duration: 0.6 })
        .from(
          ".dealers-title span",
          { y: 80, opacity: 0, duration: 0.9, stagger: 0.05 },
          "-=0.3",
        )
        .from(".dealers-lede", { y: 20, opacity: 0, duration: 0.7 }, "-=0.5");

      gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      gsap.utils.toArray<HTMLElement>(".region-block").forEach((block) => {
        gsap.from(block.querySelectorAll(".dealer-card"), {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: block, start: "top 80%" },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const title = "Find a dealer.".split("");

  return (
    <main ref={root} className="relative bg-paper min-h-screen text-ink">
      <Nav />

      {/* HERO */}
      <section className="relative pt-32 pb-16 md:pb-24 px-6 md:px-10 overflow-hidden border-b border-ink/10">
        <div className="dealers-eyebrow text-[10px] uppercase tracking-[0.35em] text-copper mb-6">
          Dealers Network · Mediterranean & beyond
        </div>
        <h1 className="dealers-title font-display text-[13vw] md:text-[9vw] leading-[0.9] tracking-tight max-w-6xl">
          {title.map((c, i) => (
            <span key={i} className="inline-block whitespace-pre">
              {c}
            </span>
          ))}
        </h1>
        <p className="dealers-lede mt-10 max-w-2xl text-ink/70 text-base md:text-lg leading-relaxed">
          Every RIBALI leaves the yard hand-signed by the person who finished
          her deck. Our authorised partners carry that same care to the water —
          from sea trials in the Aegean to service in the Balearics.
        </p>
      </section>

      {/* REGIONS */}
      <section className="px-6 md:px-10 py-16 md:py-24 border-b border-ink/10">
        <div className="max-w-[1600px] mx-auto space-y-20 md:space-y-28">
          {REGIONS.map((r) => (
            <div key={r.region} className="region-block">
              <div className="reveal-up flex items-end justify-between gap-6 mb-10 md:mb-14 border-b border-ink/10 pb-6">
                <h2 className="font-display text-4xl md:text-6xl leading-none">
                  {r.region}
                </h2>
                <div className="text-[10px] uppercase tracking-[0.3em] text-ink/50">
                  {r.dealers.length} {r.dealers.length === 1 ? "location" : "locations"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {r.dealers.map((d) => (
                  <article
                    key={d.name}
                    className="dealer-card group flex flex-col justify-between border border-ink/10 p-8 md:p-10 bg-paper hover:border-copper transition-colors"
                  >
                    <div className="space-y-4">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-copper">
                        Authorised
                      </div>
                      <h3 className="font-display text-2xl md:text-3xl leading-tight">
                        {d.name}
                      </h3>
                      <p className="text-sm text-ink/70 leading-relaxed">{d.address}</p>
                    </div>

                    <dl className="mt-8 space-y-3 text-sm border-t border-ink/10 pt-6">
                      <div className="flex gap-3">
                        <dt className="text-[10px] uppercase tracking-[0.3em] text-ink/50 w-16 pt-1">
                          Phone
                        </dt>
                        <dd className="text-ink/85">{d.phone}</dd>
                      </div>
                      <div className="flex gap-3">
                        <dt className="text-[10px] uppercase tracking-[0.3em] text-ink/50 w-16 pt-1">
                          Email
                        </dt>
                        <dd className="text-ink/85 break-all">
                          <a href={`mailto:${d.email}`} className="hover:text-copper transition-colors">
                            {d.email}
                          </a>
                        </dd>
                      </div>
                      <div className="flex gap-3">
                        <dt className="text-[10px] uppercase tracking-[0.3em] text-ink/50 w-16 pt-1">
                          Hours
                        </dt>
                        <dd className="text-ink/85">{d.hours}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BECOME A DEALER */}
      <section className="bg-ink text-paper px-6 md:px-10 py-20 md:py-32">
        <div className="max-w-5xl">
          <div className="reveal-up">
            <div className="text-[10px] uppercase tracking-[0.35em] text-copper-soft mb-4">
              Partnership
            </div>
            <h2 className="font-display text-5xl md:text-[7vw] leading-[0.9] tracking-tight mb-10">
              Become a<br />RIBALI dealer.
            </h2>
            <p className="text-paper/70 text-base md:text-lg max-w-2xl mb-10 leading-relaxed">
              We keep the network small on purpose. If you run a marina,
              brokerage, or service yard that puts the water first, we would
              like to hear from you.
            </p>
            <div className="flex flex-wrap gap-4">
              <MagneticButton
                as={Link}
                to="/contact"
                className="group inline-flex items-center gap-3 bg-paper text-ink px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-copper hover:text-paper transition-colors"
              >
                Apply to partner
                <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </MagneticButton>
              <MagneticButton
                as={Link}
                to="/configurator"
                className="group inline-flex items-center gap-3 border border-paper/60 text-paper px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-paper hover:text-ink transition-colors"
              >
                Configure a hull
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
