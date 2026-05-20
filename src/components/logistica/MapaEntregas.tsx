'use client';

import { useMemo, useEffect, useCallback } from 'react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import MapaLeaflet, { type MapMarker } from './MapaLeaflet';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EntregaMapData {
  id: number | string;
  lat: number;
  lng: number;
  cliente_nombre: string;
  estado: string;
  fecha_programada: string; // ISO date string
  pedido_numero?: string;
  direccion?: string;
}

export interface MapaEntregasProps {
  entregas: EntregaMapData[];
  onMarcarEntregado?: (entregaId: number | string) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_CENTER = { lat: -27.451, lng: -58.986 };

/**
 * Determine marker colour based on scheduled date:
 *  - red   → today
 *  - yellow → tomorrow
 *  - green  → any other date
 */
function getMarkerColor(fecha: string): 'red' | 'yellow' | 'green' {
  try {
    const date = parseISO(fecha);
    if (isToday(date)) return 'red';
    if (isTomorrow(date)) return 'yellow';
    return 'green';
  } catch {
    return 'green';
  }
}

function formatDateLabel(fecha: string): string {
  try {
    const date = parseISO(fecha);
    if (isToday(date)) return 'Hoy';
    if (isTomorrow(date)) return 'Mañana';
    return format(date, "EEEE d 'de' MMMM", { locale: es });
  } catch {
    return fecha;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MapaEntregas({
  entregas,
  onMarcarEntregado,
  center = DEFAULT_CENTER,
  zoom = 13,
  height = '400px',
}: MapaEntregasProps) {
  // Build popups for each entrega that has valid coords
  const markers: MapMarker[] = useMemo(() => {
    return entregas
      .filter((e) => e.lat !== 0 && e.lng !== 0)
      .map((e) => {
        const color = getMarkerColor(e.fecha_programada);
        const dateLabel = formatDateLabel(e.fecha_programada);
        const formattedDate = format(parseISO(e.fecha_programada), 'dd/MM/yyyy');

        const popupHtml = `
          <div style="min-width:180px;font-family:system-ui,sans-serif;font-size:13px;line-height:1.5">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${e.cliente_nombre}</div>
            ${e.direccion ? `<div style="color:#6b7280">${e.direccion}</div>` : ''}
            <div style="margin-top:6px">
              <span style="display:inline-block;padding:1px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:${color === 'red' ? '#fecaca' : color === 'yellow' ? '#fef08a' : '#bbf7d0'};color:${color === 'red' ? '#991b1b' : color === 'yellow' ? '#854d0e' : '#166534'}">${dateLabel}</span>
            </div>
            <div style="margin-top:4px;color:#374151"><strong>Estado:</strong> ${e.estado}</div>
            <div style="color:#6b7280"><strong>Fecha:</strong> ${formattedDate}</div>
            ${e.pedido_numero ? `<div style="color:#6b7280"><strong>Pedido #:</strong> ${e.pedido_numero}</div>` : ''}
            <button
              data-entrega-id="${e.id}"
              class="marcar-entregado-btn"
              style="margin-top:8px;width:100%;padding:6px 12px;border-radius:6px;border:none;background:#16a34a;color:#fff;font-weight:600;font-size:12px;cursor:pointer"
            >
              ✓ Marcar entregado
            </button>
          </div>`;

        return {
          lat: e.lat,
          lng: e.lng,
          popup: popupHtml,
          color,
        };
      });
  }, [entregas]);

  // Set up event delegation for "Marcar entregado" buttons inside popups
  // (Leaflet popups render outside React's virtual DOM, so we need DOM-level event handling)
  const handleClick = useCallback(
    (ev: MouseEvent) => {
      const target = (ev.target as HTMLElement).closest(
        '.marcar-entregado-btn',
      ) as HTMLElement | null;
      if (target && onMarcarEntregado) {
        const entregaId = target.dataset.entregaId;
        if (entregaId) {
          onMarcarEntregado(
            isNaN(Number(entregaId)) ? entregaId : Number(entregaId),
          );
        }
      }
    },
    [onMarcarEntregado],
  );

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [handleClick]);

  // Legend counts
  const hoyCount = entregas.filter(
    (e) => e.lat !== 0 && e.lng !== 0 && isToday(parseISO(e.fecha_programada)),
  ).length;
  const mananaCount = entregas.filter(
    (e) =>
      e.lat !== 0 && e.lng !== 0 && isTomorrow(parseISO(e.fecha_programada)),
  ).length;
  const restoCount = entregas.filter(
    (e) =>
      e.lat !== 0 &&
      e.lng !== 0 &&
      !isToday(parseISO(e.fecha_programada)) &&
      !isTomorrow(parseISO(e.fecha_programada)),
  ).length;

  return (
    <div className="w-full">
      <MapaLeaflet
        center={center}
        zoom={zoom}
        markers={markers}
        height={height}
      />

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: '#ef4444' }}
          />
          <span>
            Hoy (<strong>{hoyCount}</strong>)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: '#eab308' }}
          />
          <span>
            Mañana (<strong>{mananaCount}</strong>)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: '#22c55e' }}
          />
          <span>
            Programadas (<strong>{restoCount}</strong>)
          </span>
        </div>
      </div>
    </div>
  );
}
