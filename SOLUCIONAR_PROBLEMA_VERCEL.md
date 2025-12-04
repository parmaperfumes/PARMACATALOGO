# Solucionar Problema: No se Muestran Perfumes en Vercel

## 🔴 Problema
Los perfumes se muestran correctamente en localhost, pero NO se muestran en Vercel (`parmacatalogo.vercel.app`).

## ✅ Pasos para Diagnosticar y Solucionar

### Paso 1: Verificar Variables de Entorno en Vercel

1. Ve a **Vercel Dashboard**: https://vercel.com/dashboard
2. Selecciona tu proyecto: `parmacatalogo`
3. Ve a **Settings** → **Environment Variables**
4. Verifica que tengas estas variables configuradas:

#### Variables Requeridas:

1. **`DATABASE_URL`**
   - Debe ser la URL del **Session Pooler** (puerto 6543)
   - Formato: `postgresql://postgres.vwmdppmlczmdbfmqbzcr:parmacatalogo123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - **⚠️ IMPORTANTE:** Debe usar puerto **6543** y terminar con `?pgbouncer=true`

2. **`NEXT_PUBLIC_SUPABASE_URL`**
   - Valor: `https://vwmdppmlczmdbfmqbzcr.supabase.co`

3. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   - Obtener desde: Supabase Dashboard → Settings → API → "anon" public key

4. **`NEXTAUTH_URL`**
   - Valor: `https://parmacatalogo.vercel.app`

5. **`NEXTAUTH_SECRET`**
   - Tu secreto de NextAuth

#### Verificar que las Variables Estén en Todos los Ambientes:

- ✅ Production
- ✅ Preview
- ✅ Development

### Paso 2: Verificar que el Proyecto de Supabase Esté Activo

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: `vwmdppmlczmdbfmqbzcr`
3. Si ves "Paused" o "Pausado":
   - Haz clic en **"Restore"** o **"Restaurar"**
   - Espera 1-2 minutos

### Paso 3: Probar la API Directamente

Abre en el navegador:
```
https://parmacatalogo.vercel.app/api/perfumes
```

**Resultados esperados:**

✅ **Si funciona:** Deberías ver un JSON con los perfumes (o `[]` si no hay perfumes)
❌ **Si no funciona:** Verás un error o un objeto con `{ error: "..." }`

### Paso 4: Verificar Logs en Vercel

1. Ve a **Vercel Dashboard** → Tu proyecto → **Deployments**
2. Abre el último deployment
3. Ve a la pestaña **"Functions"** o **"Logs"**
4. Busca errores relacionados con:
   - `DATABASE_URL`
   - `Can't reach database`
   - `Connection error`

### Paso 5: Verificar en la Consola del Navegador

1. Abre `https://parmacatalogo.vercel.app/perfumes`
2. Abre la consola del navegador (F12)
3. Busca mensajes como:
   - `"Perfumes recibidos de la API: X"`
   - `"Error de la API: ..."`
   - `"La API devolvió un array vacío..."`

## 🔧 Soluciones Comunes

### Solución 1: DATABASE_URL Incorrecta

**Síntoma:** La API devuelve `{ error: "DATABASE_URL no configurada" }`

**Solución:**
1. Ve a Supabase Dashboard → Settings → Database
2. Haz clic en **"Connect to your project"**
3. Selecciona **"Session Pooler"** (NO "Direct connection")
4. Copia la URL completa
5. Reemplaza `[YOUR-PASSWORD]` con: `parmacatalogo123`
6. Pega en Vercel como `DATABASE_URL`
7. **Redesplega**

### Solución 2: Proyecto de Supabase Pausado

**Síntoma:** Error "Can't reach database server"

**Solución:**
1. Ve a Supabase Dashboard
2. Haz clic en **"Restore"** si está pausado
3. Espera 1-2 minutos
4. Prueba de nuevo

### Solución 3: Caché de Vercel

