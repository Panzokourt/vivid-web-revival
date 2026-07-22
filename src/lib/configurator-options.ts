export type ColorSwatch = { id: string; label: string; hex: string };

export const HULL_COLORS: ColorSwatch[] = [
  { id: "midnight", label: "Midnight", hex: "#0A1628" },
  { id: "graphite", label: "Graphite", hex: "#3A3A3A" },
  { id: "oyster", label: "Oyster", hex: "#E8E2D5" },
  { id: "moss", label: "Moss", hex: "#4A5D3A" },
  { id: "sand", label: "Sand", hex: "#C8B591" },
  { id: "terracotta", label: "Terracotta", hex: "#B87A5A" },
  { id: "bordeaux", label: "Bordeaux", hex: "#5A1F26" },
  { id: "onyx", label: "Onyx", hex: "#111111" },
];

export const TUBE_COLORS: ColorSwatch[] = [
  { id: "grey", label: "Grey", hex: "#808080" },
  { id: "black", label: "Black", hex: "#1A1A1A" },
  { id: "white", label: "White", hex: "#EDEAE4" },
  { id: "sand", label: "Sand", hex: "#C8B591" },
  { id: "navy", label: "Navy", hex: "#0A1628" },
  { id: "copper", label: "Copper", hex: "#B87A5A" },
];

export const CANOPY_COLORS: ColorSwatch[] = [
  { id: "charcoal", label: "Charcoal", hex: "#2B2B2B" },
  { id: "cream", label: "Cream", hex: "#E8E2D5" },
  { id: "navy", label: "Navy", hex: "#0A1628" },
  { id: "olive", label: "Olive", hex: "#4A5D3A" },
];

export type ModelSlug = "r-520" | "r-680" | "r-950";

export type ModelSpec = {
  slug: ModelSlug;
  code: string;
  name: string;
  length: number;
  beam: number;
  engines: number[];
  scale: number;
  basePrice: number;
};

export const MODELS: ModelSpec[] = [
  { slug: "r-520", code: "R-520", name: "Cinque due zero", length: 5.2, beam: 2.2, engines: [90, 115, 150], scale: 0.85, basePrice: 28000 },
  { slug: "r-680", code: "R-680", name: "Sei otto zero", length: 6.8, beam: 2.55, engines: [150, 200, 250], scale: 1.0, basePrice: 58000 },
  { slug: "r-950", code: "R-950", name: "Nove cinque zero", length: 9.5, beam: 3.1, engines: [250, 300, 350], scale: 1.2, basePrice: 125000 },
];

export type EngineBrandId = "yamaha" | "suzuki" | "mercury";

export const ENGINE_BRANDS: { id: EngineBrandId; label: string; multiplier: number }[] = [
  { id: "yamaha", label: "Yamaha", multiplier: 1.0 },
  { id: "suzuki", label: "Suzuki", multiplier: 0.95 },
  { id: "mercury", label: "Mercury", multiplier: 1.05 },
];

// Base engine price per HP tier (before brand multiplier).
export const ENGINE_BASE_PRICES: Record<number, number> = {
  90: 12500,
  115: 14800,
  150: 18500,
  200: 24000,
  250: 29500,
  300: 34000,
  350: 39500,
};

export type ExtraCategory = "comfort" | "electronics" | "safety" | "finish";

export type EquipmentItem = {
  id: string;
  label: string;
  note: string;
  price: number;
  category: ExtraCategory;
};

export const EQUIPMENT: EquipmentItem[] = [
  { id: "sunbed", label: "Bow Sunbed", note: "Teak-framed cushioning", price: 1450, category: "comfort" },
  { id: "bimini", label: "Bimini Top", note: "UV-resistant canvas", price: 890, category: "comfort" },
  { id: "passenger-seat", label: "Passenger Seat", note: "Bolstered co-pilot", price: 780, category: "comfort" },
  { id: "shower", label: "Freshwater Shower", note: "Deck-mounted mixer", price: 520, category: "comfort" },
  { id: "fridge", label: "Cockpit Fridge", note: "12V drawer unit", price: 990, category: "comfort" },
  { id: "audio", label: "Marine Audio", note: "Fusion 4-speaker + amp", price: 1250, category: "comfort" },

  { id: "vhf", label: "VHF Radio", note: "Fixed marine unit", price: 480, category: "electronics" },
  { id: "gps", label: "GPS Plotter", note: '9" multi-touch display', price: 1980, category: "electronics" },
  { id: "autopilot", label: "Autopilot", note: "Raymarine Evolution", price: 3200, category: "electronics" },
  { id: "camera", label: "Bow Thruster Cam", note: "HD deck monitor", price: 720, category: "electronics" },

  { id: "liferaft", label: "Life Raft", note: "6-person ISO valise", price: 1650, category: "safety" },
  { id: "epirb", label: "EPIRB Beacon", note: "GPS-enabled distress", price: 480, category: "safety" },
  { id: "fire", label: "Fire Suppression", note: "Engine bay auto system", price: 890, category: "safety" },

  { id: "sport-wheel", label: "Sport Steering", note: "Leather-wrapped wheel", price: 640, category: "finish" },
  { id: "teak", label: "Teak Deck", note: "Hand-laid planking", price: 4800, category: "finish" },
  { id: "chrome", label: "Chrome Fittings", note: "316 marine-grade", price: 1100, category: "finish" },
];

export type Trailer = {
  id: string;
  label: string;
  note: string;
  price: number;
  fitsUpTo: number; // meters
};

export const TRAILERS: Trailer[] = [
  { id: "none", label: "No trailer", note: "Marina-berthed", price: 0, fitsUpTo: 99 },
  { id: "single-axle", label: "Single-axle Trailer", note: "Galvanized, up to 6 m", price: 3200, fitsUpTo: 6 },
  { id: "twin-axle", label: "Twin-axle Trailer", note: "Galvanized, up to 8 m", price: 5400, fitsUpTo: 8 },
  { id: "hydraulic", label: "Hydraulic Trailer", note: "Braked, up to 10 m", price: 9800, fitsUpTo: 10 },
];

// Financing presets — annual percentage rate applied per term.
export const FINANCE_TERMS: { months: number; apr: number; label: string }[] = [
  { months: 0, apr: 0, label: "Pay in full" },
  { months: 24, apr: 4.9, label: "24 months" },
  { months: 36, apr: 5.4, label: "36 months" },
  { months: 60, apr: 5.9, label: "60 months" },
  { months: 84, apr: 6.4, label: "84 months" },
];

export const EQUIPMENT_IDS = EQUIPMENT.map((e) => e.id);
export const MODEL_SLUGS: ModelSlug[] = MODELS.map((m) => m.slug);
export const ALL_ENGINE_HPS = Array.from(new Set(MODELS.flatMap((m) => m.engines)));
export const ENGINE_BRAND_IDS = ENGINE_BRANDS.map((b) => b.id);
export const TRAILER_IDS = TRAILERS.map((t) => t.id);
export const FINANCE_MONTHS = FINANCE_TERMS.map((t) => t.months);

export const EXTRA_CATEGORY_LABELS: Record<ExtraCategory, string> = {
  comfort: "Comfort",
  electronics: "Electronics",
  safety: "Safety",
  finish: "Finish",
};
