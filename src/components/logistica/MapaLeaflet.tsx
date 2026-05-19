'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';

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
}: MapaLeafletProps) {
  useLeafletCSS();

  const containerRef = useRef<HTMLDivElement>(null);

  const centerLatLng: LatLngExpression = [center.lat, center.lng];

  return (
    <div ref={containerRef} style={{ height, width: '100%' }} className={className}>
      <MapContainer
        center={centerLatLng}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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
    </div>
  );
}
