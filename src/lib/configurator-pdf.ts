import jsPDF from "jspdf";
import {
  ENGINE_BRANDS,
  EQUIPMENT,
  FINANCE_TERMS,
  HULL_COLORS,
  MODELS,
  TRAILERS,
  TUBE_COLORS,
  CANOPY_COLORS,
  type EngineBrandId,
  type ModelSlug,
} from "./configurator-options";
import { computeBreakdown, computeMonthlyPayment, formatEUR } from "./configurator-pricing";

function nameOf(list: { hex: string; label: string }[], hex: string) {
  return list.find((c) => c.hex.toLowerCase() === hex.toLowerCase())?.label ?? hex;
}

export function downloadConfigurationPdf(config: {
  modelSlug: ModelSlug;
  hullColor: string;
  tubeColor: string;
  canopyColor: string;
  engineHp: number;
  engineBrand: EngineBrandId;
  equipment: string[];
  trailerId: string;
  financeMonths: number;
  financeDown: number;
}) {
  const model = MODELS.find((m) => m.slug === config.modelSlug)!;
  const brand = ENGINE_BRANDS.find((b) => b.id === config.engineBrand)!;
  const trailer = TRAILERS.find((t) => t.id === config.trailerId);
  const term = FINANCE_TERMS.find((t) => t.months === config.financeMonths);
  const breakdown = computeBreakdown(config);
  const monthly = computeMonthlyPayment(breakdown.total, config.financeMonths, config.financeDown);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  let y = 56;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("RIBALI", 40, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text("Configuration summary", W - 40, y, { align: "right" });
  doc.text(new Date().toLocaleDateString("el-GR"), W - 40, y + 12, { align: "right" });

  y += 40;
  doc.setDrawColor(220);
  doc.line(40, y, W - 40, y);
  y += 28;

  // Model block
  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(`${model.code} · ${model.name}`, 40, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`${model.length.toFixed(2)} m × ${model.beam.toFixed(2)} m beam`, 40, y);
  y += 26;

  // Specs table
  const rows: [string, string][] = [
    ["Engine", `${brand.label} · ${config.engineHp} HP`],
    ["Hull color", nameOf(HULL_COLORS, config.hullColor)],
    ["Tube color", nameOf(TUBE_COLORS, config.tubeColor)],
    ["Canopy color", nameOf(CANOPY_COLORS, config.canopyColor)],
    ["Trailer", trailer?.label ?? "—"],
    ["Extras", `${config.equipment.length} selected`],
  ];
  doc.setFontSize(10);
  rows.forEach(([k, v]) => {
    doc.setTextColor(140);
    doc.text(k.toUpperCase(), 40, y);
    doc.setTextColor(20);
    doc.text(v, 200, y);
    y += 16;
  });

  // Extras list
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20);
  doc.text("Selected extras", 40, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const chosen = EQUIPMENT.filter((e) => config.equipment.includes(e.id));
  if (chosen.length === 0) {
    doc.setTextColor(140);
    doc.text("None", 40, y);
    y += 14;
  } else {
    chosen.forEach((e) => {
      doc.setTextColor(60);
      doc.text(`• ${e.label}`, 44, y);
      doc.setTextColor(120);
      doc.text(formatEUR(e.price), W - 40, y, { align: "right" });
      y += 14;
    });
  }

  // Price breakdown
  y += 14;
  doc.setDrawColor(220);
  doc.line(40, y, W - 40, y);
  y += 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20);
  doc.text("Price breakdown", 40, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  breakdown.lines.forEach((l) => {
    doc.setTextColor(80);
    doc.text(l.label, 40, y);
    doc.text(formatEUR(l.amount), W - 40, y, { align: "right" });
    y += 14;
  });
  y += 6;
  doc.setDrawColor(230);
  doc.line(40, y, W - 40, y);
  y += 14;
  doc.setTextColor(120);
  doc.text("Subtotal", 40, y);
  doc.text(formatEUR(breakdown.subtotal), W - 40, y, { align: "right" });
  y += 14;
  doc.text("VAT (24%)", 40, y);
  doc.text(formatEUR(breakdown.vat), W - 40, y, { align: "right" });
  y += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20);
  doc.text("Total", 40, y);
  doc.text(formatEUR(breakdown.total), W - 40, y, { align: "right" });
  y += 26;

  // Financing
  if (config.financeMonths > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Financing (indicative)", 40, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(
      `${term?.label ?? config.financeMonths + " months"} · APR ${term?.apr ?? 0}% · Down ${formatEUR(config.financeDown)}`,
      40,
      y,
    );
    y += 14;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20);
    doc.text(`${formatEUR(monthly)} / month`, 40, y);
    y += 20;
  }

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140);
  doc.text(
    "Indicative pricing — final quotation confirmed by RIBALI after review. VAT applied per Greek regulation.",
    40,
    doc.internal.pageSize.getHeight() - 32,
  );

  doc.save(`RIBALI-${model.code}-${Date.now()}.pdf`);
}
