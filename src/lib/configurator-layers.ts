/**
 * Layered image data map for the configurator.
 *
 * Each model has a stack of image layers (background, hull, tubes, deck, extras,
 * engine, canopy). Colors/extras swap the corresponding layer's URL.
 *
 * TODAY: URLs are `null` because the real photo renders don't exist yet — the
 * <BoatComposite /> component falls back to a procedural SVG silhouette that
 * accepts hull/tube/canopy colors as CSS fills. When the client provides real
 * PNGs, drop them into `media/configurator/<model>/<layer>-<variant>.png` and
 * point the URLs here — no component code changes needed.
 */
import type { ModelSlug } from "./configurator-options";

export type LayerKind =
  | "background"
  | "hull"
  | "tubes"
  | "deck"
  | "extra"
  | "engine"
  | "canopy";

export type LayerRef = string | null; // URL to PNG, or null → SVG fallback

export type ModelLayerMap = {
  background: LayerRef;
  hull: Record<string, LayerRef>; // key = hull color hex (lower-case)
  tubes: Record<string, LayerRef>; // key = tube color hex
  deck: LayerRef;
  extras: Record<string, LayerRef>; // key = equipment id
  engine: Record<string, LayerRef>; // key = engine HP as string, or "none"
  canopy: Record<string, LayerRef | null>; // key = canopy color hex, "none" = no canopy
};

/**
 * Placeholder map — all URLs null → SVG fallback renders.
 * Replace individual entries with real render URLs as they become available.
 */
export const LAYER_MAP: Record<ModelSlug, ModelLayerMap> = {
  "r-520": {
    background: null,
    hull: {},
    tubes: {},
    deck: null,
    extras: {},
    engine: {},
    canopy: {},
  },
  "r-680": {
    background: null,
    hull: {},
    tubes: {},
    deck: null,
    extras: {},
    engine: {},
    canopy: {},
  },
  "r-950": {
    background: null,
    hull: {},
    tubes: {},
    deck: null,
    extras: {},
    engine: {},
    canopy: {},
  },
};

/** Standard aspect ratio for the composite canvas (16:9 side view). */
export const COMPOSITE_ASPECT = 16 / 9;
