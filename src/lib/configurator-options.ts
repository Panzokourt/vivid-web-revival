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

export const MODELS: {
  slug: ModelSlug;
  code: string;
  name: string;
  length: number;
  beam: number;
  engines: number[];
  scale: number;
}[] = [
  { slug: "r-520", code: "R-520", name: "Cinque due zero", length: 5.2, beam: 2.2, engines: [90, 115, 150], scale: 0.85 },
  { slug: "r-680", code: "R-680", name: "Sei otto zero", length: 6.8, beam: 2.55, engines: [150, 200, 250], scale: 1.0 },
  { slug: "r-950", code: "R-950", name: "Nove cinque zero", length: 9.5, beam: 3.1, engines: [250, 300, 350], scale: 1.2 },
];

export type EquipmentItem = { id: string; label: string; note: string };

export const EQUIPMENT: EquipmentItem[] = [
  { id: "sunbed", label: "Bow Sunbed", note: "Teak-framed cushioning" },
  { id: "bimini", label: "Bimini Top", note: "UV-resistant canvas" },
  { id: "vhf", label: "VHF Radio", note: "Fixed marine unit" },
  { id: "gps", label: "GPS Plotter", note: "9\" multi-touch display" },
  { id: "sport-wheel", label: "Sport Steering", note: "Leather-wrapped wheel" },
  { id: "passenger-seat", label: "Passenger Seat", note: "Bolstered co-pilot" },
  { id: "shower", label: "Freshwater Shower", note: "Deck-mounted mixer" },
  { id: "teak", label: "Teak Deck", note: "Hand-laid planking" },
];

export const EQUIPMENT_IDS = EQUIPMENT.map((e) => e.id);
export const MODEL_SLUGS: ModelSlug[] = MODELS.map((m) => m.slug);
export const ALL_ENGINE_HPS = Array.from(new Set(MODELS.flatMap((m) => m.engines)));
