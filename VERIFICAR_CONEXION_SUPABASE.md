# Verificar Conexión a Supabase

## 🔴 Error: "No se puede conectar a la base de datos"

Este error puede tener varias causas. Sigue estos pasos:

## ✅ Paso 1: Verificar que el Proyecto de Supabase esté Activo

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: `catalogo-parma` o `vwmdppmlczmdbfmqbzcr`
3. **IMPORTANTE:** Si ves un mensaje de "Paused" o "Pausado":
   - Haz clic en **"Restore"** o **"Restaurar"**
   - Espera 1-2 minutos a que el proyecto se reactive
   - Los proyectos gratuitos de Supabase se pausan automáticamente después de inactividad

## ✅ Paso 2: Verificar la Connection String

1. En Supabase Dashboard, ve a **Settings** (⚙️) > **Database**
2. Busca la sección **Connection string**
3. Selecciona la pestaña **URI** (no Transaction Pooler)
4. Verifica que la URL sea similar a:
   ```
   postgresql://postgres:[PASSWORD]@db.vwmdppmlczmdbfmqbzcr.supabase.co:5432/postgres
   ```

## ✅ Paso 3: Verificar la Contraseña

La contraseña configurada es: `parmacatalogo123`

Verifica que en `.env.local` tengas:
```env
   DATABASE_URL="postgresql://postgres:parmacatalogo123@db.vwmdppmlczmdbfmqbzcr.supabase.co:6543/postgres?pgbouncer=true"
```

## ✅ Paso 4: Probar la Conexión

Si el proyecto estaba pausado y lo reactivaste:
1. Espera 1-2 minutos
2. Reinicia el servidor de Next.js
3. Intenta guardar un perfume de nuevo

## 🔧 Solución Rápida

Si el proyecto está pausado:
1. Ve a Supabase Dashboard
2. Haz clic en "Restore" o "Restaurar"
3. Espera 1-2 minutos
4. Reinicia el servidor: Detén (Ctrl+C) y ejecuta `npx next dev -p 3001`
5. Intenta guardar de nuevo

