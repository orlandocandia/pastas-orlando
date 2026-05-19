# Task 8-9: Alertas Automáticas & Envío Manual Pages

## Summary
Created two notification management pages for the Pastas Orlando admin dashboard, plus added `produccion_atrasada` alert processor support.

## Files Created
1. `/src/app/(dashboard)/admin/notificaciones/alertas/page.tsx` - Alertas Automáticas configuration page
2. `/src/app/(dashboard)/admin/notificaciones/enviar/page.tsx` - Envío Manual de Notificaciones page

## Files Updated
3. `/src/app/api/notificaciones/alertas/ejecutar/route.ts` - Added produccion_atrasada support
4. `/src/lib/notificaciones-service.ts` - Added procesarAlertaProduccionAtrasada() function

## Key Implementation Details

### Alertas Automáticas Page
- Fetches config from GET /api/notificaciones/alertas/config
- 4 alert type cards: stock_bajo, pedido_pendiente, entrega_proxima, produccion_atrasada
- Each card: icon, title, description, last sent date, activo toggle, destinatarios textarea, frecuencia select
- Stock bajo has additional umbral number input
- Save button: PUT /api/notificaciones/alertas/config (single-item array)
- Execute button: POST /api/notificaciones/alertas/ejecutar with { tipo }
- Toast notifications for success/error with detailed result messages
- Summary card with active count

### Envío Manual Page
- Plantilla selector (from GET /api/notificaciones/plantillas) or custom message
- Template mode: highlights {{variables}}, auto-fills tipo/asunto, shows variable input fields
- Custom mode: tipo selector, asunto input, mensaje textarea with dynamic variable extraction
- Programar toggle with date/time picker
- Live preview sidebar with rendered message
- Send button: POST /api/notificaciones/enviar
- Result card showing success/error with notification details

### produccion_atrasada Alert
- Queries Produccion with EstadoGeneral in en_proceso/pendiente/iniciado states
- Filters by fecha_produccion before today
- Sends notifications to configured recipients
- Added to procesarTodasLasAlertas()

## Verification
- Lint passes cleanly
- Both pages compile and render with 200 status
