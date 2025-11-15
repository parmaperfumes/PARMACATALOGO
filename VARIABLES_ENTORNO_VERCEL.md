# Variables de Entorno en Vercel - Guía Completa

## 📋 Variables que NO Cambian con el Dominio

### 1. `DATABASE_URL`
**NO cambia** - Es la conexión a Supabase (base de datos), independiente del dominio.

**Valor correcto (Session Pooler):**
```
postgresql://postgres.vwmdppmlczmdbfmqbzcr:parmacatalogo123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 2. `NEXT_PUBLIC_SUPABASE_URL`
**NO cambia** - Es la URL de tu proyecto Supabase.

**Valor:**
```
https://vwmdppmlczmdbfmqbzcr.supabase.co
```

### 3. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**NO cambia** - Es la clave pública de Supabase.

**Valor:** (Obtener desde Supabase Dashboard → Settings → API → "anon" public key)

### 4. `NEXTAUTH_SECRET`
**NO cambia** - Es tu secreto de NextAuth.

---

## ✅ Variables que SÍ Cambian con el Dominio

### 1. `NEXTAUTH_URL`
**SÍ cambia** - Debe ser el dominio de tu aplicación en Vercel.

**Valor actual (nuevo dominio):**
```
https://parmacatalogo.vercel.app
```

**Valor anterior (si tenías otro):**
```
https://parmacatalogo-wse4.vercel.app
```
(Reemplazar con el nuevo)

---

## 🔧 Configuración Completa en Vercel

### Paso 1: Verificar Todas las Variables

Ve a **Vercel Dashboard** → Tu proyecto → **Settings** → **Environment Variables**

### Variables Requeridas:

1. **`DATABASE_URL`**
   - Valor: `postgresql://postgres.vwmdppmlczmdbfmqbzcr:parmacatalogo123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - ⚠️ Debe usar **Session Pooler** (puerto 6543)
   - ⚠️ Usuario debe ser `postgres.vwmdppmlczmdbfmqbzcr` (con el punto)

2. **`NEXT_PUBLIC_SUPABASE_URL`**
   - Valor: `https://vwmdppmlczmdbfmqbzcr.supabase.co`
   - ⚠️ NO cambia con el dominio de Vercel

3. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   - Valor: (Obtener desde Supabase Dashboard → Settings → API)
   - ⚠️ NO cambia con el dominio de Vercel

4. **`NEXTAUTH_URL`** ← **ESTA SÍ DEBE ACTUALIZARSE**
   - Valor: `https://parmacatalogo.vercel.app`
   - ⚠️ Debe coincidir con tu dominio actual en Vercel

5. **`NEXTAUTH_SECRET`**
   - Valor: (Tu secreto de NextAuth)
   - ⚠️ NO cambia con el dominio de Vercel

### Paso 2: Actualizar `NEXTAUTH_URL`

1. Busca `NEXTAUTH_URL` en las variables de entorno
2. Haz clic en **"Edit"**
3. Cambia el valor a: `https://parmacatalogo.vercel.app`
4. Verifica que esté configurada para:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Guarda los cambios

### Paso 3: Verificar `DATABASE_URL`

Asegúrate de que `DATABASE_URL` use **Session Pooler**:

1. Busca `DATABASE_URL`
2. Verifica que:
   - ✅ Usuario: `postgres.vwmdppmlczmdbfmqbzcr` (con el punto)
   - ✅ Puerto: `6543` (NO 5432)
   - ✅ Servidor: `aws-0-[REGION].pooler.supabase.com`
   - ✅ Termina con: `?pgbouncer=true`

Si NO tiene este formato, sigue las instrucciones en `OBTENER_DATABASE_URL_CORRECTA.md`

### Paso 4: Redesplegar

