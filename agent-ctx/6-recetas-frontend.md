# Task 6 - Recetas Frontend Pages

## Summary
Created all three Recetas frontend files following the exact patterns from VentasTable/VentaForm.

## Files Created

### 1. `/src/components/admin/RecetaForm.tsx`
- Form for creating/editing recetas
- Fields: nombre_receta, id_producto_terminado (select), rendimiento_unidades (number), activo (checkbox)
- Dynamic ingredient rows with: tipo (MP/Insumo select), item (select filtered by tipo), cantidad_necesaria, unidad (auto-filled from item's unidadBase), costo_estimado (auto-calculated from precio_compra_referencia * cantidad)
- When tipo changes → clears item, unidad, and costo
- When item is selected → auto-fills unidad from item's unidadBase, recalculates costo
- When cantidad changes → recalculates costo estimado
- Total costo estimado displayed at bottom
- Fetches data from: /api/productos-terminados, /api/materias-primas, /api/insumos, /api/unidades-medida
- POST to /api/recetas (create) or PUT to /api/recetas/[id] (update)
- Payload includes `tipo` field ('mp' or 'insumo') for each detalle as required by API

### 2. `/src/components/admin/RecetasTable.tsx`
- Search by nombre_receta
- Filter by producto terminado (select dropdown)
- Filter by activo/inactivo
- Table columns: Nombre Receta, Producto Terminado, Rendimiento, Costo Estimado (sum of detalle costs), Estado (activo badge - oliva/rojo), Acciones
- Edit button opens dialog with RecetaForm
- Delete button with AlertDialog confirmation
- Pagination (same pattern as VentasTable)
- "Nueva Receta" button
- Styling: border-marron/10, hover:bg-mostaza/5, text-marron, etc.

### 3. `/src/app/(dashboard)/admin/recetas/page.tsx`
- Page component with BookOpen icon from lucide-react
- Title: "Recetas"
- Subtitle: "Gestiona las recetas de producción"
- Same layout pattern as Ventas page

## Patterns Followed
- Same component structure, hooks, and styling as VentasTable/VentaForm
- Same color palette: bg-mostaza, text-marron, border-marron/10, text-rojo, bg-oliva/15
- Same Dialog/AlertDialog patterns for create/edit/delete
- Same pagination UI
- Same badge styling for status indicators
- ESLint passes with zero errors
