import {
  ENGINE_BASE_PRICES,
  ENGINE_BRANDS,
  EQUIPMENT,
  FINANCE_TERMS,
  MODELS,
  TRAILERS,
  type EngineBrandId,
  type ModelSlug,
} from "./configurator-options";

export type PriceLine = { label: string; amount: number };

export type PriceBreakdown = {
  lines: PriceLine[];
  subtotal: number;
  vat: number;
  total: number;
};

export function computeBreakdown(input: {
  modelSlug: ModelSlug;
  engineHp: number;
  engineBrand: EngineBrandId;
  equipment: string[];
  trailerId: string;
  vatRate?: number; // default 0.24 (GR)
}): PriceBreakdown {
  const model = MODELS.find((m) => m.slug === input.modelSlug)!;
  const brand = ENGINE_BRANDS.find((b) => b.id === input.engineBrand) ?? ENGINE_BRANDS[0];
  const engineBase = ENGINE_BASE_PRICES[input.engineHp] ?? 0;
  const enginePrice = Math.round(engineBase * brand.multiplier);
  const extras = EQUIPMENT.filter((e) => input.equipment.includes(e.id));
  const trailer = TRAILERS.find((t) => t.id === input.trailerId);

  const lines: PriceLine[] = [
    { label: `${model.code} · base`, amount: model.basePrice },
    { label: `${brand.label} ${input.engineHp} HP`, amount: enginePrice },
    ...extras.map((e) => ({ label: e.label, amount: e.price })),
  ];
  if (trailer && trailer.price > 0) {
    lines.push({ label: trailer.label, amount: trailer.price });
  }

  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const vatRate = input.vatRate ?? 0.24;
  const vat = Math.round(subtotal * vatRate);
  const total = subtotal + vat;

  return { lines, subtotal, vat, total };
}

export function computeMonthlyPayment(
  total: number,
  months: number,
  downPayment: number,
  apr?: number,
): number {
  if (months <= 0) return 0;
  const principal = Math.max(0, total - downPayment);
  const term = FINANCE_TERMS.find((t) => t.months === months);
  const rate = ((apr ?? term?.apr ?? 0) / 100) / 12;
  if (rate === 0) return Math.round(principal / months);
  const factor = (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
  return Math.round(principal * factor);
}

export function formatEUR(n: number): string {
  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}
