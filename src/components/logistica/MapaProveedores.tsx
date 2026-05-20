'use client';

import { useMemo } from 'react';
import MapaLeaflet, { type MapMarker } from './MapaLeaflet';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProveedorMapData {
  id: number | string;
  lat: number;
  lng: number;
  nombre: string;
  razon_social?: string;
  direccion?: string;
  telefonos?: string[];
}

export interface MapaProveedoresProps {
  proveedores: ProveedorMapData[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  /** When set, the marker for this supplier will be highlighted */
  highlightedId?: number | string | null;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_CENTER = { lat: -27.451, lng: -58.986 };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MapaProveedores({
  proveedores,
  center = DEFAULT_CENTER,
  zoom = 13,
  height = '400px',
  highlightedId,
}: MapaProveedoresProps) {
  const markers: MapMarker[] = useMemo(() => {
    return proveedores
      .filter((p) => p.lat !== 0 && p.lng !== 0)
      .map((p) => {
        const displayName = p.razon_social || p.nombre;
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
        const isHighlighted = highlightedId !== undefined && highlightedId !== null && p.id === highlightedId;

        const telefonosStr = Array.isArray(p.telefonos)
          ? p.telefonos.join(', ')
          : (p.telefonos || '');

        const popupHtml = `
          <div style="min-width:200px;font-family:system-ui,sans-serif;font-size:13px;line-height:1.5">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${displayName}</div>
            ${p.razon_social && p.razon_social !== p.nombre ? `<div style="color:#6b7280;font-size:12px">(${p.nombre})</div>` : ''}
            ${p.direccion ? `<div style="margin-top:4px;color:#374151"><strong>Dirección:</strong> ${p.direccion}</div>` : ''}
            ${telefonosStr ? `<div style="color:#374151"><strong>Teléfono:</strong> ${telefonosStr}</div>` : ''}
            <a
              href="${directionsUrl}"
              target="_blank"
              rel="noopener noreferrer"
              style="display:inline-flex;align-items:center;gap:4px;margin-top:8px;padding:6px 12px;border-radius:6px;background:#3b82f6;color:#fff;font-weight:600;font-size:12px;text-decoration:none"
            >
              📍 Cómo llegar
            </a>
          </div>`;

        return {
          lat: p.lat,
          lng: p.lng,
          popup: popupHtml,
          color: isHighlighted ? ('yellow' as const) : ('blue' as const),
        };
      });
  }, [proveedores, highlightedId]);

  // Compute flyTo target from highlightedId
  const flyToTarget = useMemo(() => {
    if (highlightedId === undefined || highlightedId === null) return null;
    const highlighted = proveedores.find((p) => p.id === highlightedId);
    if (!highlighted || highlighted.lat === 0 || highlighted.lng === 0) return null;
    return { lat: highlighted.lat, lng: highlighted.lng };
  }, [proveedores, highlightedId]);

  return (
    <div className="w-full">
      <MapaLeaflet
        center={center}
        zoom={zoom}
        markers={markers}
        height={height}
        flyToMarker={flyToTarget}
      />

      {/* Supplier count */}
      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <span
          className="inline-block h-3 w-3 rounded-full"
          style={{ backgroundColor: '#3b82f6' }}
        />
        <span>
          Proveedores en mapa: <strong>{markers.length}</strong>
        </span>
      </div>
    </div>
  );
}
