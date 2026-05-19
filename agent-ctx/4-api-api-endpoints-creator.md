# Task 4-api: API Endpoints for Presupuestos and Reportes

## Work Completed

### Files Created

1. **`/home/z/my-project/src/app/api/presupuestos/route.ts`**
   - `GET /api/presupuestos` - Listar presupuestos con filtros (estado, buscar, paginación)
   - `POST /api/presupuestos` - Crear presupuesto con detalle, generación automática de número

2. **`/home/z/my-project/src/app/api/presupuestos/[id]/estado/route.ts`**
   - `PUT /api/presupuestos/[id]/estado` - Cambiar estado del presupuesto (pendiente, aprobado, rechazado, expirado, convertido)

3. **`/home/z/my-project/src/app/api/presupuestos/[id]/convertir-pedido/route.ts`**
   - `POST /api/presupuestos/[id]/convertir-pedido` - Convertir presupuesto aprobado a pedido de cliente

4. **`/home/z/my-project/src/app/api/reportes/compras-pendientes/route.ts`**
   - `GET /api/reportes/compras-pendientes` - Productos con stock bajo (materias primas, insumos, productos terminados)

5. **`/home/z/my-project/src/app/api/reportes/hoja-ruta/route.ts`**
   - `GET /api/reportes/hoja-ruta` - Hoja de ruta de entregas del día

6. **`/home/z/my-project/src/app/api/reportes/pedidos-dia/route.ts`**
   - `GET /api/reportes/pedidos-dia` - Resumen de pedidos del día con productos más pedidos

### Patterns Followed
- Uses `import { db } from '@/lib/db'` for Prisma client
- Uses `NextRequest, NextResponse` from 'next/server'
- Uses async params: `{ params }: { params: Promise<{ id: string }> }`
- SQLite Float fields (not Decimal)
- Persona model uses `tipo_persona` field
- Consistent error handling with console.error and NextResponse.json error responses

### Lint Status
- All files pass ESLint cleanly
