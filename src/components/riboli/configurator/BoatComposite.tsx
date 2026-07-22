import { useMemo } from "react";
import type { ModelSlug } from "@/lib/configurator-options";
import { LAYER_MAP } from "@/lib/configurator-layers";

type Props = {
  modelSlug: ModelSlug;
  hullColor: string;
  tubeColor: string;
  canopyColor: string;
  engineHp: number;
  equipment: string[];
  showCanopy?: boolean;
};

/**
 * Layered composite renderer. Stacks images (or SVG fallbacks) in a fixed
 * order. When a layer URL exists in LAYER_MAP, it renders an <img>. Otherwise
 * it renders a procedural SVG silhouette tinted with the current colors.
 */
export function BoatComposite({
  modelSlug,
  hullColor,
  tubeColor,
  canopyColor,
  engineHp,
  equipment,
  showCanopy = true,
}: Props) {
  const map = LAYER_MAP[modelSlug];

  const bg = map.background;
  const hullUrl = map.hull[hullColor.toLowerCase()] ?? null;
  const tubeUrl = map.tubes[tubeColor.toLowerCase()] ?? null;
  const deckUrl = map.deck;
  const engineUrl = map.engine[String(engineHp)] ?? map.engine["default"] ?? null;
  const canopyUrl = showCanopy ? (map.canopy[canopyColor.toLowerCase()] ?? null) : null;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Sea/backdrop */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #f7f4ee 0%, #efe9db 55%, #d8cfba 100%)",
        }}
      />
      {bg && <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover" />}

      {/* Waterline shimmer */}
      <div
        aria-hidden
        className="absolute left-0 right-0"
        style={{
          bottom: "22%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(10,22,40,0.15) 50%, transparent)",
        }}
      />

      {/* Boat composite */}
      <div className="relative z-10 w-[92%] max-w-[1000px] aspect-[16/9]">
        {/* Base hull + tubes + deck (SVG fallback if no PNG) */}
        {hullUrl || tubeUrl || deckUrl ? (
          <>
            {hullUrl && <ImgLayer src={hullUrl} />}
            {tubeUrl && <ImgLayer src={tubeUrl} />}
            {deckUrl && <ImgLayer src={deckUrl} />}
          </>
        ) : (
          <BoatSvgFallback
            hullColor={hullColor}
            tubeColor={tubeColor}
            variant={modelSlug}
          />
        )}

        {/* Engine */}
        {engineUrl ? (
          <ImgLayer src={engineUrl} />
        ) : (
          <EngineSvgFallback hp={engineHp} />
        )}

        {/* Canopy */}
        {showCanopy &&
          (canopyUrl ? (
            <ImgLayer src={canopyUrl} />
          ) : (
            <CanopySvgFallback color={canopyColor} />
          ))}

        {/* Extras — icon markers over the boat */}
        <ExtrasOverlay equipment={equipment} map={map.extras} />
      </div>
    </div>
  );
}

function ImgLayer({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt=""
      className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
      draggable={false}
    />
  );
}

/** Procedural side-view boat silhouette. */
function BoatSvgFallback({
  hullColor,
  tubeColor,
  variant,
}: {
  hullColor: string;
  tubeColor: string;
  variant: ModelSlug;
}) {
  // subtle per-model shape tweaks
  const cfg = useMemo(() => {
    switch (variant) {
      case "r-520":
        return { length: 800, height: 90, bow: 60 };
      case "r-950":
        return { length: 980, height: 110, bow: 90 };
      default:
        return { length: 900, height: 100, bow: 75 };
    }
  }, [variant]);

  const { length: L, height: H, bow: B } = cfg;
  const cx = 500; // center x in viewBox 1000
  const baseY = 340;
  const hullTop = baseY - 8;
  const tubeR = H * 0.35;

  return (
    <svg
      viewBox="0 0 1000 562"
      className="absolute inset-0 w-full h-full transition-[filter] duration-300"
      style={{ filter: "drop-shadow(0 20px 30px rgba(10,22,40,0.18))" }}
    >
      {/* hull */}
      <path
        d={`
          M ${cx - L / 2 + B} ${baseY}
          Q ${cx - L / 2} ${baseY - H * 0.4}, ${cx - L / 2 + B * 0.6} ${hullTop - H * 0.15}
          L ${cx + L / 2 - B * 1.4} ${hullTop - H * 0.15}
          Q ${cx + L / 2} ${hullTop - H * 0.05}, ${cx + L / 2 - B * 0.2} ${baseY + H * 0.15}
          L ${cx - L / 2 + B * 1.1} ${baseY + H * 0.15}
          Z
        `}
        fill={hullColor}
        stroke="rgba(10,22,40,0.25)"
        strokeWidth={1}
      />
      {/* hull highlight */}
      <path
        d={`M ${cx - L / 2 + B * 1.4} ${baseY - 4} L ${cx + L / 2 - B * 1.6} ${baseY - 4}`}
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={2}
        fill="none"
      />
      {/* tubes (long tapered ellipses on the sides) */}
      <path
        d={`
          M ${cx - L / 2 + B * 0.9} ${hullTop - H * 0.15}
          Q ${cx - L / 2 + B * 0.2} ${hullTop - tubeR}, ${cx - L / 2 + B * 1.3} ${hullTop - tubeR}
          L ${cx + L / 2 - B * 1.4} ${hullTop - tubeR}
          Q ${cx + L / 2 - B * 0.4} ${hullTop - tubeR * 0.9}, ${cx + L / 2 - B * 1.2} ${hullTop - H * 0.15}
          Z
        `}
        fill={tubeColor}
        stroke="rgba(10,22,40,0.2)"
        strokeWidth={1}
      />
      {/* tube seams */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={cx - L / 2 + B * 1.3 + (L - B * 2.7) * t}
          y1={hullTop - tubeR * 0.95}
          x2={cx - L / 2 + B * 1.3 + (L - B * 2.7) * t}
          y2={hullTop - H * 0.15}
          stroke="rgba(10,22,40,0.15)"
          strokeWidth={1}
        />
      ))}
      {/* windshield */}
      <path
        d={`
          M ${cx - 40} ${hullTop - tubeR}
          L ${cx - 20} ${hullTop - tubeR - 55}
          L ${cx + 70} ${hullTop - tubeR - 55}
          L ${cx + 90} ${hullTop - tubeR}
          Z
        `}
        fill="rgba(180,200,220,0.6)"
        stroke="rgba(10,22,40,0.3)"
        strokeWidth={1}
      />
      {/* console */}
      <rect
        x={cx - 30}
        y={hullTop - tubeR - 10}
        width={110}
        height={20}
        fill="rgba(10,22,40,0.4)"
        rx={2}
      />
    </svg>
  );
}

