'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import CapasControl, { useCapaMapa, type CapaKey } from '@/components/ui/CapasControl';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MapMarker {
  lat: number;
  lng: number;
  popup?: string;
  color?: 'red' | 'yellow' | 'green' | 'blue';
}

export interface MapaLeafletProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  onMarkerClick?: (marker: MapMarker, index: number) => void;
  height?: string;
  className?: string;
  /** When set, the map will fly to these coordinates */
  flyToMarker?: { lat: number; lng: number } | null;
  /** Initial map layer */
  capaInicial?: CapaKey;
  /** Show layer selector control */
  mostrarCapas?: boolean;
}

// ---------------------------------------------------------------------------
// Default center: Resistencia, Chaco, Argentina
// ---------------------------------------------------------------------------

const DEFAULT_CENTER: { lat: number; lng: number } = {
  lat: -27.451,
  lng: -58.986,
};
const DEFAULT_ZOOM = 13;

// ---------------------------------------------------------------------------
// Leaflet CSS injection (once)
// ---------------------------------------------------------------------------

let cssInjected = false;

function useLeafletCSS() {
  useEffect(() => {
    if (cssInjected) return;
    if (typeof document === 'undefined') return;

    const id = 'leaflet-css';
    if (document.getElementById(id)) {
      cssInjected = true;
      return;
    }

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity =
      'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);
    cssInjected = true;
  }, []);
}

// ---------------------------------------------------------------------------
// Custom coloured marker via L.divIcon
// ---------------------------------------------------------------------------

const COLOR_MAP: Record<string, string> = {
  red: '#ef4444',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
};

function createColoredIcon(color: string = 'blue'): L.DivIcon {
  const fill = COLOR_MAP[color] ?? COLOR_MAP.blue;

  const html = `
    <svg width="28" height="40" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="${fill}"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
    </svg>`;

  return L.divIcon({
    html,
    className: '', // remove default leaflet-div-icon styling
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -40],
  });
}

// ---------------------------------------------------------------------------
// FitBounds helper – auto-zooms to show all markers
// ---------------------------------------------------------------------------

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) return;
    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], DEFAULT_ZOOM);
      return;
    }
    const bounds = L.latLngBounds(
      markers.map((m) => [m.lat, m.lng] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [markers, map]);

  return null;
}

// ---------------------------------------------------------------------------
// FlyToMarker helper – smoothly pans to a specific marker
// ---------------------------------------------------------------------------

function FlyToMarker({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], 15, { duration: 0.8 });
  }, [target, map]);

  return null;
}

// ---------------------------------------------------------------------------
// TileErrorHandler – detects tile load errors and activates fallback
// ---------------------------------------------------------------------------

function TileErrorHandler({
  onTileError,
}: {
  onTileError: () => void;
}) {
  const map = useMap();
  const errorCountRef = useRef(0);
  const triggeredRef = useRef(false);

  useEffect(() => {
    // Reset state when effect re-runs
    errorCountRef.current = 0;
    triggeredRef.current = false;

    const handleTileError = () => {
      if (triggeredRef.current) return;
      errorCountRef.current += 1;
      // Activate fallback after 3 tile errors (not just 1 fluke)
      if (errorCountRef.current >= 3) {
        triggeredRef.current = true;
        onTileError();
      }
    };

    map.on('tileerror', handleTileError);
    return () => {
      map.off('tileerror', handleTileError);
    };
  }, [map, onTileError]);

  return null;
}

// ---------------------------------------------------------------------------
// MapaLeaflet component
// ---------------------------------------------------------------------------

export default function MapaLeaflet({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  markers = [],
  onMarkerClick,
  height = '400px',
  className = '',
  flyToMarker,
  capaInicial = 'calle',
  mostrarCapas = true,
}: MapaLeafletProps) {
  useLeafletCSS();
  const { capaActiva, setCapaActiva, capaUrl, capaAttribution, usandoFallback, activarFallback } = useCapaMapa(capaInicial);
  const containerRef = useRef<HTMLDivElement>(null);

  const layerKey = `${capaActiva}-${usandoFallback}`;
  const [tileStatus, setTileStatus] = useState<{ layerKey: string; status: 'loading' | 'loaded' | 'error' }>({
    layerKey,
    status: 'loading',
  });

  // Reset tile status when layer changes (React-recommended pattern for deriving state)
  if (tileStatus.layerKey !== layerKey) {
    setTileStatus({ layerKey, status: 'loading' });
  }

  const tilesLoaded = tileStatus.status === 'loaded';
  const tileError = tileStatus.status === 'error';

  const centerLatLng: LatLngExpression = [center.lat, center.lng];

  const handleTileError = useCallback(() => {
    if (!usandoFallback) {
      activarFallback();
    } else {
      setTileStatus((prev) => prev.layerKey === layerKey ? { ...prev, status: 'error' } : prev);
    }
  }, [usandoFallback, activarFallback, layerKey]);

  return (
    <div ref={containerRef} style={{ height, width: '100%' }} className={`relative ${className}`}>
      <MapContainer
        center={centerLatLng}
        zoom={zoom}
        maxZoom={18}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        scrollWheelZoom
      >
        <TileLayer
          key={`${capaActiva}-${usandoFallback}`}
          attribution={capaAttribution}
          url={capaUrl}
          eventHandlers={{
            load: () => setTileStatus((prev) => prev.layerKey === layerKey ? { ...prev, status: 'loaded' } : prev),
            tileerror: handleTileError,
          }}
        />

        <TileErrorHandler onTileError={handleTileError} />

        <FitBounds markers={markers} />
        <FlyToMarker target={flyToMarker ?? null} />

        {markers.map((m, idx) => (
          <Marker
            key={`${m.lat}-${m.lng}-${idx}`}
            position={[m.lat, m.lng]}
            icon={createColoredIcon(m.color)}
            eventHandlers={
              onMarkerClick
                ? {
                    click: () => onMarkerClick(m, idx),
                  }
                : undefined
            }
          >
            {m.popup && <Popup>{m.popup}</Popup>}
          </Marker>
        ))}
      </MapContainer>

      {/* Loading overlay */}
      {!tilesLoaded && !tileError && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center bg-crema/80 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-mostaza border-t-transparent" />
            <span className="text-sm text-marron font-medium">Cargando mapa...</span>
          </div>
        </div>
      )}

      {/* Error overlay - still shows map but with warning */}
      {tileError && (
        <div className="absolute bottom-2 left-2 z-[999] flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 shadow-md px-3 py-2">
          <span className="text-amber-600 text-sm">⚠️</span>
          <span className="text-xs text-amber-800">
            Error al cargar tiles del mapa. Intentá cambiar de capa.
          </span>
        </div>
      )}

      {mostrarCapas && (
        <CapasControl capaActiva={capaActiva} onCapaChange={setCapaActiva} usandoFallback={usandoFallback} />
      )}
    </div>
  );
}
