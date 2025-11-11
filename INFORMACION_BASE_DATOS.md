# 📊 Información Completa de la Base de Datos

## 🔗 Conexión a la Base de Datos

### Proveedor
**Supabase** (PostgreSQL en la nube)

### Proyecto de Supabase
- **Project ID/Ref:** `vwmdppmlczmdbfmqbzcr`
- **Nombre del proyecto:** `parmacatalogo` (o `catalogo-parma`)

### URL de Conexión para Vercel (Producción)
```
postgresql://postgres.vwmdppmlczmdbfmqbzcr:parmacatalogo123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**⚠️ IMPORTANTE:**
- Usa **Session Pooler** (puerto **6543**) para Vercel
- Debe incluir `?pgbouncer=true` al final
- El usuario debe ser `postgres.vwmdppmlczmdbfmqbzcr` (con el punto y project-ref)

### URL de Conexión para Desarrollo Local
```
postgresql://postgres:parmacatalogo123@db.vwmdppmlczmdbfmqbzcr.supabase.co:5432/postgres
```

**Nota:** Para desarrollo local puedes usar la conexión directa (puerto 5432).

### Credenciales
- **Usuario:** `postgres` (o `postgres.vwmdppmlczmdbfmqbzcr` para pooler)
- **Contraseña:** `parmacatalogo123`
- **Base de datos:** `postgres`
- **Puerto (Pooler):** `6543`
- **Puerto (Directo):** `5432`

---

## 📋 Estructura de la Base de Datos

### Tablas Principales

#### 1. **User** (Usuarios)
```sql
- id: String (CUID)
- name: String?
- email: String (único)
- emailVerified: DateTime?
- image: String?
- passwordHash: String? (bcrypt)
- role: Role (ADMIN | EDITOR | PUBLIC)
- createdAt: DateTime
- updatedAt: DateTime
```

**Relaciones:**
- `accounts[]` → Account
- `sessions[]` → Session

#### 2. **Perfume** (Productos)
```sql
- id: String (CUID)
- nombre: String
- slug: String (único)
- descripcion: String? (TEXT)
- precio: Float
- precioDescuento: Float?
- imagenPrincipal: String
- imagenes: String[] (Array de URLs)
- stock: Int (default: 0)
- destacado: Boolean (default: false)
- activo: Boolean (default: true)
- categoriaId: String?
- marcaId: String?
- genero: String? (HOMBRE, MUJER, UNISEX)
- subtitulo: String? (EAU DE PARFUM, etc.)
- volumen: String?
- notas: String[] (Notas olfativas)
- sizes: Int[] ([30, 50, 100] - Tamaños disponibles)
- usoPorDefecto: String? (DIA, NOCHE, AMBOS)
- fijarUso: Boolean (default: false)
- createdAt: DateTime
- updatedAt: DateTime
```

**Índices:**
- `categoriaId`
- `marcaId`
- `slug`
- `(activo, destacado)`

**Relaciones:**
- `categoria` → Categoria (opcional)
- `marca` → Marca (opcional)

#### 3. **Categoria** (Categorías)
```sql
- id: String (CUID)
- nombre: String (único)
- slug: String (único)
- descripcion: String?
- imagen: String?
- createdAt: DateTime
- updatedAt: DateTime
```

**Relaciones:**
- `perfumes[]` → Perfume

#### 4. **Marca** (Marcas)
```sql
- id: String (CUID)
- nombre: String (único)
- slug: String (único)
- descripcion: String?
- logo: String?
- pais: String?
- createdAt: DateTime
- updatedAt: DateTime
```

**Relaciones:**
- `perfumes[]` → Perfume

#### 5. **Account** (Cuentas OAuth)
```sql
- id: String (CUID)
- userId: String
- type: String
- provider: String
- providerAccountId: String
- refresh_token: String? (TEXT)
- access_token: String? (TEXT)
- expires_at: Int?
- token_type: String?
- scope: String?
- id_token: String? (TEXT)
- session_state: String?
```

**Relaciones:**
- `user` → User (CASCADE on delete)

**Índices únicos:**
- `(provider, providerAccountId)`

#### 6. **Session** (Sesiones de NextAuth)
```sql
- id: String (CUID)
- sessionToken: String (único)
- userId: String
- expires: DateTime
```

**Relaciones:**
- `user` → User (CASCADE on delete)

#### 7. **VerificationToken** (Tokens de verificación)
```sql
- identifier: String
- token: String (único)
- expires: DateTime
```

**Índices únicos:**
- `(identifier, token)`

#### 8. **HeaderConfig** (Configuración del Header)
```sql
- id: TEXT (PRIMARY KEY, default: 'main')
- logoText: TEXT (default: 'parma')
- logoImage: TEXT?
- navLinks: JSONB (default: [])
- createdAt: TIMESTAMP (default: NOW())
- updatedAt: TIMESTAMP (default: NOW())
```

**Nota:** Esta tabla se crea manualmente con el script `crear_tabla_header_config.sql`.

---

## 🔧 Configuración en Vercel

### Variables de Entorno Necesarias

1. **DATABASE_URL** (Producción)
   ```
   postgresql://postgres.vwmdppmlczmdbfmqbzcr:parmacatalogo123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

