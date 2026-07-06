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

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main className="relative bg-paper min-h-screen text-ink">
      {mounted && <ThreeBackground />}
      <div className="relative z-10">
        <Nav />
        <Hero />
        <FeaturedModels />
        <TechConstruction />
        <Stats />
        <DealersCTA />
        <Footer />
      </div>
    </main>
  );
}
