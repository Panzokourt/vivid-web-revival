import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Nav } from "@/components/ribali/Nav";
import { Hero } from "@/components/ribali/Hero";
import { FeaturedModels } from "@/components/ribali/FeaturedModels";
import { TechConstruction } from "@/components/ribali/TechConstruction";
import { Stats } from "@/components/ribali/Stats";
import { DealersCTA } from "@/components/ribali/DealersCTA";
import { Footer } from "@/components/ribali/Footer";
import { ThreeBackground } from "@/components/ribali/ThreeBackground";

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
