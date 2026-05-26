# 🍝 Manual de Usuario — Pastas Orlando

---

> **Sistema de gestión para la producción y venta de pastas artesanales**
>
> Este manual está pensado para que Orlando pueda usar el sistema de forma sencilla, sin necesidad de conocimientos técnicos.

---

## Índice

1. [Introducción](#1-introducción)
2. [Primeros Pasos y Acceso](#2-primeros-pasos-y-acceso)
3. [Cómo Usar los Módulos Principales (Paso a Paso)](#3-cómo-usar-los-módulos-principales-paso-a-paso)
   - [A. Gestión de Productos (Catálogo de la Web)](#a-gestión-de-productos-catálogo-de-la-web)
   - [B. Gestión de Opiniones de Clientes](#b-gestión-de-opiniones-de-clientes)
   - [C. Gestión de Pedidos (Ventas)](#c-gestión-de-pedidos-ventas)
   - [D. Producción y Recetas](#d-producción-y-recetas)
   - [E. Generación de Reportes](#e-generación-de-reportes)
4. [Preguntas Frecuentes (FAQ)](#4-preguntas-frecuentes-faq)
5. [Glosario de Términos](#5-glosario-de-términos)

---

## 1. Introducción

### ¿Qué es Pastas Orlando?

**Pastas Orlando** es el sistema de gestión que te permite administrar todo tu negocio de pastas artesanales desde un solo lugar. Con este sistema podés:

- 🛒 **Mostrar tus productos** en la página web para que los clientes los vean
- 📦 **Controlar el stock** de materias primas, insumos y productos terminados
- 🍳 **Gestionar la producción** con recetas y cálculos automáticos de ingredientes
- 🧾 **Registrar compras** a proveedores y **ventas** a clientes
- 📋 **Manejar pedidos, presupuestos y reservas**
- 🚚 **Coordinar entregas** y puntos de encuentro
- 📊 **Ver reportes** de ventas, producción y stock
- 🔔 **Configurar alertas** de stock bajo y pedidos pendientes

### ¿Para qué sirve este manual?

Este manual te guía paso a paso para que puedas usar todas las funciones del sistema. Está escrito en lenguaje simple, sin términos técnicos. Si algún término no queda claro, consultá el [Glosario](#5-glosario-de-términos) al final.

---

## 2. Primeros Pasos y Acceso

### 🌐 Dirección de la página web

Tu página web (la que ven los clientes) está en:

> **https://laspastasdeorlando.vercel.app**

### 🔐 Cómo acceder al panel de administración

El panel de administración es la parte privada del sistema donde vos gestionás todo. Para entrar:

1. Ingresá a **https://laspastasdeorlando.vercel.app**
2. Hacé scroll hasta el final de la página (el **footer**)
3. Hacé clic en el ícono de **corazón ❤️** que aparece en el footer
4. Se va a abrir la página de inicio de sesión

> **💡 Tip:** También podés entrar directamente a:
> **https://laspastasdeorlando.vercel.app/admin/login**

### 📧 Credenciales por defecto

Cuando entrés por primera vez, usá estas credenciales:

| Campo       | Valor                      |
|-------------|----------------------------|
| **Email**   | orlando.candia@gmail.com   |
| **Contraseña** | Pastas2026!             |

> **⚠️ Importante:** Cambiá tu contraseña lo antes posible para mayor seguridad. Podés hacerlo desde tu perfil dentro del sistema.

### 🔄 Cómo cambiar tu contraseña

1. Ingresá al panel de administración
2. Andá a la sección de tu **perfil**
3. Buscá la opción de **Cambiar contraseña**
4. Ingresá tu contraseña actual y luego la nueva
5. Guardá los cambios

### 📬 Recuperación de contraseña

Si olvidaste tu contraseña:

1. En la página de inicio de sesión, hacé clic en **"¿Olvidaste tu contraseña?"**
2. Ingresá tu email (orlando.candia@gmail.com)
3. Te vamos a enviar un enlace a tu casilla de correo para crear una nueva contraseña
4. Abrí el enlace y definí tu nueva contraseña

> **💡 Tip:** Revisá también la carpeta de *spam* o *correo no deseado* si no ves el email.

---

## 3. Cómo Usar los Módulos Principales (Paso a Paso)

Una vez que iniciás sesión, vas a ver el **Dashboard** (pantalla principal) con un resumen de la actividad de tu negocio. Desde ahí podés navegar a todas las secciones usando el menú lateral.

---

### A. Gestión de Productos (Catálogo de la Web)

Esta sección te permite gestionar los productos que ven los clientes en la página web.

> 📍 **Ubicación en el menú:** Productos (Landing) → `/admin/productos`

#### 📋 Cómo ver los productos

1. Desde el menú lateral, hacé clic en **"Productos"** (sección Landing)
2. Vas a ver una tabla con todos los productos cargados
3. Podés buscar productos por nombre usando el campo de búsqueda
4. También podés filtrar por categoría o estado

#### ➕ Cómo agregar un nuevo producto

1. Hacé clic en el botón **"Nuevo Producto"** (suele estar arriba a la derecha)
2. Completá los campos del formulario:
   - **Nombre:** El nombre del producto (ej: "Sorrentinos de Jamón y Queso")
   - **Precio:** El precio de venta al público
   - **Stock:** La cantidad disponible
   - **Imagen:** Subí una foto del producto (hacé clic en el área de imagen y seleccioná el archivo)
   - **Categoría:** Elegí la categoría correspondiente
   - **Descripción:** Una breve descripción para los clientes
3. Hacé clic en **"Guardar"**

> **💡 Tip:** Usá fotos claras y bien iluminadas. ¡Una buena foto vende más!

#### ✏️ Cómo editar un producto

1. En la tabla de productos, buscá el producto que querés modificar
2. Hacé clic en el botón de **editar** (ícono de lápiz ✏️)
3. Modificá los campos que necesites
4. Hacé clic en **"Guardar"** para confirmar los cambios

#### 👁️ Cómo ocultar un producto de la página web

Si un producto no debe verse en la web (por ejemplo, es estacional o lo discontinuaste):

1. Editá el producto
2. Desactivá la opción **"Visible en Landing"** o **"visible_en_landing"**
3. Guardá los cambios

> El producto seguirá existiendo en el sistema, pero los clientes no lo verán en la web.

#### 🚫 Cómo marcar un producto como "sin stock"

1. Editá el producto
2. Cambiá el **stock actual** a **0**
3. Guardá los cambios

> **💡 Tip:** También podés desactivar la opción "Visible en Landing" para que no se muestre mientras no tengas stock. Algunos productos se ocultan automáticamente cuando el stock llega a 0.

---

### B. Gestión de Opiniones de Clientes

Las opiniones que dejan los clientes en la página web necesitan ser aprobadas antes de publicarse. Así te asegurás de que solo se muestren comentarios apropiados.

> 📍 **Ubicación en el menú:** Opiniones → `/admin/opiniones`

#### 📋 Cómo ver las opiniones pendientes

1. Andá a la sección **"Opiniones"** desde el menú lateral
2. Vas a ver todas las opiniones recibidas
3. Las opiniones **pendientes de aprobación** suelen aparecer destacadas o podés filtrarlas por estado
4. Cada opinión muestra: nombre del cliente, email, puntaje (estrellas ⭐), comentario y estado

#### ✅ Cómo aprobar una opinión

1. Buscá la opinión que querés aprobar
2. Hacé clic en el botón **"Aprobar"** (o cambiá el estado a "Aprobada")
3. La opinión se va a mostrar automáticamente en la página web

> **💡 Tip:** Aprobá las opiniones positivas rápidamente. ¡Los comentarios de clientes felices ayudan a vender más!

#### ❌ Cómo rechazar una opinión

1. Buscá la opinión que querés rechazar
2. Hacé clic en el botón **"Rechazar"** (o cambiá el estado a "Rechazada")
3. La opinión no se mostrará en la página web

> Podés rechazar opiniones que contengan lenguaje inapropiado, spam o que no sean relevantes.

#### ⭐ Cómo destacar una opinión

Si una opinión es especialmente buena y querés que se destaque:

1. Buscá la opinión
2. Hacé clic en la opción **"Destacar"** o marcalá como destacada
3. Las opiniones destacadas suelen aparecer primero en la página web

#### 🗑️ Cómo eliminar una opinión

1. Buscá la opinión que querés eliminar
2. Hacé clic en el botón **"Eliminar"** (ícono de papelera 🗑️)
3. Confirmá la eliminación

> **⚠️ Atención:** Una opinión eliminada no se puede recuperar.

---

### C. Gestión de Pedidos (Ventas)

Los pedidos son las solicitudes que hacen los clientes. Podés crearlos manualmente o convertir un presupuesto aprobado en pedido.

> 📍 **Ubicación en el menú:** Ventas → Pedidos de Clientes → `/admin/pedidos-clientes`

#### 📋 Cómo ver los pedidos

1. Andá a la sección **"Pedidos de Clientes"** desde el menú lateral
2. Vas a ver una tabla con todos los pedidos
3. Podés filtrar por **estado**, **cliente** o **fecha**
4. Hacé clic en un pedido para ver sus detalles completos

#### ➕ Cómo crear un nuevo pedido

1. Hacé clic en el botón **"Nuevo Pedido"**
2. Completá el formulario:
   - **Cliente:** Seleccioná el cliente del listado (o creá uno nuevo si no existe)
   - **Productos:** Agregá los productos que el cliente quiere, indicando cantidad
   - **Fecha de entrega:** Elegí cuándo se va a entregar el pedido
   - **Observaciones:** Anotá cualquier detalle especial (ej: "sin cebolla", "entregar después de las 18")
3. Hacé clic en **"Guardar"**

> **💡 Tip:** Si el cliente no está en el sistema, podés crearlo primero desde la sección "Personas".

#### 🔄 Cómo cambiar el estado de un pedido

Los pedidos pasan por diferentes estados a medida que avanzan:

| Estado | Significado |
|--------|-------------|
| 🟡 **Pendiente** | El pedido se creó pero todavía no fue confirmado |
| 🔵 **Confirmado** | El pedido fue confirmado y está esperando producción |
| 🟠 **En Producción** | Se está elaborando el pedido |
| 🟢 **Listo** | El pedido está terminado y listo para entregar |
| ✅ **Entregado** | El pedido fue entregado al cliente |
| 🔴 **Cancelado** | El pedido fue cancelado |

Para cambiar el estado:

1. Abrí el pedido que querés actualizar
2. Hacé clic en el botón de **cambiar estado** o en el botón correspondiente al nuevo estado
3. Confirmá el cambio

> **⚠️ Importante:** Los cambios de estado son progresivos. No podés pasar de "Pendiente" a "Entregado" sin pasar por los estados intermedios.

#### 💰 Cómo convertir un pedido en una venta

Una vez que el pedido fue entregado (o cuando lo cobres):

1. Andá a la sección **"Ventas"** → `/admin/ventas`
2. Hacé clic en **"Nueva Venta"**
3. Seleccioná el **cliente** y podés **vincular el pedido** correspondiente
4. Completá los datos de la venta:
   - **Método de pago:** Efectivo, transferencia, etc.
   - **Productos:** Se completan automáticamente si vinculaste el pedido
   - **Número de comprobante:** Si corresponde
5. Guardá la venta

> **📌 Nota:** Al registrar una venta, el sistema **descuenta automáticamente** el stock de los productos terminados vendidos.

---

### D. Producción y Recetas

Esta sección es el corazón de tu sistema. Acá es donde conectás las recetas con la producción real.

> 📍 **Ubicación en el menú:** Stock & Producción → Recetas y Producción

#### 📋 Cómo ver el listado de recetas

1. Andá a la sección **"Recetas"** → `/admin/recetas`
2. Vas a ver todas las recetas cargadas
3. Cada receta muestra: el producto terminado al que pertenece, el rendimiento (cuántas unidades salen) y los ingredientes que lleva

#### ➕ Cómo crear una nueva receta

1. Hacé clic en **"Nueva Receta"**
2. Completá los datos:
   - **Producto Terminado:** Elegí para qué producto es esta receta (ej: Sorrentinos de Jamón y Queso)
   - **Rendimiento (unidades):** Cuántas unidades salen con esta receta (ej: 50 sorrentinos)
   - **Ingredientes:** Agregá cada ingrediente con su cantidad y unidad:
     - Seleccioná el ingrediente (materia prima o insumo)
     - Indicá la cantidad necesaria
     - La unidad se completa automáticamente
     - El costo estimado se calcula automáticamente
3. Guardá la receta

> **💡 Tip:** Las recetas bien cargadas te permiten calcular costos exactos y saber exactamente qué necesitás comprar.

#### 🏭 Cómo ejecutar una producción

La producción es el proceso de fabricar productos terminados usando las recetas.

1. Andá a la sección **"Producción"** → `/admin/produccion`
2. Hacé clic en **"Nueva Producción"**
3. Completá el formulario:
   - **Receta:** Seleccioná la receta que vas a producir
   - **Cantidad:** Indicá cuántas unidades vas a producir
4. Antes de guardar, podés **verificar el stock** haciendo clic en el botón correspondiente. El sistema te va a mostrar si tenés suficientes ingredientes o si te falta algo
5. Hacé clic en **"Guardar"** para registrar la producción

#### ✅ Completar una producción

Cuando terminaste de producir:

1. Buscá la producción en el listado
2. Hacé clic en **"Completar"** o cambiá el estado a completada
3. El sistema hace lo siguiente **automáticamente**:
   - ❌ **Descuenta** las materias primas e insumos usados del stock
   - ✅ **Aumenta** el stock de productos terminados con las unidades producidas
   - 📝 **Registra** los movimientos de stock correspondientes

> **⚠️ Importante:** Una vez completada la producción, no se puede deshacer. Asegurate de que los datos sean correctos antes de completarla.

---

### E. Generación de Reportes

Los reportes te permiten ver la información de tu negocio de forma clara y ordenada.

> 📍 **Ubicación en el menú:** Auditoría & Reportes → Reportes → `/admin/reportes`

#### 📊 Tipos de reportes disponibles

| Reporte | ¿Qué muestra? |
|---------|---------------|
| 📈 **Producción** | Resumen de las producciones realizadas |
| 💰 **Ventas** | Detalle de las ventas del período |
| 🛒 **Compras** | Compras realizadas a proveedores |
| ⏳ **Compras Pendientes** | Pedidos a proveedores que todavía no llegaron |
| 📋 **Pedidos del Día** | Los pedidos que hay que entregar hoy |
| 🚚 **Hoja de Ruta** | Recorrido de entregas del día |
| 📦 **Stock** | Estado actual del inventario |

#### 📋 Cómo ver un reporte de ventas

1. Andá a la sección **"Reportes"** → `/admin/reportes`
2. Seleccioná el tipo de reporte que querés ver (ej: "Ventas")
3. Aplicá los filtros que necesites:
   - **Fecha desde / hasta:** Para ver un período específico
   - **Cliente:** Para ver las ventas a un cliente particular
   - Otros filtros según el tipo de reporte
4. El reporte se muestra en pantalla con los datos filtrados

#### 📥 Cómo exportar el reporte

Una vez que estás viendo el reporte en pantalla:

1. Buscá los botones de **exportación** (suelen estar arriba del reporte)
2. Elegí el formato:
   - 📄 **PDF:** Para imprimir o enviar por email
   - 📊 **Excel:** Para abrir en Excel y hacer cálculos adicionales
   - 📝 **CSV:** Para usar en otros programas
3. El archivo se descarga automáticamente a tu computadora

> **💡 Tip:** Exportá el reporte de ventas mensual en Excel para llevar un control detallado de tus ingresos.

---

## 4. Preguntas Frecuentes (FAQ)

### 🔑 ¿Olvidé mi contraseña, qué hago?

1. En la página de inicio de sesión, hacé clic en **"¿Olvidaste tu contraseña?"**
2. Ingresá tu email (orlando.candia@gmail.com)
3. Revisá tu casilla de correo (incluyendo la carpeta de spam)
4. Hacé clic en el enlace que te llegó y creá una nueva contraseña

---

### 👥 ¿Puedo tener otros usuarios (empleados)?

¡Sí! Podés crear usuarios para tus empleados y asignarles roles con permisos específicos.

**Para crear un usuario:**

1. Andá a la sección **"Usuarios"** → `/admin/usuarios`
2. Hacé clic en **"Nuevo Usuario"**
3. Completá los datos: nombre, email y contraseña
4. Asignale un **rol** (por ejemplo: "Vendedor", "Producción", "Administrador")
5. Guardá

**¿Qué son los roles?**

Los roles definen qué puede hacer cada persona en el sistema:

- 🔴 **Administrador:** Acceso completo a todo el sistema
- 🟠 **Producción:** Puede gestionar recetas, materias primas y producciones
- 🟡 **Vendedor:** Puede gestionar pedidos, presupuestos y ventas
- 🟢 **Consultor:** Solo puede ver información, no modificarla

> **💡 Tip:** Dale a cada empleado solo los permisos que necesita para su trabajo. Así evitás errores accidentales.

---

### 🕵️ ¿Por qué un producto no aparece en la página web?

Si un producto no se muestra en la web, puede ser por alguna de estas razones:

1. **"Visible en Landing" está desactivado:** El producto tiene un interruptor que controla si se muestra o no en la web. Para activarlo, editá el producto y marcá la opción "Visible en Landing"
2. **El stock está en 0:** Si el producto no tiene stock disponible, puede que no se muestre automáticamente
3. **Falta la imagen:** Algunos productos necesitan una imagen para mostrarse en la web. Subile una foto al producto
4. **El producto está inactivo:** Verificá que el estado del producto esté activo

**Para solucionarlo:**

1. Andá a la sección de **Productos Terminados** o **Productos (Landing)**
2. Editá el producto en cuestión
3. Activá "Visible en Landing"
4. Asegurate de que tenga imagen y stock mayor a 0
5. Guardá los cambios

---

### 🔐 ¿Cómo activo la autenticación de dos factores (2FA)?

La autenticación de dos factores agrega una capa extra de seguridad a tu cuenta. Además de la contraseña, vas a necesitar un código que se genera en tu celular.

**Para activarla:**

1. Andá a la sección **"Perfil"** → **"2FA"** → `/admin/perfil/2fa`
2. Hacé clic en **"Activar 2FA"**
3. El sistema te va a mostrar un **código QR**
4. Descargá una app de autenticación en tu celular (recomendamos **Google Authenticator** o **Authy** — son gratis)
5. Escaneá el código QR con la app
6. La app va a empezar a generar códigos de 6 dígitos que cambian cada 30 segundos
7. Ingresá el código actual en el sistema para confirmar la activación
8. **¡Importante!** Guardá los **códigos de respaldo** que te muestra el sistema en un lugar seguro. Los vas a necesitar si perdés el celular

> **⚠️ Muy importante:** Guardá los códigos de respaldo en un lugar seguro (anotalos en un papel o guardalos en un lugar que recuerdes). Si perdés el celular y no tenés los códigos de respaldo, vas a necesitar ayuda técnica para recuperar el acceso.

**Para desactivar la 2FA:**

1. Andá a la misma sección **"Perfil" → "2FA"**
2. Hacé clic en **"Desactivar 2FA"**
3. Ingresá el código de tu app de autenticación para confirmar

---

### 🔔 ¿Cómo configuro las alertas de stock bajo?

Las alertas de stock bajo te avisan cuando un ingrediente o producto está por debajo del nivel mínimo que definiste.

**Para configurarlas:**

1. Andá a la sección **"Notificaciones" → "Alertas"** → `/admin/notificaciones/alertas`
2. Vas a ver las alertas disponibles:
   - 📦 **Stock bajo:** Se activa cuando un producto o materia prima baja del stock mínimo
   - 📋 **Pedido pendiente:** Avisa cuando hay pedidos que llevan mucho tiempo sin confirmar
   - 🚚 **Entrega próxima:** Te recuerda las entregas del día
   - ⏰ **Producción atrasada:** Alerta cuando una producción no se completó en el tiempo esperado
3. Activá las alertas que quieras recibir
4. Configurá los parámetros (por ejemplo, con cuánta anticipación avisar)
5. Guardá la configuración

**Para que las alertas funcionen, es fundamental que:**

- Cada materia prima y producto terminado tenga definido un **stock mínimo**. Si el stock actual baja de ese mínimo, se dispara la alerta
- Al crear o editar materias primas y productos, siempre cargués el campo **"Stock Mínimo"**

> **💡 Tip:** Revisá las alertas todos los días. Así nunca te quedás sin ingredientes clave para producir.

---

## 5. Glosario de Términos

| Término | Definición |
|---------|------------|
| **Seña** | 💵 Pago anticipado que hace el cliente para confirmar un pedido de producción. Garantiza que el pedido es serio. |
| **Punto de encuentro** | 📍 Lugar acordado con el cliente para la entrega de los productos (ej: una esquina, un negocio, una plaza). |
| **Producto terminado** | 🍝 Lo que finalmente le vendés al cliente. Ejemplo: Sorrentinos, Raviolones, Ñoquis, Canelones. |
| **Materia prima** | 🥚 Ingrediente base que usás para fabricar tus pastas. Ejemplo: Harina, huevo, jamón, queso, espinaca. |
| **Insumo** | 📦 Material de envase o empaque que usás para presentar tus productos. Ejemplo: Bandejas, film, bolsas, etiquetas. |
| **Presupuesto** | 📝 Cotización que le envías a un cliente antes de confirmar un pedido. Si el cliente lo aprueba, se puede convertir en pedido. |
| **Receta** | 📖 Fórmula que indica qué ingredientes y cantidades se necesitan para producir un producto terminado. Es como la "fórmula mágica" de cada pasta. |
| **Producción** | 🏭 Proceso de fabricar productos terminados usando materias primas e insumos, siguiendo una receta. |
| **Stock** | 📦 Cantidad disponible de un producto o ingrediente en tu inventario. Es lo que tenés "en depósito" listo para usar o vender. |
| **CRUD** | ✏️ Sigla que significa Crear, Leer, Actualizar y Eliminar. Son las 4 operaciones básicas que podés hacer con cualquier dato en el sistema. Cuando decimos "hacé el CRUD de productos" significa que podés crear, ver, editar y eliminar productos. |
| **Dashboard** | 📊 Panel principal del sistema. Es la primera pantalla que ves al entrar, donde aparecen las estadísticas y la actividad reciente de tu negocio. |
| **Landing Page** | 🌐 La página web pública que ven tus clientes. No requiere contraseña para verla. |
| **2FA** | 🔐 Autenticación de Dos Factores. Es un método de seguridad extra que requiere un código de tu celular además de la contraseña. |
| **Proveedor** | 🚛 Persona o empresa que te vende materias primas o insumos. |
| **Movimiento de stock** | 📋 Registro de cualquier cambio en el inventario: entradas (compras, producciones) y salidas (ventas, consumos). |

---

## 🗺️ Mapa Completo del Sistema

A continuación, un resumen de todas las secciones del panel de administración para que sepas dónde encontrar cada cosa:

### 📊 Dashboard
- Pantalla principal con estadísticas y actividad reciente
- `/admin/dashboard`

### 🏭 Stock & Producción
| Sección | ¿Para qué sirve? | URL |
|---------|------------------|-----|
| Materias Primas | Gestionar ingredientes base | `/admin/materias-primas` |
| Insumos | Gestionar materiales de envase | `/admin/insumos` |
| Productos Terminados | Gestionar los productos que vendés | `/admin/productos-terminados` |
| Recetas | Ver y crear fórmulas de producción | `/admin/recetas` |
| Producción | Registrar elaboraciones | `/admin/produccion` |

### 🛒 Compras
| Sección | ¿Para qué sirve? | URL |
|---------|------------------|-----|
| Compras | Registrar compras a proveedores | `/admin/compras` |
| Pedidos a Proveedores | Hacer pedidos que todavía no llegaron | `/admin/pedidos-proveedores` |

### 💰 Ventas
| Sección | ¿Para qué sirve? | URL |
|---------|------------------|-----|
| Pedidos de Clientes | Gestionar pedidos recibidos | `/admin/pedidos-clientes` |
| Presupuestos | Crear y enviar cotizaciones | `/admin/presupuestos` |
| Ventas | Registrar ventas realizadas | `/admin/ventas` |
| Reservas | Gestionar reservas con seña | `/admin/reservas-clientes` |

### 📦 Movimientos de Stock
- Ver todos los movimientos de inventario con filtros
- `/admin/stock-movements`

### 🚚 Logística
| Sección | ¿Para qué sirve? | URL |
|---------|------------------|-----|
| Entregas | Programar y seguir entregas | `/admin/logistica/entregas` |
| Puntos de Encuentro | Configurar lugares de entrega | `/admin/logistica/puntos-encuentro` |
| Mapa de Entregas | Ver entregas en el mapa | `/admin/logistica/mapa-entregas` |
| Mapa de Proveedores | Ver proveedores en el mapa | `/admin/logistica/mapa-proveedores` |

### 🔔 Notificaciones
| Sección | ¿Para qué sirve? | URL |
|---------|------------------|-----|
| Plantillas | Ver/editar plantillas de mensajes | `/admin/notificaciones/plantillas` |
| Historial | Ver notificaciones enviadas | `/admin/notificaciones/historial` |
| Alertas | Configurar alertas automáticas | `/admin/notificaciones/alertas` |
| Enviar | Enviar una notificación manual | `/admin/notificaciones/enviar` |

### ⚙️ Configuración
| Sección | ¿Para qué sirve? | URL |
|---------|------------------|-----|
| Categorías | Organizar productos por tipo | `/admin/categorias` |
| Marcas | Gestionar marcas de productos | `/admin/marcas` |
| Unidades de Medida | Configurar unidades (kg, g, l, etc.) | `/admin/unidades-medida` |
| Configuración General | Métodos de pago y estados | `/admin/configuracion` |

### 📋 Auditoría & Reportes
| Sección | ¿Para qué sirve? | URL |
|---------|------------------|-----|
| Auditoría | Ver todas las acciones del sistema | `/admin/auditoria` |
| Reportes | Ver reportes de negocio | `/admin/reportes` |
| Compras Pendientes | Ver pedidos no recibidos | `/admin/reportes/compras-pendientes` |
| Hoja de Ruta | Ver recorrido de entregas | `/admin/reportes/hoja-ruta` |
| Pedidos del Día | Ver pedidos a entregar hoy | `/admin/reportes/pedidos-dia` |

### 🔒 Seguridad
| Sección | ¿Para qué sirve? | URL |
|---------|------------------|-----|
| Usuarios | Gestionar usuarios del sistema | `/admin/usuarios` |
| Permisos | Ver y asignar permisos | `/admin/usuarios/permisos` |
| 2FA | Activar autenticación doble | `/admin/perfil/2fa` |
| Logs de Acceso | Ver intentos de inicio de sesión | `/admin/seguridad/logs-acceso` |
| Sesiones | Ver y cerrar sesiones activas | `/admin/seguridad/sesiones` |

### 🌐 Otros
| Sección | ¿Para qué sirve? | URL |
|---------|------------------|-----|
| Personas | Gestionar clientes, proveedores y empleados | `/admin/personas` |
| Opiniones | Moderar opiniones de la web | `/admin/opiniones` |
| Consultas | Ver mensajes del formulario de contacto | `/admin/consultas` |
| Estadísticas | Ver estadísticas del negocio | `/admin/estadisticas` |
| Productos (Landing) | Gestionar catálogo de la web | `/admin/productos` |

---

## 🌈 Paleta de Colores del Sistema

Para referencia, estos son los colores identificatorios de Pastas Orlando:

| Color | Código | Uso |
|-------|--------|-----|
| 🟡 **Mostaza** | `#E1AD01` | Color principal, botones y acentos |
| 🟤 **Crema** | `#FFF8E7` | Fondo claro, tarjetas |
| 🟫 **Marrón** | `#5C3A21` | Textos principales, encabezados |
| 🔴 **Rojo** | `#C41E3A` | Alertas, acentos destacados |

---

## 📞 Soporte

Si tenés algún problema con el sistema o necesitás ayuda:

1. Revisá este manual primero — la mayoría de las dudas están respondidas acá
2. Consultá la sección de [Preguntas Frecuentes](#4-preguntas-frecuentes-faq)
3. Si el problema persiste, contactá al soporte técnico

---

> **🍝 Pastas Orlando — Hecho con ❤️ y tradición artesanal**
