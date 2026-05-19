# Task 4 - Frontend Developer - Phase 3 Components

## Task
Create ALL the frontend components for Phase 3 of the Pastas Orlando project.

## Work Completed

### Files Created (10 components)

1. **`/home/z/my-project/src/components/admin/ImageUploaderProducto.tsx`**
   - Reusable image upload with `uploadUrl` prop
   - Drag-and-drop, click-to-upload, preview, image validation (type + 5MB max)
   - Same behavior as original ImageUploader but configurable endpoint

2. **`/home/z/my-project/src/components/admin/MateriaPrimaForm.tsx`**
   - React Hook Form + Zod validation
   - Fields: código, nombre, descripción, categoría (from API), unidad base (from API), stock actual/mínimo, precio compra referencia, foto (upload to /api/upload/materia-prima), estado (Switch)
   - POST to /api/materias-primas or PUT to /api/materias-primas/[id]

3. **`/home/z/my-project/src/components/admin/MateriasPrimasTable.tsx`**
   - Search by nombre/código, filter by categoría (from API), filter by estado
   - Server-side pagination (10/page) with Previous/Next buttons
   - Low stock warning: red badge when stock_actual <= stock_minimo
   - Dialog for create/edit, AlertDialog for delete confirmation
   - Fetches from /api/materias-primas with query params

4. **`/home/z/my-project/src/components/admin/InsumoForm.tsx`**
   - Similar to MateriaPrimaForm but uses tipo de insumo (from /api/categorias?tipo=tipos-insumo)
   - Uploads to /api/upload/insumo
   - POST/PUT to /api/insumos

5. **`/home/z/my-project/src/components/admin/InsumosTable.tsx`**
   - Similar to MateriasPrimasTable but filters by tipo insumo
   - Fetches from /api/insumos with pagination
   - Same low stock warning and pagination patterns

6. **`/home/z/my-project/src/components/admin/ProductoTerminadoForm.tsx`**
   - Fields: código, nombre, descripción, categoría (from /api/categorias?tipo=productos-terminados), peso unitario aprox, precio venta, foto (upload to /api/upload/producto-terminado), estado
   - POST/PUT to /api/productos-terminados

7. **`/home/z/my-project/src/components/admin/ProductosTerminadosTable.tsx`**
   - Search, categoría filter, estado filter
   - Price formatted as ARS currency using Intl.NumberFormat('es-AR')
   - Server-side pagination with page info display

8. **`/home/z/my-project/src/components/admin/CategoriasManager.tsx`**
   - Tabs: "Materias Primas" | "Productos Terminados" | "Tipos de Insumo"
   - Each tab: inline create form + table with nombre/descripción/acciones
   - Edit via Dialog (nombre + descripción fields)
   - Delete via AlertDialog
   - CRUD via /api/categorias with tipo param

9. **`/home/z/my-project/src/components/admin/MarcasManager.tsx`**
   - Inline create form (nombre + descripción)
   - Table with nombre, descripción, acciones
   - Edit Dialog, delete AlertDialog
   - CRUD via /api/marcas

10. **`/home/z/my-project/src/components/admin/UnidadesMedidaManager.tsx`**
    - Inline create form with código, nombre, conversión a base, tipo medida (select: peso/volumen/longitud/unidad)
    - Table showing all fields with tipo badge
    - Edit Dialog, delete AlertDialog
    - CRUD via /api/unidades-medida

## Patterns Followed
- 'use client' directive on all components
- shadcn/ui components (Button, Input, Badge, Table, Dialog, AlertDialog, Select, Form, Switch, Tabs, Textarea, Label)
- lucide-react icons
- sonner for toast notifications
- React Hook Form + Zod for validation
- Custom colors: bg-mostaza, text-marron, text-mostaza, bg-rojo, text-rojo, bg-oliva, text-oliva
- Primary button: `className="bg-mostaza hover:bg-mostaza/90 text-marron font-semibold"`
- `formatPrice` using `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })`
- Loading states with Loader2 spinner
- Consistent error handling with toast messages

## Quality Checks
- Lint passes with zero errors
- Dev server running normally
