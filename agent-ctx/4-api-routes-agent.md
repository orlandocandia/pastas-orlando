# Task 4 - Phase 5 API Routes

## Agent: API Routes Agent

## Task
Create API routes for Phase 5 (Ventas, Pedidos de Clientes, Reservas)

## Work Done

### 1. `/api/pedidos-clientes/route.ts`
- **GET**: List pedidos de clientes with pagination (pagina, limite), filters (id_cliente, id_estado, fecha_desde, fecha_hasta, buscar). Includes cliente, estado, detalle.productoTerminado
- **POST**: Create pedido with details. Auto-calculates subtotal/total from details. Defaults estado to "pendiente". Supports senia field

### 2. `/api/pedidos-clientes/[id]/route.ts`
- **GET**: Get single pedido with all relations (cliente, estado, detalle.productoTerminado, reservas, venta)
- **PUT**: Update pedido (id_estado, observaciones, fecha_entrega_real)

### 3. `/api/pedidos-clientes/[id]/estado/route.ts`
- **PUT**: Change estado of a pedido. Validates estado exists before updating

### 4. `/api/ventas/route.ts`
- **GET**: List ventas with pagination, filters (id_cliente, id_estado, id_forma_pago, fecha_desde, fecha_hasta, buscar). Includes cliente, vendedor (with persona), formaPago, estado, detalle.productoTerminado
- **POST**: Create venta with details in a transaction. Auto-calculates subtotal, iva (21%), total. Creates StockMovement records (type "venta", negative cantidad) for each producto terminado for audit trail. Defaults estado to "pendiente". Supports id_pedido linking. Uses default UnidadMedida of tipo "unidad" for stock movements

### 5. `/api/ventas/[id]/route.ts`
- **GET**: Get single venta with all relations (cliente, vendedor, formaPago, estado, pedido, detalle.productoTerminado)
- **PUT**: Update venta (id_estado, numero_comprobante)

### 6. `/api/reservas-clientes/route.ts`
- **GET**: List reservas with pagination, filters (id_cliente, id_estado, fecha_desde, fecha_hasta). Includes cliente, productoTerminado, estado, pedido
- **POST**: Create reserva. Defaults estado to "pendiente", cantidad_confirmada to 0. Validates producto terminado exists

### 7. `/api/reservas-clientes/[id]/route.ts`
- **GET**: Get single reserva with all relations (cliente, productoTerminado with categoria, estado, pedido with details)
- **PUT**: Update reserva (id_estado, cantidad_confirmada)

## Patterns Followed
- Import `db` from `@/lib/db`
- Use `NextRequest` and `NextResponse` from `next/server`
- Return `{ data, total, pagina, totalPaginas }` for list endpoints
- Use try/catch with console.error
- Follow existing `/api/compras/route.ts` patterns
- Use `params: Promise<{ id: string }>` for dynamic routes (Next.js 16 pattern)
- Use `Record<string, unknown>` for where clause and update data typing

## Notes
- Venta model doesn't have `observaciones` field in the Prisma schema, so PUT only supports `id_estado` and `numero_comprobante`
- ProductoTerminado doesn't have `stock_actual` or `id_unidad_base` fields, so ventas create StockMovement records for audit purposes only with stock_antes=0, stock_despues=0
- Pedidos de clientes don't calculate IVA (subtotal = total), unlike ventas which add 21% IVA
