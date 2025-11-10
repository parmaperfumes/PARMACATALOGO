# Configurar DATABASE_URL en Vercel - Guía Completa

## 🔴 Problema: "Can't reach database server" o "Not IPv4 compatible"

Vercel usa redes IPv4, pero la conexión directa de Supabase (puerto 5432) requiere IPv6. Por eso necesitas usar **Session Pooler** (puerto 6543).

## ✅ Solución: Usar Session Pooler

### Paso 1: Obtener la Connection String del Session Pooler

1. Ve a **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecciona tu proyecto: `vwmdppmlczmdbfmqbzcr`
3. Haz clic en **Settings** (⚙️) → **Database**
4. Busca la sección **"Connection string"** o haz clic en **"Connect to your project"**
5. En el modal que aparece:
   - Selecciona la pestaña **"Connection String"**
   - En el dropdown **"Method"**, selecciona **"Session Pooler"** (NO "Direct connection")
   - Copia la URL que aparece

La URL debería verse así:
```
postgresql://postgres.vwmdppmlczmdbfmqbzcr:TU_CONTRASEÑA@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

O si usas el formato con contraseña en la URL:
```
postgresql://postgres.vwmdppmlczmdbfmqbzcr:parmacatalogo123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**⚠️ IMPORTANTE:**
- Debe usar el puerto **6543** (Session Pooler)
- Debe incluir `?pgbouncer=true` al final
- La región puede variar (us-east-1, eu-west-1, etc.) - usa la que aparezca en tu modal

### Paso 2: Si no conoces la contraseña

1. En Supabase Dashboard → **Settings** → **Database**
2. Busca **"Database password"** o **"Reset database password"**
3. Haz clic en **"Reset password"** o **"Generate new password"**
4. **IMPORTANTE:** Copia la contraseña inmediatamente (solo se muestra una vez)
5. La contraseña actual es: `parmacatalogo123`

### Paso 3: Configurar en Vercel

1. Ve a **Vercel Dashboard**: https://vercel.com/dashboard
2. Selecciona tu proyecto: `parmacatalogo-wse4`
3. Ve a **Settings** → **Environment Variables**
4. Busca `DATABASE_URL`:
   - Si **existe**: Haz clic en los tres puntos (⋯) → **"Edit"**
   - Si **NO existe**: Haz clic en **"Add New"**
5. Configura:
   - **Key**: `DATABASE_URL`
   - **Value**: Pega la URL del Session Pooler que copiaste (debe empezar con `postgresql://`)
   - **Environments**: Selecciona todos:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
6. Haz clic en **"Save"**

### Paso 4: Verificar que no haya errores

Asegúrate de que:
- ✅ No haya espacios antes o después de la URL
- ✅ La URL empiece exactamente con `postgresql://`
- ✅ Use el puerto **6543** (no 5432)
- ✅ Incluya `?pgbouncer=true` al final
- ✅ La contraseña esté correcta

### Paso 5: Redeploy

1. Ve a la pestaña **"Deployments"**
2. Haz clic en los tres puntos (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. Espera 2-3 minutos a que termine

### Paso 6: Verificar que funciona

1. Abre: `https://parmacatalogo-wse4.vercel.app/api/perfumes`
2. Deberías ver un JSON con tus perfumes (no un error)

## 📋 Formato Correcto de DATABASE_URL para Vercel

```
postgresql://postgres.vwmdppmlczmdbfmqbzcr:parmacatalogo123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Partes importantes:**
- `postgresql://` → Protocolo (obligatorio)
- `postgres.vwmdppmlczmdbfmqbzcr` → Usuario con formato pooler
- `parmacatalogo123` → Contraseña
- `aws-0-us-east-1.pooler.supabase.com` → Servidor del pooler
- `6543` → Puerto del Session Pooler (NO 5432)
- `postgres` → Base de datos
- `?pgbouncer=true` → Parámetro necesario para pooler

## 🔍 Diferencias entre Conexión Directa y Session Pooler

### ❌ Conexión Directa (puerto 5432) - NO funciona en Vercel
```
postgresql://postgres:parmacatalogo123@db.vwmdppmlczmdbfmqbzcr.supabase.co:5432/postgres
```
- Requiere IPv6
- Vercel usa IPv4 → **NO funciona**

### ✅ Session Pooler (puerto 6543) - Funciona en Vercel
```
postgresql://postgres.vwmdppmlczmdbfmqbzcr:parmacatalogo123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```
- Compatible con IPv4
- Vercel puede conectarse → **Funciona**

## 🐛 Solución de Problemas

### Error: "Can't reach database server"
- ✅ Verifica que uses Session Pooler (puerto 6543)
- ✅ Verifica que el proyecto de Supabase esté activo (no pausado)
- ✅ Verifica que la URL no tenga espacios

### Error: "the URL must start with the protocol `postgresql://`"
- ✅ Verifica que la URL empiece exactamente con `postgresql://`
- ✅ No debe haber espacios antes de la URL
- ✅ Verifica que copiaste la URL completa

### Error: "Invalid connection string"
- ✅ Verifica que incluya `?pgbouncer=true` al final
- ✅ Verifica que la contraseña esté correcta
- ✅ Verifica que no haya caracteres especiales sin codificar

### Error: "FATAL: Tenant or user not found"
- ✅ **PROBLEMA:** El formato del usuario en la URL es incorrecto
- ✅ **SOLUCIÓN:** Asegúrate de copiar la URL EXACTA desde Supabase
- ✅ El usuario debe ser: `postgres.vwmdppmlczmdbfmqbzcr` (con el punto y el project-ref)
- ✅ NO uses solo `postgres` como usuario
- ✅ Vuelve a Supabase → "Connect to your project" → Session Pooler y copia la URL completa
- ✅ Verifica que la URL tenga este formato exacto:
  ```
  postgresql://postgres.vwmdppmlczmdbfmqbzcr:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
  ```

## 📝 Notas Importantes

1. **Para desarrollo local**: Puedes usar la conexión directa (puerto 5432) en `.env.local`
2. **Para Vercel (producción)**: DEBES usar Session Pooler (puerto 6543)
3. **Contraseña**: Si cambias la contraseña en Supabase, actualiza también `DATABASE_URL` en Vercel
4. **Región**: La región en la URL puede variar según tu proyecto (us-east-1, eu-west-1, etc.)

## ✅ Checklist Final

- [ ] Obtuve la Connection String del Session Pooler desde Supabase
- [ ] Configuré `DATABASE_URL` en Vercel con el formato correcto
- [ ] La URL usa el puerto 6543 (no 5432)
- [ ] La URL incluye `?pgbouncer=true` al final
- [ ] Seleccioné todos los ambientes (Production, Preview, Development)
- [ ] Hice un Redeploy en Vercel
- [ ] Verifiqué que `/api/perfumes` devuelve datos (no errores)

