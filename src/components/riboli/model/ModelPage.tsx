import { useSuspenseQuery } from "@tanstack/react-query";
import { Nav } from "@/components/riboli/Nav";
import { Footer } from "@/components/riboli/Footer";
import { ModelHero } from "@/components/riboli/model/ModelHero";
import { ModelSpecs } from "@/components/riboli/model/ModelSpecs";
import { ModelGallery } from "@/components/riboli/model/ModelGallery";
import { ModelCTA } from "@/components/riboli/model/ModelCTA";
import { ModelRelated } from "@/components/riboli/model/ModelRelated";
import { modelDetailQueryOptions } from "@/lib/models.functions";

export function ModelPage({ slug }: { slug: string }) {
  const { data: model } = useSuspenseQuery(modelDetailQueryOptions(slug));

  return (
    <main className="relative bg-paper min-h-screen text-ink">
      <Nav />
      <ModelHero model={model} />
      <ModelSpecs model={model} />
      <ModelGallery model={model} />
      <ModelCTA model={model} />
      <ModelRelated currentSlug={slug} />
      <Footer />
    </main>
  );
}