2. **NEXTAUTH_URL**
   ```
   https://parmacatalogo.vercel.app
   ```

3. **NEXTAUTH_SECRET**
   ```
   (Tu secreto generado con: openssl rand -base64 32)
   ```

4. **ADMIN_EMAIL** (Opcional)
   ```
   parma01@gmail.com
   ```

5. **ADMIN_PASSWORD_HASH** (Opcional)
   ```
   (Hash bcrypt de la contraseña)
   ```

---

## 🛠️ Comandos Útiles de Prisma

### Generar Cliente Prisma
```bash
npx prisma generate
```

### Sincronizar Schema con la Base de Datos
```bash
npx prisma db push
```

### Crear Migración
```bash
npx prisma migrate dev --name nombre_migracion
```

### Ver Datos en Prisma Studio
```bash
npx prisma studio
```

### Verificar Conexión
```bash
npx prisma db pull
```

---

## 📝 Scripts SQL Importantes

### 1. Crear Tabla HeaderConfig
Archivo: `crear_tabla_header_config.sql`

### 2. Agregar Campos de Uso (DIA/NOCHE)
Archivo: `agregar_campos_uso.sql`

### 3. Actualizar Contraseña de Usuario
Archivo: `scripts/update-password-completo.sql`

---

## 🔍 Verificar Estado de la Base de Datos

### En Supabase Dashboard
1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: `vwmdppmlczmdbfmqbzcr`
3. Ve a **Table Editor** para ver las tablas
4. Ve a **SQL Editor** para ejecutar queries

### Verificar Conexión desde la App
1. Ve a: `https://parmacatalogo.vercel.app/api/perfumes`
2. Deberías ver un JSON con los perfumes (no un error)

### Verificar desde Prisma Studio
```bash
npx prisma studio
```
Esto abrirá una interfaz visual en `http://localhost:5555`

---

## ⚠️ Problemas Comunes y Soluciones

### Error: "Can't reach database server"
**Causa:** Usando conexión directa (puerto 5432) en Vercel
**Solución:** Usa Session Pooler (puerto 6543) con `?pgbouncer=true`

### Error: "FATAL: Tenant or user not found"
**Causa:** Formato incorrecto del usuario en la URL
**Solución:** El usuario debe ser `postgres.vwmdppmlczmdbfmqbzcr` (con el punto)

### Error: "Project paused"
**Causa:** Proyecto de Supabase pausado por inactividad
**Solución:** Ve a Supabase Dashboard → Haz clic en "Restore"

### Error: "Invalid connection string"
**Causa:** Falta `?pgbouncer=true` o formato incorrecto
**Solución:** Verifica que la URL termine con `?pgbouncer=true`

---

## 📊 Estadísticas y Límites

### Supabase (Plan Gratuito)
- **Base de datos:** 500 MB
- **Conexiones simultáneas:** Limitadas
- **Tiempo de inactividad:** Se pausa automáticamente después de 1 semana

### Prisma
- **Cliente generado:** `@prisma/client`
- **ORM:** Prisma ORM
- **Migraciones:** Soportadas

---

## 🔐 Seguridad

### Contraseñas
- Las contraseñas se almacenan como hash bcrypt en `passwordHash`
- Nunca almacenes contraseñas en texto plano

### Variables de Entorno
- **NUNCA** commitees `.env.local` al repositorio
- Usa variables de entorno en Vercel para producción

### Roles de Usuario
- **ADMIN:** Acceso completo al panel administrativo
- **EDITOR:** Puede editar perfumes
- **PUBLIC:** Solo lectura

---

## 📞 Contacto y Soporte

### Recursos
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Prisma Docs:** https://www.prisma.io/docs

### Scripts de Utilidad
- `scripts/update-password-completo.sql` - Actualizar contraseña
- `crear_tabla_header_config.sql` - Crear tabla de header
- `agregar_campos_uso.sql` - Agregar campos DIA/NOCHE

---

## ✅ Checklist de Configuración

- [ ] Base de datos creada en Supabase
- [ ] `DATABASE_URL` configurada en Vercel (Session Pooler)
- [ ] Schema de Prisma sincronizado (`npx prisma db push`)
- [ ] Tabla `HeaderConfig` creada (si se usa)
- [ ] Usuario admin creado con contraseña hasheada
- [ ] Variables de entorno configuradas en Vercel
- [ ] Conexión verificada (`/api/perfumes` funciona)
- [ ] Prisma Studio funciona localmente

---

**Última actualización:** 2024
**Versión del Schema:** Prisma (ver `prisma/schema.prisma`)

