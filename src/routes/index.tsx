import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/riboli/Nav";
import { Hero } from "@/components/riboli/Hero";
import { Pillars } from "@/components/riboli/Pillars";
import { FeaturedModels } from "@/components/riboli/FeaturedModels";
import { TechConstruction } from "@/components/riboli/TechConstruction";
import { Stats } from "@/components/riboli/Stats";
import { DealersCTA } from "@/components/riboli/DealersCTA";
import { Footer } from "@/components/riboli/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="bg-brand-navy min-h-screen">
      <Nav />
      <Hero />
      <Pillars />
      <FeaturedModels />
      <TechConstruction />
      <Stats />
      <DealersCTA />
      <Footer />
    </main>
  );
}
