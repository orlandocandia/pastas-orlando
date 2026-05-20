---
Task ID: 5
Agent: api-endpoints-creator
Task: Create API endpoints for persona ubicacion, mapa proveedores, mapa entregas

Work Log:
- Created directory structure for new API routes
- Created PUT /api/personas/[id]/ubicacion endpoint - updates latitud, longitud, direccion_mapa, sets ubicacion_valida to true
- Created GET /api/logistica/mapa/proveedores endpoint - returns Proveedores with non-null lat/lng, includes contactos and direcciones
- Created GET /api/logistica/mapa/entregas placeholder endpoint - returns empty array with message about future implementation
- Ran lint check - passes with zero errors
- Appended work log to worklog.md

Stage Summary:
- 3 API endpoints created following existing project patterns
- All endpoints use async params pattern: `{ params }: { params: Promise<{ id: string }> }`
- All endpoints use `import { db } from '@/lib/db'` for Prisma client
- All endpoints use NextRequest/NextResponse from 'next/server'
- Persona location update validates persona existence (404), updates lat/lng/direccion_mapa/ubicacion_valida
- Proveedores endpoint filters by tipo_persona="Proveedor" and non-null lat/lng, maps to simplified response
- Entregas endpoint is placeholder for future PedidoCliente module