1. Ve a **Deployments**
2. Haz clic en los tres puntos (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. Espera 2-3 minutos

---

## 📋 Checklist Final

- [ ] `DATABASE_URL` usa Session Pooler (puerto 6543, usuario con punto)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` está configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` está configurada
- [ ] `NEXTAUTH_URL` = `https://parmacatalogo.vercel.app` ← **ACTUALIZADA**
- [ ] `NEXTAUTH_SECRET` está configurada
- [ ] Todas las variables están en Production, Preview y Development
- [ ] Se hizo un Redeploy después de los cambios

---

## 🔍 Resumen

| Variable | ¿Cambia con el dominio? | Valor |
|----------|-------------------------|-------|
| `DATABASE_URL` | ❌ NO | `postgresql://postgres.vwmdppmlczmdbfmqbzcr:...@...pooler.supabase.com:6543/...` |
| `NEXT_PUBLIC_SUPABASE_URL` | ❌ NO | `https://vwmdppmlczmdbfmqbzcr.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ NO | (Clave de Supabase) |
| `NEXTAUTH_URL` | ✅ **SÍ** | `https://parmacatalogo.vercel.app` |
| `NEXTAUTH_SECRET` | ❌ NO | (Tu secreto) |

---

## ⚠️ Importante

- **`DATABASE_URL`** es la conexión a Supabase, NO tiene nada que ver con Vercel
- **`NEXTAUTH_URL`** es la URL de tu aplicación, SÍ debe coincidir con tu dominio en Vercel
- Si cambias el dominio de Vercel, solo necesitas actualizar `NEXTAUTH_URL`


## 📋 Variables que NO Cambian con el Dominio

### 1. `DATABASE_URL`
**NO cambia** - Es la conexión a Supabase (base de datos), independiente del dominio.

**Valor correcto (Session Pooler):**
```
postgresql://postgres.vwmdppmlczmdbfmqbzcr:parmacatalogo123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 2. `NEXT_PUBLIC_SUPABASE_URL`
**NO cambia** - Es la URL de tu proyecto Supabase.

**Valor:**
```
https://vwmdppmlczmdbfmqbzcr.supabase.co
```

### 3. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**NO cambia** - Es la clave pública de Supabase.

**Valor:** (Obtener desde Supabase Dashboard → Settings → API → "anon" public key)

### 4. `NEXTAUTH_SECRET`
**NO cambia** - Es tu secreto de NextAuth.

---

## ✅ Variables que SÍ Cambian con el Dominio

### 1. `NEXTAUTH_URL`
**SÍ cambia** - Debe ser el dominio de tu aplicación en Vercel.

**Valor actual (nuevo dominio):**
```
https://parmacatalogo.vercel.app
```

**Valor anterior (si tenías otro):**
```
https://parmacatalogo-wse4.vercel.app
```
(Reemplazar con el nuevo)

---

## 🔧 Configuración Completa en Vercel

### Paso 1: Verificar Todas las Variables

Ve a **Vercel Dashboard** → Tu proyecto → **Settings** → **Environment Variables**

### Variables Requeridas:

1. **`DATABASE_URL`**
   - Valor: `postgresql://postgres.vwmdppmlczmdbfmqbzcr:parmacatalogo123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - ⚠️ Debe usar **Session Pooler** (puerto 6543)
   - ⚠️ Usuario debe ser `postgres.vwmdppmlczmdbfmqbzcr` (con el punto)

2. **`NEXT_PUBLIC_SUPABASE_URL`**
   - Valor: `https://vwmdppmlczmdbfmqbzcr.supabase.co`
   - ⚠️ NO cambia con el dominio de Vercel

3. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   - Valor: (Obtener desde Supabase Dashboard → Settings → API)
   - ⚠️ NO cambia con el dominio de Vercel

4. **`NEXTAUTH_URL`** ← **ESTA SÍ DEBE ACTUALIZARSE**
   - Valor: `https://parmacatalogo.vercel.app`
   - ⚠️ Debe coincidir con tu dominio actual en Vercel

5. **`NEXTAUTH_SECRET`**
   - Valor: (Tu secreto de NextAuth)
   - ⚠️ NO cambia con el dominio de Vercel

### Paso 2: Actualizar `NEXTAUTH_URL`

1. Busca `NEXTAUTH_URL` en las variables de entorno
2. Haz clic en **"Edit"**
3. Cambia el valor a: `https://parmacatalogo.vercel.app`
4. Verifica que esté configurada para:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Guarda los cambios

### Paso 3: Verificar `DATABASE_URL`

Asegúrate de que `DATABASE_URL` use **Session Pooler**:

1. Busca `DATABASE_URL`
2. Verifica que:
   - ✅ Usuario: `postgres.vwmdppmlczmdbfmqbzcr` (con el punto)
   - ✅ Puerto: `6543` (NO 5432)
   - ✅ Servidor: `aws-0-[REGION].pooler.supabase.com`
   - ✅ Termina con: `?pgbouncer=true`

Si NO tiene este formato, sigue las instrucciones en `OBTENER_DATABASE_URL_CORRECTA.md`

### Paso 4: Redesplegar

1. Ve a **Deployments**
2. Haz clic en los tres puntos (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. Espera 2-3 minutos

---

## 📋 Checklist Final

- [ ] `DATABASE_URL` usa Session Pooler (puerto 6543, usuario con punto)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` está configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` está configurada
- [ ] `NEXTAUTH_URL` = `https://parmacatalogo.vercel.app` ← **ACTUALIZADA**
- [ ] `NEXTAUTH_SECRET` está configurada
- [ ] Todas las variables están en Production, Preview y Development
- [ ] Se hizo un Redeploy después de los cambios

---

## 🔍 Resumen

| Variable | ¿Cambia con el dominio? | Valor |
|----------|-------------------------|-------|
| `DATABASE_URL` | ❌ NO | `postgresql://postgres.vwmdppmlczmdbfmqbzcr:...@...pooler.supabase.com:6543/...` |
| `NEXT_PUBLIC_SUPABASE_URL` | ❌ NO | `https://vwmdppmlczmdbfmqbzcr.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ NO | (Clave de Supabase) |
| `NEXTAUTH_URL` | ✅ **SÍ** | `https://parmacatalogo.vercel.app` |
| `NEXTAUTH_SECRET` | ❌ NO | (Tu secreto) |

---

## ⚠️ Importante

- **`DATABASE_URL`** es la conexión a Supabase, NO tiene nada que ver con Vercel
- **`NEXTAUTH_URL`** es la URL de tu aplicación, SÍ debe coincidir con tu dominio en Vercel
- Si cambias el dominio de Vercel, solo necesitas actualizar `NEXTAUTH_URL`























