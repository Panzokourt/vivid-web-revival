import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Nav } from "@/components/riboli/Nav";
import { Hero } from "@/components/riboli/Hero";
import { FeaturedModels } from "@/components/riboli/FeaturedModels";
import { TechConstruction } from "@/components/riboli/TechConstruction";
import { Stats } from "@/components/riboli/Stats";
import { DealersCTA } from "@/components/riboli/DealersCTA";
import { Footer } from "@/components/riboli/Footer";
import { ThreeBackground } from "@/components/riboli/ThreeBackground";
import { SectionSnap } from "@/components/riboli/SectionSnap";

export const Route = createFileRoute("/")({
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
        <div data-snap><TechConstruction /></div>
        <div data-snap><Stats /></div>
        <div data-snap><DealersCTA /></div>
        <div data-snap><Footer /></div>
      </div>
    </main>
  );
}

