# Solucionar Error de Conexión a la Base de Datos

## 🔴 Error: "Can't reach database server"

Este error significa que la aplicación no puede conectarse a Supabase. Sigue estos pasos:

## ✅ Paso 1: Verificar que el Proyecto de Supabase esté Activo

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: `vwmdppmlczmdbfmqbzcr`
3. Si ves un mensaje de "Paused" o "Pausado", haz clic en **Restore** o **Restaurar**
4. Espera unos minutos a que el proyecto se reactive

## ✅ Paso 2: Obtener la Connection String Correcta

### Para Vercel (Producción) - Usar Session Pooler

1. En Supabase Dashboard, ve a **Settings** (⚙️) > **Database**
2. Haz clic en **"Connect to your project"** o busca **"Connection string"**
3. En el modal que aparece:
   - Selecciona la pestaña **"Connection String"**
   - En el dropdown **"Method"**, selecciona **"Session Pooler"** (NO "Direct connection")
   - Copia la URL completa
4. La URL debería verse así:
   ```
   postgresql://postgres.vwmdppmlczmdbfmqbzcr:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
   **⚠️ IMPORTANTE:** Debe usar puerto **6543** y incluir `?pgbouncer=true`

### Para Desarrollo Local - Puedes usar conexión directa

```
postgresql://postgres:[PASSWORD]@db.vwmdppmlczmdbfmqbzcr.supabase.co:5432/postgres
```

## ✅ Paso 3: Obtener o Resetear la Contraseña

### Si NO conoces la contraseña:

1. Ve a **Settings** > **Database**
2. Busca **Database password** o **Reset database password**
3. Haz clic en **Reset password** o **Generate new password**
4. **IMPORTANTE:** Copia la contraseña inmediatamente (solo se muestra una vez)
5. Si la contraseña tiene caracteres especiales (como `@`, `#`, `$`, etc.), necesitarás codificarla en la URL

### Codificar caracteres especiales en la URL:

Si tu contraseña tiene caracteres especiales, reemplázalos así:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `/` → `%2F`
- `?` → `%3F`

**Ejemplo:**
- Contraseña: `Mi@Pass#123`
- En la URL: `Mi%40Pass%23123`

## ✅ Paso 4: Actualizar .env.local

Abre el archivo `.env.local` en la raíz del proyecto y actualiza o agrega:

```env
DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA_CODIFICADA@db.vwmdppmlczmdbfmqbzcr.supabase.co:5432/postgres"
```

**Reemplaza `TU_CONTRASEÑA_CODIFICADA` con tu contraseña (codificada si tiene caracteres especiales).**

## ✅ Paso 5: Verificar la Conexión

Ejecuta este comando para probar la conexión:

```bash
npx prisma db pull
```

Si funciona, verás las tablas de tu base de datos.

## ✅ Paso 6: Crear las Tablas (si no existen)

Si las tablas no existen, ejecuta:

```bash
npx prisma db push
```

O crea las tablas manualmente ejecutando el script SQL `crear_tablas_y_agregar_subtitulo.sql` en Supabase SQL Editor.

## ✅ Paso 7: Reiniciar el Servidor

Después de actualizar `.env.local`:

1. Detén el servidor (Ctrl+C)
2. Reinicia el servidor:
   ```bash
   npx next dev -p 3001
   ```

## 🔍 Verificar que Funciona

1. Ve a `/admin` en tu aplicación
2. Intenta guardar un perfume
3. Si se guarda correctamente, ¡está funcionando!

## ⚠️ Si Sigue Sin Funcionar

1. **Para Vercel:** DEBES usar Session Pooler (puerto 6543), NO la conexión directa (puerto 5432)
2. Verifica que no haya espacios extra en `DATABASE_URL`
3. Verifica que la contraseña esté correctamente codificada
4. Verifica que el proyecto de Supabase esté activo (no pausado)
5. Verifica que la URL incluya `?pgbouncer=true` al final (para Session Pooler)
6. Ver guía completa en: `CONFIGURAR_DATABASE_URL_VERCEL.md`