function EngineSvgFallback({ hp }: { hp: number }) {
  const size = 40 + Math.min(hp, 350) / 10;
  return (
    <svg viewBox="0 0 1000 562" className="absolute inset-0 w-full h-full">
      <g transform="translate(945, 300)">
        <rect
          x={-16}
          y={-size / 2}
          width={32}
          height={size}
          fill="#1a1a1a"
          rx={4}
        />
        <rect
          x={-12}
          y={-size / 2 + 6}
          width={24}
          height={14}
          fill="#B87A5A"
          rx={2}
        />
        <text
          x={0}
          y={-size / 2 - 4}
          textAnchor="middle"
          fontSize={10}
          fill="rgba(10,22,40,0.5)"
          fontFamily="ui-sans-serif, system-ui"
        >
          {hp} HP
        </text>
      </g>
    </svg>
  );
}

function CanopySvgFallback({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 1000 562" className="absolute inset-0 w-full h-full transition-opacity duration-300">
      <path
        d="M 440 195 Q 500 155, 600 165 L 620 170 L 610 210 L 450 210 Z"
        fill={color}
        opacity={0.85}
        stroke="rgba(10,22,40,0.3)"
        strokeWidth={1}
      />
      {/* poles */}
      <line x1={450} y1={210} x2={445} y2={255} stroke="rgba(10,22,40,0.5)" strokeWidth={1.5} />
      <line x1={610} y1={210} x2={615} y2={255} stroke="rgba(10,22,40,0.5)" strokeWidth={1.5} />
    </svg>
  );
}

const EXTRA_POSITIONS: Record<string, { x: number; y: number; icon: string }> = {
  sunbed: { x: 380, y: 300, icon: "☰" },
  bimini: { x: 520, y: 190, icon: "◠" },
  vhf: { x: 555, y: 250, icon: "📡" },
  gps: { x: 500, y: 260, icon: "▣" },
  "sport-wheel": { x: 465, y: 250, icon: "⊚" },
  "passenger-seat": { x: 605, y: 275, icon: "▤" },
  shower: { x: 700, y: 290, icon: "❦" },
  teak: { x: 750, y: 320, icon: "▬" },
};

function ExtrasOverlay({
  equipment,
  map,
}: {
  equipment: string[];
  map: Record<string, string | null>;
}) {
  return (
    <svg viewBox="0 0 1000 562" className="absolute inset-0 w-full h-full pointer-events-none">
      {equipment.map((id) => {
        const url = map[id];
        if (url) {
          // real render exists for this extra
          return null; // rendered as ImgLayer above (extras layer support TBD in real assets)
        }
        const pos = EXTRA_POSITIONS[id];
        if (!pos) return null;
        return (
          <g key={id} className="animate-in fade-in duration-300">
            <circle
              cx={pos.x}
              cy={pos.y}
              r={11}
              fill="#B87A5A"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth={1.5}
            />
            <text
              x={pos.x}
              y={pos.y + 4}
              textAnchor="middle"
              fontSize={11}
              fill="white"
              fontFamily="ui-sans-serif, system-ui"
            >
              {pos.icon}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
