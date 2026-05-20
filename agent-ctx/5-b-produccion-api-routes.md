# Task 5-b: Producción API Routes

## Task Summary
Created three API route files for the Producción module in the Pastas Orlando Next.js project.

## Files Created

### 1. `/home/z/my-project/src/app/api/produccion/route.ts`
- **GET /api/produccion**: Lists producciones with pagination and filters (fecha_desde, fecha_hasta, id_estado, id_receta, pagina, limite). Returns data with full includes: receta (with productoTerminado), supervisor (with contactos), estado, detalleConsumos (with materiaPrima, insumo, unidad), detalleGenerados (with productoTerminado). Response: `{ data, total, pagina, totalPaginas }`.
- **POST /api/produccion**: Creates a new production order. Accepts: id_receta, cantidad_producida, fecha_produccion, id_supervisor (optional), observaciones (optional). Loads the receta with its detalleRecetas, calculates consumos using `factor = cantidad_producida / rendimiento_unidades`, computes costs using `precio_compra_referencia`, sets initial state to "planificado", creates Produccion + DetalleProduccionConsumo + DetalleProduccionGenerado in a transaction.

### 2. `/home/z/my-project/src/app/api/produccion/[id]/completar/route.ts`
- **PUT /api/produccion/[id]/completar**: Completes production and executes stock movements. Verifies current state is "planificado" or "en_curso". In a transaction:
  - For each DetalleProduccionConsumo: deducts from MateriaPrima.stock_actual or Insumo.stock_actual and creates StockMovement with tipo "produccion_consumo" (negative cantidad).
  - For each DetalleProduccionGenerado: adds to ProductoTerminado.stock_actual and creates StockMovement with tipo "produccion_genera" (positive cantidad).
  - Updates produccion estado to "completado".

### 3. `/home/z/my-project/src/app/api/produccion/validar-stock/route.ts`
- **GET /api/produccion/validar-stock**: Validates if there's enough stock for a production. Accepts: id_receta, cantidad_producida. Loads receta with detalles, calculates required quantities, checks against stock_actual. Returns: `{ puede_producir: boolean, receta, cantidad_solicitada, factor_escala, faltantes: [{ tipo, id, nombre, codigo, required, available, deficit, unidad }] }`.

## Design Decisions
- Followed existing project patterns from `/api/ventas/route.ts` and `/api/compras/route.ts`
- Used `params: Promise<{ id: string }>` pattern for Next.js 16 dynamic routes (matching existing `[id]/estado/route.ts`)
- Stock movements in completar use negative cantidad for consumos and positive for generated products
- All database operations in completar are wrapped in a transaction for atomicity
- The validar-stock endpoint returns ALL items (not just those with deficits) for full visibility
- Used `precio_compra_referencia` from MateriaPrima/Insumo for cost calculations as specified

## Lint Status
✅ Clean - no errors
