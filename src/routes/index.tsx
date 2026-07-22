import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Nav } from "@/components/riboli/Nav";
import { Hero } from "@/components/riboli/Hero";
import { FeaturedModels } from "@/components/riboli/FeaturedModels";
import { AnatomyRIB } from "@/components/riboli/AnatomyRIB";
import { Experiences } from "@/components/riboli/Experiences";
import { Heritage } from "@/components/riboli/Heritage";
import { WhyRibali } from "@/components/riboli/WhyRibali";
import { Stats } from "@/components/riboli/Stats";
import { DealersCTA } from "@/components/riboli/DealersCTA";
import { Footer } from "@/components/riboli/Footer";
import { ThreeBackground } from "@/components/riboli/ThreeBackground";
import { SectionSnap } from "@/components/riboli/SectionSnap";
import heroImg from "@/assets/hero.jpg";

const SITE = "https://vivid-web-revival.lovable.app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RIBALI — Handcrafted Greek RIB Boats" },
      {
        name: "description",
        content:
          "Greek atelier of handcrafted rigid inflatable boats. Deep-V hulls and ORCA Hypalon tubes, built by hand in Piraeus since 1998. Explore the R-520, R-680, and R-950.",
      },
      { property: "og:title", content: "RIBALI — Handcrafted Greek RIB Boats" },
      {
        property: "og:description",
        content:
          "Editorial performance craft. Handcrafted RIBs from Piraeus — Deep-V hulls, ORCA Hypalon tubes, Mediterranean dealer network.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/` },
      { property: "og:image", content: `${SITE}${heroImg}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "RIBALI — Handcrafted Greek RIB Boats" },
      {
        name: "twitter:description",
        content: "Editorial performance craft. Handcrafted RIBs from Piraeus.",
      },
      { name: "twitter:image", content: `${SITE}${heroImg}` },
    ],
    links: [
      { rel: "canonical", href: `${SITE}/` },
      { rel: "preload", as: "image", href: heroImg, fetchpriority: "high" } as unknown as { rel: string; href: string },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": `${SITE}/#business`,
          name: "RIBALI",
          image: `${SITE}${heroImg}`,
          url: `${SITE}/`,
          telephone: "+30 210 000 0000",
          email: "hello@ribali.gr",
          priceRange: "€€€",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Akti Themistokleous 142",
            addressLocality: "Piraeus",
            postalCode: "18538",
            addressCountry: "GR",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 37.9364,
            longitude: 23.6511,
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "09:00",
              closes: "18:00",
            },
          ],
          areaServed: [
            "Greece",
            "Italy",
            "France",
            "Spain",
            "Croatia",
            "United Arab Emirates",
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main className="relative bg-paper min-h-screen text-ink">
      {mounted && <ThreeBackground />}
      <SectionSnap />
      <div className="relative z-10">
        <Nav />
        <div data-snap><Hero /></div>
        <div data-snap><FeaturedModels /></div>
        <div data-snap><AnatomyRIB /></div>
        <div data-snap><WhyRibali /></div>
        <div data-snap><Experiences /></div>
        <div data-snap><Heritage /></div>
        <div data-snap><Stats /></div>
        <div data-snap><DealersCTA /></div>
        <div data-snap><Footer /></div>
      </div>
    </main>
  );
}
