# Solución: Error "FATAL: Tenant or user not found"

## 🔴 Error que estás viendo

```
FATAL: Tenant or user not found
```

Este error aparece cuando el formato del usuario en la `DATABASE_URL` del Session Pooler es incorrecto.

## ✅ Solución Paso a Paso

### Paso 1: Obtener la URL Correcta desde Supabase

1. Ve a **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecciona tu proyecto: `vwmdppmlczmdbfmqbzcr`
3. Haz clic en **Settings** (⚙️) → **Database**
4. Haz clic en **"Connect to your project"** (o busca "Connection string")
5. En el modal que aparece:
   - Pestaña: **"Connection String"**
   - Type: **"URI"**
   - Source: **"Primary Database"**
   - **Method: "Session Pooler"** ← **MUY IMPORTANTE**
6. **Copia la URL COMPLETA que aparece** (no la modifiques)

### Paso 2: Verificar el Formato Correcto

La URL debe tener este formato exacto:

```
postgresql://postgres.vwmdppmlczmdbfmqbzcr:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Partes importantes:**
- ✅ Usuario: `postgres.vwmdppmlczmdbfmqbzcr` (con el punto y el project-ref)
- ✅ Puerto: `6543` (Session Pooler)
- ✅ Servidor: `aws-0-[REGION].pooler.supabase.com` (formato pooler)
- ✅ Parámetro: `?pgbouncer=true` al final

### Paso 3: Reemplazar la Contraseña

Si la URL que copiaste tiene `[YOUR_PASSWORD]`, reemplázala con tu contraseña real: `parmacatalogo123`

Ejemplo final:
```
postgresql://postgres.vwmdppmlczmdbfmqbzcr:parmacatalogo123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Paso 4: Configurar en Vercel

1. Ve a **Vercel Dashboard** → Tu proyecto → **Settings** → **Environment Variables**
2. Busca `DATABASE_URL` y haz clic en **"Edit"**
3. **Borra completamente** la URL anterior
4. Pega la URL correcta que copiaste desde Supabase (con la contraseña reemplazada)
5. Verifica que:
   - ✅ No haya espacios antes o después
   - ✅ Empiece con `postgresql://`
   - ✅ El usuario sea `postgres.vwmdppmlczmdbfmqbzcr` (con el punto)
   - ✅ Use puerto `6543`
   - ✅ Incluya `?pgbouncer=true` al final
6. Guarda los cambios

### Paso 5: Redeploy

1. Ve a **Deployments**
2. Haz clic en los tres puntos (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. Espera 2-3 minutos

### Paso 6: Verificar

1. Abre: `https://parmacatalogo-wse4.vercel.app/api/perfumes`
2. Deberías ver un JSON con perfumes (no un error)

## ❌ Errores Comunes

### Error 1: Usuario incorrecto
```
❌ postgresql://postgres:password@...
✅ postgresql://postgres.vwmdppmlczmdbfmqbzcr:password@...
```
**Solución:** El usuario debe incluir el project-ref después del punto

### Error 2: Puerto incorrecto (MUY COMÚN)
```
❌ postgresql://...@aws-1-us-east-1.pooler.supabase.com:5432/postgres
✅ postgresql://...@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```
**Solución:** 
- Session Pooler usa puerto **6543**, NO 5432
- Debe incluir `?pgbouncer=true` al final
- Si ves puerto 5432 en la URL del pooler, cámbialo a 6543

### Error 3: Falta el parámetro pgbouncer
```
❌ postgresql://...:6543/postgres
✅ postgresql://...:6543/postgres?pgbouncer=true
```
**Solución:** Debe incluir `?pgbouncer=true` al final

### Error 3: Falta el parámetro pgbouncer
```
❌ postgresql://...:6543/postgres
✅ postgresql://...:6543/postgres?pgbouncer=true
```
**Solución:** Debe incluir `?pgbouncer=true` al final

### Error 4: Servidor incorrecto
```
❌ postgresql://...@db.vwmdppmlczmdbfmqbzcr.supabase.co:6543/...
✅ postgresql://...@aws-0-us-east-1.pooler.supabase.com:6543/...
```
**Solución:** Session Pooler usa un servidor diferente (pooler.supabase.com)

## 📋 Checklist

- [ ] Obtuve la URL desde Supabase usando "Session Pooler"
- [ ] El usuario es `postgres.vwmdppmlczmdbfmqbzcr` (con el punto)
- [ ] El puerto es `6543`
- [ ] El servidor es `aws-0-[REGION].pooler.supabase.com`
- [ ] Incluye `?pgbouncer=true` al final
- [ ] Reemplacé `[YOUR_PASSWORD]` con la contraseña real
- [ ] Configuré la URL en Vercel sin espacios
- [ ] Hice un Redeploy
- [ ] Verifiqué que `/api/perfumes` funciona

## 💡 Tip Importante

**NO construyas la URL manualmente.** Siempre copia la URL completa desde Supabase Dashboard y solo reemplaza la contraseña si es necesario. Esto asegura que el formato sea correcto.

