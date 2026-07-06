import { createFileRoute } from "@tanstack/react-router";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { Nav } from "@/components/riboli/Nav";
import { Footer } from "@/components/riboli/Footer";
import { MagneticButton } from "@/components/riboli/MagneticButton";

const SITE = "https://vivid-web-revival.lovable.app";
const CANONICAL = `${SITE}/contact`;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact RIBALI — Piraeus Shipyard" },
      {
        name: "description",
        content:
          "Get in touch with the RIBALI shipyard in Piraeus. Book a sea trial, request a quote, or visit our workshop by appointment.",
      },
      { property: "og:title", content: "Contact RIBALI — Piraeus Shipyard" },
      {
        property: "og:description",
        content:
          "Book a sea trial, request a quote, or visit the RIBALI workshop in Piraeus.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Contact RIBALI — Piraeus Shipyard" },
      {
        name: "twitter:description",
        content: "Book a sea trial, request a quote, or visit our workshop.",
      },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          url: CANONICAL,
          name: "Contact RIBALI",
          about: { "@id": `${SITE}/#organization` },
          mainEntity: {
            "@type": "Organization",
            name: "RIBALI",
            telephone: "+30 210 000 0000",
            email: "hello@ribali.gr",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Akti Themistokleous 142",
              addressLocality: "Piraeus",
              postalCode: "18538",
              addressCountry: "GR",
            },
          },
        }),
      },
    ],
  }),
  component: ContactPage,
});


const CHANNELS = [
  {
    label: "Shipyard",
    lines: ["Akti Themistokleous 142", "Piraeus 18538, Greece"],
  },
  {
    label: "Phone",
    lines: ["+30 210 000 0000", "Mon–Fri · 09:00 – 18:00 EET"],
  },
  {
    label: "Email",
    lines: ["hello@ribali.gr", "press@ribali.gr"],
  },
];

function ContactPage() {
  const root = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".contact-eyebrow", { y: 12, opacity: 0, duration: 0.6 })
        .from(
          ".contact-title span",
          { y: 80, opacity: 0, duration: 0.9, stagger: 0.05 },
          "-=0.3",
        )
        .from(".contact-lede", { y: 20, opacity: 0, duration: 0.7 }, "-=0.5");

      gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const title = "Say hello.".split("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sent");
  }

  return (
    <main ref={root} className="relative bg-paper min-h-screen text-ink">
      <Nav />

      {/* HERO */}
      <section className="relative pt-32 pb-16 md:pb-24 px-6 md:px-10 overflow-hidden border-b border-ink/10">
        <div className="contact-eyebrow text-[10px] uppercase tracking-[0.35em] text-copper mb-6">
          Contact · Piraeus, Greece
        </div>
        <h1 className="contact-title font-display text-[14vw] md:text-[9vw] leading-[0.9] tracking-tight max-w-6xl">
          {title.map((c, i) => (
            <span key={i} className="inline-block whitespace-pre">
              {c}
            </span>
          ))}
        </h1>
        <p className="contact-lede mt-10 max-w-2xl text-ink/70 text-base md:text-lg leading-relaxed">
          Whether you want to book a sea trial, request a quote, or simply
          understand what makes a RIBALI hull, we would love to hear from you.
          Every message is read by a person in the yard.
        </p>
      </section>

      {/* CHANNELS + FORM */}
      <section className="px-6 md:px-10 py-20 md:py-32 border-b border-ink/10">
        <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-16 lg:gap-24">
          <div className="reveal-up space-y-10">
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-copper mb-3">
                Direct channels
              </div>
              <h2 className="font-display text-4xl md:text-5xl leading-tight">
                Come by the yard,<br />or drop us a line.
              </h2>
            </div>
            <div className="space-y-8">
              {CHANNELS.map((c) => (
                <div key={c.label} className="border-t border-ink/10 pt-5">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-ink/50 mb-2">
                    {c.label}
                  </div>
                  <div className="text-ink/85 text-base leading-relaxed">
                    {c.lines.map((l) => (
                      <div key={l}>{l}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal-up">
            {status === "sent" ? (
              <div className="border border-ink/15 p-10 md:p-14">
                <div className="text-[10px] uppercase tracking-[0.35em] text-copper mb-3">
                  Message received
                </div>
                <h3 className="font-display text-3xl md:text-4xl leading-tight mb-4">
                  Thank you.
                </h3>
                <p className="text-ink/70 text-base leading-relaxed max-w-md">
                  A member of the RIBALI team will reply within one working day.
                  For urgent requests, please call the shipyard directly.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-ink/50">
                      Name
                    </span>
                    <input
                      required
                      name="name"
                      className="mt-2 w-full bg-transparent border-b border-ink/25 py-3 text-base text-ink focus:border-copper outline-none transition-colors"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-ink/50">
                      Email
                    </span>
                    <input
                      required
                      type="email"
                      name="email"
                      className="mt-2 w-full bg-transparent border-b border-ink/25 py-3 text-base text-ink focus:border-copper outline-none transition-colors"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-ink/50">
                    Subject
                  </span>
                  <select
                    name="subject"
                    className="mt-2 w-full bg-transparent border-b border-ink/25 py-3 text-base text-ink focus:border-copper outline-none transition-colors"
                    defaultValue="Sea trial"
                  >
                    <option>Sea trial</option>
                    <option>Quote request</option>
                    <option>Dealer enquiry</option>
                    <option>Press & partnerships</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-ink/50">
                    Message
                  </span>
                  <textarea
                    required
                    name="message"
                    rows={5}
                    className="mt-2 w-full bg-transparent border-b border-ink/25 py-3 text-base text-ink focus:border-copper outline-none resize-none transition-colors"
                  />
                </label>
                <div className="pt-4">
                  <MagneticButton
                    as="button"
                    type="submit"
                    className="group inline-flex items-center gap-3 bg-ink text-paper px-8 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-copper transition-colors"
                  >
                    Send message
                    <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </MagneticButton>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
