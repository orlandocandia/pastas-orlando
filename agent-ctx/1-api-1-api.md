# Task 1-api Work Record

## Task: Add Consulta model and create API routes for web contact form

### Work Completed

1. **Added Consulta model to Prisma schema** (`prisma/schema.prisma`)
   - Fields: id (autoincrement), nombre, email, telefono, mensaje, leido (default false), respondido (default false), fecha (default now()), createdAt (default now())
   - Indexes on `fecha` and `leido`

2. **Database sync**
   - Ran `bunx prisma db push --accept-data-loss` — Consulta table created
   - Ran `bunx prisma generate` — Prisma Client regenerated

3. **API Route: POST/GET `/api/consultas`** (`src/app/api/consultas/route.ts`)
   - **POST** (public): Validates nombre, email, telefono, mensaje; validates email format; creates Consulta record; triggers non-blocking email + WhatsApp notifications
   - **GET** (admin): Lists consultas with pagination (page/limit), search (nombre/email/telefono), and estado filter (leido/no-leido/respondido)
   - `sendEmailNotification`: Logs to console + creates Notificacion record (tipo: email, destinatario: laspastasdeorlando@gmail.com)
   - `sendWhatsAppNotification`: Generates wa.me link + creates Notificacion record (tipo: whatsapp, destinatario: 5493754419324)

4. **API Route: GET/PUT/DELETE `/api/consultas/[id]`** (`src/app/api/consultas/[id]/route.ts`)
   - **GET**: Returns consulta detail; auto-marks as read (leido=true) on first view
   - **PUT**: Updates leido and/or respondido status fields
   - **DELETE**: Deletes a consulta by id

5. **Lint**: `bun run lint` — clean, no errors

### Files Modified
- `prisma/schema.prisma` — Added Consulta model
- `src/app/api/consultas/route.ts` — New file
- `src/app/api/consultas/[id]/route.ts` — New file
- `worklog.md` — Appended work log
