import { useEffect, useRef, useState } from "react";

export type DealerPin = {
  id: string;
  name: string;
  region: string;
  address: string;
  phone: string;
  email: string;
  lat: number;
  lng: number;
};

declare global {
  interface Window {
    google?: any;
    __ribaliMapInit?: () => void;
    __ribaliMapReady?: Promise<void>;
  }
}

const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#efece5" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#efece5" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#1a1a1a" }, { weight: 0.4 }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#e5e1d6" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#e8e4d8" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#efece5" }] },
];

function loadMapsScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.__ribaliMapReady) return window.__ribaliMapReady;
  if (window.google?.maps) return Promise.resolve();

  window.__ribaliMapReady = new Promise((resolve) => {
    window.__ribaliMapInit = () => resolve();
    const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
    const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__ribaliMapInit&channel=${channel}`;
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  });
  return window.__ribaliMapReady;
}

export function DealersMap({ pins }: { pins: DealerPin[] }) {
  const wrapperEl = useRef<HTMLDivElement>(null);
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const infoRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [active, setActive] = useState<string>(pins[0]?.id ?? "");
  const [ready, setReady] = useState(false);

  // Block page scroll while wheel happens over the whole map+sidebar block.
  // React's onWheel is passive, so we bind a native non-passive listener.
  useEffect(() => {
    const el = wrapperEl.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);


  useEffect(() => {
    let cancelled = false;
    loadMapsScript().then(() => {
      if (cancelled || !mapEl.current || !window.google?.maps) return;
      const g = window.google.maps;
      const map = new g.Map(mapEl.current, {
        center: { lat: 40.5, lng: 15 },
        zoom: 4,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "greedy",
        styles: MAP_STYLE,
        backgroundColor: "#efece5",
      });
      mapRef.current = map;
      infoRef.current = new g.InfoWindow({ disableAutoPan: false });

      pins.forEach((p) => {
        const marker = new g.Marker({
          position: { lat: p.lat, lng: p.lng },
          map,
          title: p.name,
          icon: {
            path: g.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#b87333",
            fillOpacity: 1,
            strokeColor: "#1a1a1a",
            strokeWeight: 2,
          },
        });
        marker.addListener("click", () => focusPin(p.id));
        markersRef.current.push({ id: p.id, marker });
      });

      setReady(true);
      // initial focus
      if (pins[0]) focusPin(pins[0].id, false);
    });
    return () => {
      cancelled = true;
      markersRef.current.forEach(({ marker }) => marker.setMap(null));
      markersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function focusPin(id: string, pan = true) {
    const pin = pins.find((p) => p.id === id);
    if (!pin || !mapRef.current || !window.google?.maps) return;
    setActive(id);
    if (pan) {
      mapRef.current.panTo({ lat: pin.lat, lng: pin.lng });
      mapRef.current.setZoom(8);
    }
    const entry = markersRef.current.find((m) => m.id === id);
    if (entry && infoRef.current) {
      infoRef.current.setContent(
        `<div style="font-family:ui-sans-serif,system-ui;padding:4px 6px;max-width:220px">
          <div style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#b87333;margin-bottom:6px">${pin.region}</div>
          <div style="font-size:15px;font-weight:600;color:#1a1a1a;margin-bottom:4px">${pin.name}</div>
          <div style="font-size:12px;color:#4a4a4a;line-height:1.4">${pin.address}</div>
        </div>`,
      );
      infoRef.current.open({ anchor: entry.marker, map: mapRef.current });
    }
  }

  return (
    <div
      ref={wrapperEl}
      className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 border border-ink/10 bg-paper overflow-hidden overscroll-contain"
    >
      <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[560px] bg-paper-2/40">
        <div ref={mapEl} className="absolute inset-0" />
        {!ready && (
          <div className="absolute inset-0 grid place-items-center text-[10px] uppercase tracking-[0.35em] text-ink/50">
            Loading map…
          </div>
        )}
        <div className="pointer-events-none absolute top-4 left-4 text-[10px] uppercase tracking-[0.35em] text-ink/60 bg-paper/80 px-3 py-2 backdrop-blur-sm">
          {pins.length} authorised locations
        </div>
      </div>

      <aside className="border-t lg:border-t-0 lg:border-l border-ink/10 max-h-[560px] overflow-y-auto">
        <div className="sticky top-0 bg-paper border-b border-ink/10 px-6 py-4 text-[10px] uppercase tracking-[0.35em] text-ink/50">
          Select a dealer
        </div>
        <ul>
          {pins.map((p) => {
            const isActive = p.id === active;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => focusPin(p.id)}
                  className={`w-full text-left px-6 py-5 border-b border-ink/10 transition-colors ${
                    isActive ? "bg-ink text-paper" : "hover:bg-ink/5 text-ink"
                  }`}
                >
                  <div
                    className={`text-[10px] uppercase tracking-[0.3em] mb-1 ${
                      isActive ? "text-copper-soft" : "text-copper"
                    }`}
                  >
                    {p.region}
                  </div>
                  <div className="font-display text-lg leading-tight mb-1">{p.name}</div>
                  <div className={`text-xs leading-relaxed ${isActive ? "text-paper/70" : "text-ink/60"}`}>
                    {p.address}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
