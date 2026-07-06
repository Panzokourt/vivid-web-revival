import hero from "@/assets/hero.jpg";
import techDetail from "@/assets/tech-detail.jpg";
import modelR680 from "@/assets/model-r680.jpg";
import modelR950 from "@/assets/model-r950.jpg";
import modelR520 from "@/assets/model-r520.jpg";

const assetMap: Record<string, string> = {
  "hero.jpg": hero,
  "tech-detail.jpg": techDetail,
  "model-r680.jpg": modelR680,
  "model-r950.jpg": modelR950,
  "model-r520.jpg": modelR520,
};

/**
 * Resolves a DB-stored image reference (e.g. "/src/assets/model-r680.jpg")
 * to the hashed bundled URL. Unknown values return the placeholder hero.
 */
export function resolveAsset(ref: string | null | undefined): string {
  if (!ref) return hero;
  const file = ref.split("/").pop() ?? "";
  return assetMap[file] ?? hero;
}
