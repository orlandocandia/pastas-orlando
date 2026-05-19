# Task 3 - API Developer: Phase 3 API Endpoints

## Task
Create ALL the API endpoints for Phase 3 of the Pastas Orlando project.

## Work Completed

### Files Created (12 route files)

1. **`/src/app/api/materias-primas/route.ts`**
   - GET: List with pagination (pagina/limite), search by nombre/codigo, filter by id_categoria/estado
   - Includes relations: categoria, unidadBase
   - Returns `{ data, total, pagina, totalPaginas }`
   - POST: Create with unique codigo validation, parseFloat for numerics

2. **`/src/app/api/materias-primas/[id]/route.ts`**
   - GET: Single with categoria + unidadBase relations
   - PUT: Partial update with codigo uniqueness check
   - DELETE: With 404 check

3. **`/src/app/api/insumos/route.ts`**
   - GET: List with pagination, search, filter by id_tipo_insumo/estado
   - Includes: tipoInsumo, unidadBase
   - POST: Create with unique codigo validation

4. **`/src/app/api/insumos/[id]/route.ts`**
   - GET, PUT, DELETE same pattern as materias-primas

5. **`/src/app/api/productos-terminados/route.ts`**
   - GET: List with pagination, search, filter by id_categoria/estado
   - Includes: categoria
   - POST: Create with unique codigo validation

6. **`/src/app/api/productos-terminados/[id]/route.ts`**
   - GET, PUT, DELETE same pattern

7. **`/src/app/api/categorias/route.ts`**
   - GET: tipo param routes to CategoriaMateriaPrima, CategoriaProductoTerminado, or TipoInsumo; no tipo returns all three
   - POST/PUT/DELETE: tipo field in body/query determines which model to operate on

8. **`/src/app/api/marcas/route.ts`**
   - GET: List with optional search filter
   - POST: Create with unique nombre validation
   - PUT/DELETE: Standard CRUD

9. **`/src/app/api/unidades-medida/route.ts`**
   - GET: List with optional tipo_medida filter
   - POST: Create with unique codigo validation
   - PUT/DELETE: Standard CRUD

10. **`/src/app/api/upload/materia-prima/route.ts`** → saves to `/public/images/materias-primas/`
11. **`/src/app/api/upload/insumo/route.ts`** → saves to `/public/images/insumos/`
12. **`/src/app/api/upload/producto-terminado/route.ts`** → saves to `/public/images/productos-terminados/`

### Directories Created
- `public/images/materias-primas/`
- `public/images/insumos/`
- `public/images/productos-terminados/`

### Patterns Used
- `import { db } from '@/lib/db'` for database access
- `import { NextRequest, NextResponse } from 'next/server'`
- `parseFloat()` for all numeric fields from request body
- `parseInt()` for ID params
- `[id]` routes use `params: Promise<{ id: string }>` with `await params`
- All responses are `NextResponse.json()`
- Error handling with try/catch and appropriate status codes
- Pagination: `{ data, total, pagina, totalPaginas }`

### Verification
- Lint passes with zero errors
- Dev server running normally