**Síntoma:** Los cambios no se reflejan

**Solución:**
1. Ve a **Deployments**
2. Haz clic en los tres puntos (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. O haz un nuevo commit y push

### Solución 4: Falta NEXT_PUBLIC_SUPABASE_ANON_KEY

**Síntoma:** Las imágenes no cargan

**Solución:**
1. Ve a Supabase Dashboard → Settings → API
2. Copia la clave **"anon" public**
3. Agrega en Vercel como `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Redesplega**

## 📋 Checklist de Verificación

- [ ] `DATABASE_URL` está configurada en Vercel (Session Pooler, puerto 6543)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` está configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` está configurada
- [ ] `NEXTAUTH_URL` está configurada
- [ ] Todas las variables están en Production, Preview y Development
- [ ] El proyecto de Supabase está activo (no pausado)
- [ ] `/api/perfumes` devuelve datos (no errores)
- [ ] Se hizo un redeploy después de cambiar variables

## 🐛 Debug Avanzado

### Verificar Conexión a la Base de Datos

Abre en el navegador:
```
https://parmacatalogo.vercel.app/api/test-db
```

Deberías ver:
```json
{
  "success": true,
  "message": "Conexión a la base de datos exitosa"
}
```

### Ver Logs en Tiempo Real

1. Ve a Vercel Dashboard → Tu proyecto
2. Ve a **"Logs"** en el menú lateral
3. Filtra por `/api/perfumes`
4. Revisa los errores

## ✅ Después de Aplicar las Soluciones

1. Haz un **Redeploy** en Vercel
2. Espera 2-3 minutos
3. Abre `https://parmacatalogo.vercel.app/perfumes`
4. Abre la consola del navegador (F12)
5. Verifica que veas: `"Perfumes recibidos de la API: X"` (donde X > 0)
6. Los perfumes deberían aparecer en la página

## 📞 Si el Problema Persiste

1. Revisa los logs de Vercel
2. Revisa la consola del navegador
3. Verifica que `/api/perfumes` devuelva datos
4. Verifica que todas las variables de entorno estén correctas


## 🔴 Problema
Los perfumes se muestran correctamente en localhost, pero NO se muestran en Vercel (`parmacatalogo.vercel.app`).

## ✅ Pasos para Diagnosticar y Solucionar

### Paso 1: Verificar Variables de Entorno en Vercel

1. Ve a **Vercel Dashboard**: https://vercel.com/dashboard
2. Selecciona tu proyecto: `parmacatalogo`
3. Ve a **Settings** → **Environment Variables**
4. Verifica que tengas estas variables configuradas:

#### Variables Requeridas:

1. **`DATABASE_URL`**
   - Debe ser la URL del **Session Pooler** (puerto 6543)
   - Formato: `postgresql://postgres.vwmdppmlczmdbfmqbzcr:parmacatalogo123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - **⚠️ IMPORTANTE:** Debe usar puerto **6543** y terminar con `?pgbouncer=true`

2. **`NEXT_PUBLIC_SUPABASE_URL`**
   - Valor: `https://vwmdppmlczmdbfmqbzcr.supabase.co`

3. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   - Obtener desde: Supabase Dashboard → Settings → API → "anon" public key

4. **`NEXTAUTH_URL`**
   - Valor: `https://parmacatalogo.vercel.app`

5. **`NEXTAUTH_SECRET`**
   - Tu secreto de NextAuth

#### Verificar que las Variables Estén en Todos los Ambientes:

- ✅ Production
- ✅ Preview
- ✅ Development

### Paso 2: Verificar que el Proyecto de Supabase Esté Activo

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: `vwmdppmlczmdbfmqbzcr`
3. Si ves "Paused" o "Pausado":
   - Haz clic en **"Restore"** o **"Restaurar"**
   - Espera 1-2 minutos

### Paso 3: Probar la API Directamente

Abre en el navegador:
```
https://parmacatalogo.vercel.app/api/perfumes
```

**Resultados esperados:**

✅ **Si funciona:** Deberías ver un JSON con los perfumes (o `[]` si no hay perfumes)
❌ **Si no funciona:** Verás un error o un objeto con `{ error: "..." }`

### Paso 4: Verificar Logs en Vercel

1. Ve a **Vercel Dashboard** → Tu proyecto → **Deployments**
2. Abre el último deployment
3. Ve a la pestaña **"Functions"** o **"Logs"**
4. Busca errores relacionados con:
   - `DATABASE_URL`
   - `Can't reach database`
   - `Connection error`

### Paso 5: Verificar en la Consola del Navegador

1. Abre `https://parmacatalogo.vercel.app/perfumes`
2. Abre la consola del navegador (F12)
3. Busca mensajes como:
   - `"Perfumes recibidos de la API: X"`
   - `"Error de la API: ..."`
   - `"La API devolvió un array vacío..."`

## 🔧 Soluciones Comunes

### Solución 1: DATABASE_URL Incorrecta

**Síntoma:** La API devuelve `{ error: "DATABASE_URL no configurada" }`

**Solución:**
1. Ve a Supabase Dashboard → Settings → Database
2. Haz clic en **"Connect to your project"**
3. Selecciona **"Session Pooler"** (NO "Direct connection")
4. Copia la URL completa
5. Reemplaza `[YOUR-PASSWORD]` con: `parmacatalogo123`
6. Pega en Vercel como `DATABASE_URL`
7. **Redesplega**

### Solución 2: Proyecto de Supabase Pausado

**Síntoma:** Error "Can't reach database server"

**Solución:**
1. Ve a Supabase Dashboard
2. Haz clic en **"Restore"** si está pausado
3. Espera 1-2 minutos
4. Prueba de nuevo

### Solución 3: Caché de Vercel

**Síntoma:** Los cambios no se reflejan

**Solución:**
1. Ve a **Deployments**
2. Haz clic en los tres puntos (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. O haz un nuevo commit y push

### Solución 4: Falta NEXT_PUBLIC_SUPABASE_ANON_KEY

**Síntoma:** Las imágenes no cargan

**Solución:**
1. Ve a Supabase Dashboard → Settings → API
2. Copia la clave **"anon" public**
3. Agrega en Vercel como `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Redesplega**

## 📋 Checklist de Verificación

- [ ] `DATABASE_URL` está configurada en Vercel (Session Pooler, puerto 6543)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` está configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` está configurada
- [ ] `NEXTAUTH_URL` está configurada
- [ ] Todas las variables están en Production, Preview y Development
- [ ] El proyecto de Supabase está activo (no pausado)
- [ ] `/api/perfumes` devuelve datos (no errores)
- [ ] Se hizo un redeploy después de cambiar variables

## 🐛 Debug Avanzado

### Verificar Conexión a la Base de Datos

Abre en el navegador:
```
https://parmacatalogo.vercel.app/api/test-db
```

Deberías ver:
```json
{
  "success": true,
  "message": "Conexión a la base de datos exitosa"
}
```

### Ver Logs en Tiempo Real

1. Ve a Vercel Dashboard → Tu proyecto
2. Ve a **"Logs"** en el menú lateral
3. Filtra por `/api/perfumes`
4. Revisa los errores

## ✅ Después de Aplicar las Soluciones

1. Haz un **Redeploy** en Vercel
2. Espera 2-3 minutos
3. Abre `https://parmacatalogo.vercel.app/perfumes`
4. Abre la consola del navegador (F12)
5. Verifica que veas: `"Perfumes recibidos de la API: X"` (donde X > 0)
6. Los perfumes deberían aparecer en la página

## 📞 Si el Problema Persiste

1. Revisa los logs de Vercel
2. Revisa la consola del navegador
3. Verifica que `/api/perfumes` devuelva datos
4. Verifica que todas las variables de entorno estén correctas




































