import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Nav } from "@/components/riboli/Nav";
import { Hero } from "@/components/riboli/Hero";
import { Pillars } from "@/components/riboli/Pillars";
import { FeaturedModels } from "@/components/riboli/FeaturedModels";
import { TechConstruction } from "@/components/riboli/TechConstruction";
import { Stats } from "@/components/riboli/Stats";
import { DealersCTA } from "@/components/riboli/DealersCTA";
import { Footer } from "@/components/riboli/Footer";
import { ThreeBackground } from "@/components/riboli/ThreeBackground";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main className="relative bg-brand-navy min-h-screen">
      {mounted && <ThreeBackground />}
      <div className="relative z-10">
        <Nav />
        <Hero />
        <Pillars />
        <FeaturedModels />
        <TechConstruction />
        <Stats />
        <DealersCTA />
        <Footer />
      </div>
    </main>
  );
}
