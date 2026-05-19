---
Task ID: 6-7-8
Agent: full-stack-developer
Task: Build personas and usuarios components

Work Log:
- Read existing files to understand project patterns: layout.tsx, dashboard page, ProductosTable, ProductoForm, OpinionesTable, ImageUploader, all API routes (personas, personas/[id], usuarios, usuarios/[id], geografia, upload/persona, upload/usuario), and Prisma schema
- Created ContactosEditor.tsx: Dynamic contacts editor with add/remove rows, tipo_contacto select, valor input, es_principal checkbox, and automatic principal management
- Created PersonaForm.tsx: Full form with react-hook-form + zod validation, sections for Datos Personales (nombre, apellido, documento, fecha_nacimiento, tipo_persona, observaciones), Datos Fiscales (colapsable section with razon_social, cuit, condicion_iva), Foto (simplified uploader to /api/upload/persona), Dirección (cascading selects: País → Provincia → Departamento → Municipio, with auto-clear on change), and Contactos (using ContactosEditor)
- Created PersonasTable.tsx: Table with Foto (40x40 avatar), Nombre, Apellido, Documento, Tipo (color-coded badges), Teléfono principal, Acciones. Filter tabs (Todos/Clientes/Proveedores/Empleados), search by nombre/apellido/documento, server-side pagination (10 per page), delete with AlertDialog confirmation
- Created UsuarioForm.tsx: Form with persona search (Combobox with /api/personas?buscar=), email, password (optional on edit), roles (multi-select checkboxes from /api/geografia?tipo=roles), imagen (upload to /api/upload/usuario), estado (Switch toggle). Proper create vs edit handling
- Created UsuariosTable.tsx: Table with Foto, Email, Nombre, Rol (first role badge), Estado (Activo/Inactivo), Acciones. Search by email/nombre, filter by rol select, edit in dialog with UsuarioForm, delete with AlertDialog
- Created /admin/personas/page.tsx: Page header with icon, description, PersonasTable, and large dialog (max-w-4xl, max-h-[85vh]) for creating new persona with PersonaForm
- Created /admin/personas/[id]/page.tsx: Detail view with photo, personal data, fiscal data, address, contacts (with type-specific icons), user account info. Action buttons: Editar (dialog with PersonaForm), Eliminar (AlertDialog), Crear Usuario (links to /admin/usuarios). Back button to /admin/personas
- Created /admin/usuarios/page.tsx: Page header with icon, description, and UsuariosTable
- Updated layout.tsx: Added Personas (UserCircle icon) and Usuarios (Users icon) nav items after Productos and before Opiniones. Fixed sidebar highlighting to work for sub-routes using pathname.startsWith(item.href + '/')
- Updated dashboard/page.tsx: Added Total Personas and Total Usuarios metric cards with appropriate icons (UserCircle, Users) and colors (marron, oliva). Added quick access links for Personas and Usuarios. Updated grid to xl:grid-cols-5 for 5 metric cards
- Fixed lint issues: Missing closing bracket in layout.tsx, removed unused eslint-disable directives in PersonaForm.tsx

Stage Summary:
- All 8 new component/page files created and working
- 2 existing files updated (layout.tsx, dashboard/page.tsx)
- Server-side pagination for personas table (10 per page)
- Cascading geographic selects (País → Provincia → Departamento → Municipio) with proper auto-clear
- Dynamic contacts editor with add/remove/principal management
- Persona detail page with full info display, edit dialog, delete, and user creation link
- Usuario form with searchable persona selector using Combobox
- All routes returning 200 OK
- Only pre-existing lint error remains (require() in usuarios API route)
