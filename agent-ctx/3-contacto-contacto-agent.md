# Task 3-contacto — contacto-agent

## Summary
Rewrote the Contacto section component and added Consultas to admin sidebar.

## Changes Made

### 1. `/src/components/sections/Contacto.tsx` — Complete rewrite
- **Layout**: 2-column grid on desktop (`lg:grid-cols-2`), stacked on mobile
- **Left column**:
  - Title "El amigo de las pastas"
  - Contact info with icons: Star, Truck (envío gratis / no local), MapPin (Corrientes/envío gratis, Alrededores/consultanos), Phone (3754-419324 tel link), Mail (mailto link), Clock (pedidos con anticipación)
  - Green WhatsApp button (full width): "📲 PEDIR POR WHATSAPP"
  - QR code section using `react-qr-code` (size 120, white bg container with rounded corners, "Escaneá y escribí a Orlando" text, onMouseEnter tracks QR scan)
- **Right column**:
  - `bg-crema/50` card with "Envianos tu consulta" title
  - Form with: Nombre y apellido, Email, Teléfono/WhatsApp, Mensaje (all required)
  - Submit button: "Enviar Solicitud" — `bg-mostaza hover:bg-mostaza/90 text-marron font-bold`
  - Loading state, success message (✅), error handling with red message
  - POSTs to `/api/consultas` with `{ nombre, email, telefono, mensaje }`
  - Form clears on success
- **Updated**: WHATSAPP_LINK phone number to `5493754419324`
- **Kept**: `trackInteraction` function for WhatsApp clicks and QR scans

### 2. `/src/app/(dashboard)/layout.tsx` — Added Consultas sidebar item
- Added "Consultas" entry to `otherItems` array after "Opiniones" and before "Estadísticas"
- Route: `/admin/consultas`, icon: `Mail` (already imported)

## Lint
- `bun run lint` — no errors

## Notes
- The `/api/consultas` endpoint needs to be created by a future task
- The `/admin/consultas` page needs to be created by a future task
