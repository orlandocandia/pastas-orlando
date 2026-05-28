'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngExpression, LatLng } from 'leaflet';
import CapasControl, { useCapaMapa, type CapaKey } from '@/components/ui/CapasControl';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SelectorUbicacionProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPosition?: { lat: number; lng: number };
  height?: string;
  /** Initial map layer */
  capaInicial?: CapaKey;
  /** Show layer selector control */
  mostrarCapas?: boolean;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_CENTER: { lat: number; lng: number } = {
  lat: -27.451,
  lng: -58.986,
};

// ---------------------------------------------------------------------------
// Leaflet CSS injection (once)
// ---------------------------------------------------------------------------

let cssInjected = false;

function useLeafletCSS() {
  useEffect(() => {
    if (cssInjected) return;
    if (typeof document === 'undefined') return;

    const id = 'leaflet-css-selector';
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
// Custom pin icon (red)
// ---------------------------------------------------------------------------

const selectorIcon = L.divIcon({
  html: `
    <svg width="32" height="44" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="#ef4444"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
    </svg>`,
  className: '',
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -44],
});

// ---------------------------------------------------------------------------
// Click handler component
// ---------------------------------------------------------------------------

function MapClickHandler({
  onClick,
}: {
  onClick: (latlng: LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

// ---------------------------------------------------------------------------
// Draggable marker component
// ---------------------------------------------------------------------------

function DraggableMarker({
  position,
  onDragEnd,
}: {
  position: LatLngExpression;
  onDragEnd: (latlng: LatLng) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  const handleDragEnd = useCallback(() => {
    const marker = markerRef.current;
    if (marker != null) {
      onDragEnd(marker.getLatLng());
    }
  }, [onDragEnd]);

  return (
    <Marker
      draggable
      position={position}
      icon={selectorIcon}
      ref={markerRef}
      eventHandlers={{ dragend: handleDragEnd }}
    >
      <Popup>Arrastrame o haz clic en el mapa</Popup>
    </Marker>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SelectorUbicacion({
  onLocationSelect,
  initialPosition,
  height = '400px',
  capaInicial = 'calle',
  mostrarCapas = true,
}: SelectorUbicacionProps) {
  useLeafletCSS();
  const { capaActiva, setCapaActiva, capaUrl, capaAttribution } = useCapaMapa(capaInicial);

  const start = initialPosition ?? DEFAULT_CENTER;
  const [position, setPosition] = useState<[number, number]>([start.lat, start.lng]);

  const handleMapClick = useCallback(
    (latlng: LatLng) => {
      setPosition([latlng.lat, latlng.lng]);
      onLocationSelect(latlng.lat, latlng.lng);
    },
    [onLocationSelect],
  );

  const handleDragEnd = useCallback(
    (latlng: LatLng) => {
      setPosition([latlng.lat, latlng.lng]);
      onLocationSelect(latlng.lat, latlng.lng);
    },
    [onLocationSelect],
  );

  return (
    <div className="w-full">
      <div style={{ height, width: '100%' }} className="relative">
        <MapContainer
          center={[start.lat, start.lng]}
          zoom={14}
          style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
          scrollWheelZoom
        >
          <TileLayer
            key={capaActiva}
            attribution={capaAttribution}
            url={capaUrl}
          />
          <MapClickHandler onClick={handleMapClick} />
          <DraggableMarker position={position} onDragEnd={handleDragEnd} />
        </MapContainer>

        {mostrarCapas && (
          <CapasControl capaActiva={capaActiva} onCapaChange={setCapaActiva} />
        )}
      </div>

      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">Coordenadas:</span>
        <span>
          Lat {position[0].toFixed(6)}, Lng {position[1].toFixed(6)}
        </span>
      </div>
    </div>
  );
}
