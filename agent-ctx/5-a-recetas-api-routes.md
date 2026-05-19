# Task 5-a: Recetas API Routes

## Summary
Created two API route files for the Recetas module following existing project patterns (ventas routes).

## Files Created

### 1. `/home/z/my-project/src/app/api/recetas/route.ts`
- **GET /api/recetas**: List recetas with pagination and filters
  - Query params: `buscar`, `id_producto_terminado`, `activo`, `pagina` (default 1), `limite` (default 20)
  - Search by `nombre_receta` using `contains`
  - Returns `{ data, total, pagina, totalPaginas }`
  - Includes: `productoTerminado`, `detalleRecetas` (with `materiaPrima`, `insumo`, `unidad`)

- **POST /api/recetas**: Create receta with detalles
  - Body: `nombre_receta`, `id_producto_terminado`, `rendimiento_unidades` (default 1), `activo` (default true), `detalles` (array)
  - Each detalle: `tipo` (mp/insumo), `id_materia_prima` (if tipo=mp), `id_insumo` (if tipo=insumo), `cantidad_necesaria`, `id_unidad`, `costo_estimado`
  - Validates: required fields, tipo must be mp/insumo, proper id based on tipo, cantidad > 0, id_unidad required
  - Uses `db.$transaction` for atomic creation
  - Returns created receta with all includes (status 201)

### 2. `/home/z/my-project/src/app/api/recetas/[id]/route.ts`
- **GET /api/recetas/[id]**: Get single receta by ID with all includes
  - Returns 404 if not found

- **PUT /api/recetas/[id]**: Update receta and replace all detalles
  - Accepts same fields as POST (all optional except detalles when provided)
  - Validates detalles array if provided
  - Uses `db.$transaction`: updates receta fields, deletes old detalles, creates new detalles
  - Returns 404 if receta not found

## Patterns Followed
- `import { db } from '@/lib/db'` for database client
- `import { NextRequest, NextResponse } from 'next/server'` for request/response
- `params: Promise<{ id: string }>` pattern for Next.js 16 App Router
- `const { id } = await params` for unwrapping
- Shared `recetaIncludes` object for consistent includes across endpoints
- Transaction usage for multi-table operations
- Proper error handling with try/catch and console.error
- Consistent pagination response format
