'use client';

// Barrel exports for logistica map components.
// IMPORTANT: All these components use Leaflet which requires the `window` object.
// When importing in a Next.js page/layout, you MUST use dynamic import with ssr: false:
//
//   const MapaLeaflet = dynamic(() => import('@/components/logistica/MapaLeaflet'), { ssr: false });
//   const SelectorUbicacion = dynamic(() => import('@/components/logistica/SelectorUbicacion'), { ssr: false });
//   const MapaEntregas = dynamic(() => import('@/components/logistica/MapaEntregas'), { ssr: false });
//   const MapaProveedores = dynamic(() => import('@/components/logistica/MapaProveedores'), { ssr: false });

export { default as MapaLeaflet } from './MapaLeaflet';
export type { MapMarker, MapaLeafletProps } from './MapaLeaflet';

export { default as SelectorUbicacion } from './SelectorUbicacion';
export type { SelectorUbicacionProps } from './SelectorUbicacion';

export { default as MapaEntregas } from './MapaEntregas';
export type { EntregaMapData, MapaEntregasProps } from './MapaEntregas';

export { default as MapaProveedores } from './MapaProveedores';
export type { ProveedorMapData, MapaProveedoresProps } from './MapaProveedores';
