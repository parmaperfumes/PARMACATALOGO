# Obtener la DATABASE_URL Correcta para Vercel

## ⚠️ IMPORTANTE: La URL que tienes NO funciona en Vercel

La URL que tienes:
```
postgresql://postgres:[YOUR_PASSWORD]@db.vwmdppmlczmdbfmqbzcr.supabase.co:5432/postgres
```

**Es una conexión directa (puerto 5432) que NO funciona en Vercel.**

## ✅ Solución: Usar Session Pooler (puerto 6543)

### Paso 1: Obtener la URL del Session Pooler desde Supabase

1. Ve a **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecciona tu proyecto: `vwmdppmlczmdbfmqbzcr`
3. Haz clic en **Settings** (⚙️) en el menú lateral
4. Haz clic en **Database**
5. Busca la sección **"Connection string"** o haz clic en el botón **"Connect to your project"**
6. Se abrirá un modal con opciones de conexión
7. En el modal:
   - **Pestaña:** "Connection String" (si hay varias pestañas)
   - **Type:** "URI" (si hay opciones)
   - **Source:** "Primary Database" (si hay opciones)
   - **Method:** Selecciona **"Session Pooler"** ← **MUY IMPORTANTE**
   - **NO selecciones "Direct connection"**

8. Verás una URL que se ve así:
   ```
   postgresql://postgres.vwmdppmlczmdbfmqbzcr:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

### Paso 2: Diferencias Clave

**❌ Conexión Directa (NO funciona en Vercel):**
```
postgresql://postgres:[PASSWORD]@db.vwmdppmlczmdbfmqbzcr.supabase.co:5432/postgres
```
- Usuario: `postgres` (sin project-ref)
- Servidor: `db.vwmdppmlczmdbfmqbzcr.supabase.co`
- Puerto: `5432`
- ❌ No funciona en Vercel (requiere IPv6)

**✅ Session Pooler (SÍ funciona en Vercel):**
```
postgresql://postgres.vwmdppmlczmdbfmqbzcr:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```
- Usuario: `postgres.vwmdppmlczmdbfmqbzcr` (con punto y project-ref)
- Servidor: `aws-0-us-east-1.pooler.supabase.com` (formato pooler)
- Puerto: `6543` (Session Pooler)
- Parámetro: `?pgbouncer=true` al final
- ✅ Funciona en Vercel (compatible con IPv4)

### Paso 3: Reemplazar la Contraseña

Una vez que tengas la URL del Session Pooler:

1. Reemplaza `[YOUR-PASSWORD]` o `[YOUR-PASSWORD]` con: `parmacatalogo123`
2. La URL final debería verse así:
   ```
   postgresql://postgres.vwmdppmlczmdbfmqbzcr:parmacatalogo123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

**Nota:** La región puede variar (`us-east-1`, `eu-west-1`, etc.). Usa la que aparezca en tu modal.

### Paso 4: Configurar en Vercel

1. Ve a **Vercel Dashboard**: https://vercel.com/dashboard
2. Selecciona tu proyecto: `parmacatalogo`
3. Ve a **Settings** → **Environment Variables**
4. Busca `DATABASE_URL`:
   - Si existe: Haz clic en los tres puntos (⋯) → **"Edit"**
   - Si no existe: Haz clic en **"Add New"**
5. **Borra completamente** la URL anterior (si existe)
6. Pega la nueva URL del Session Pooler (con la contraseña reemplazada)
7. Verifica que:
   - ✅ No haya espacios antes o después
   - ✅ Empiece con `postgresql://`
   - ✅ El usuario sea `postgres.vwmdppmlczmdbfmqbzcr` (con el punto)
   - ✅ El servidor sea `aws-0-[REGION].pooler.supabase.com`
   - ✅ El puerto sea `6543`
   - ✅ Termine con `?pgbouncer=true`
8. Asegúrate de que esté configurada para:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
9. Haz clic en **"Save"**

### Paso 5: Redesplegar

1. Ve a **Deployments**
2. Haz clic en los tres puntos (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. Espera 2-3 minutos

### Paso 6: Verificar

Abre en el navegador:
```
https://parmacatalogo.vercel.app/api/perfumes
```

**Deberías ver:**
- ✅ Un JSON con los perfumes (o `[]` si no hay perfumes)
- ❌ NO deberías ver el error "FATAL: Tenant or user not found"

## 📋 Checklist

- [ ] Obtuve la URL desde Supabase usando "Session Pooler" (NO "Direct connection")
- [ ] El usuario es `postgres.vwmdppmlczmdbfmqbzcr` (con el punto)
- [ ] El servidor es `aws-0-[REGION].pooler.supabase.com` (formato pooler)
- [ ] El puerto es `6543` (NO 5432)
- [ ] Incluye `?pgbouncer=true` al final
- [ ] Reemplacé `[YOUR-PASSWORD]` con `parmacatalogo123`
- [ ] Configuré la URL en Vercel sin espacios
- [ ] Seleccioné todos los ambientes (Production, Preview, Development)
- [ ] Hice un Redeploy
- [ ] Verifiqué que `/api/perfumes` funciona

## 🔍 Si No Encuentras la Opción "Session Pooler"

1. Asegúrate de estar en **Settings** → **Database**
2. Busca el botón **"Connect to your project"** o **"Connection string"**
3. En el modal, busca un dropdown o selector que diga **"Method"** o **"Connection mode"**
4. Selecciona **"Session Pooler"** o **"Connection Pooling"**
5. Si no aparece, intenta hacer scroll en el modal o busca otras pestañas

## 💡 Tip Importante

**NO uses la URL de conexión directa** (`db.vwmdppmlczmdbfmqbzcr.supabase.co:5432`) en Vercel. Siempre usa Session Pooler (`pooler.supabase.com:6543`) para producción.

