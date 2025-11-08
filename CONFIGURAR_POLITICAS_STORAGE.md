# Configurar Políticas de Storage en Supabase

## 🔒 Error: "new row violates row-level security policy"

Este error significa que el bucket existe pero las políticas de seguridad (RLS) no permiten la subida de archivos.

## ✅ Solución Rápida (Recomendada)

### ⚠️ IMPORTANTE: No uses el SQL Editor

El SQL Editor no tiene permisos para modificar `storage.objects`. **Debes configurar las políticas desde el Dashboard de Storage.**

### Opción 1: Configurar desde el Dashboard (RECOMENDADO)

**Ve a:** https://supabase.com/dashboard/project/vwmdppmlczmdbfmqbzcr/storage/buckets/perfumes

Luego sigue las instrucciones en **CONFIGURAR_POLITICAS_MANUAL.md**

### Opción 2: Ejecutar SQL en Supabase Dashboard (NO FUNCIONA)

1. **Ve a Supabase Dashboard:**
   - https://supabase.com/dashboard/project/vwmdppmlczmdbfmqbzcr

2. **Abre el SQL Editor:**
   - En el menú lateral, haz clic en **SQL Editor**

3. **Ejecuta el archivo SQL:**
   - Abre el archivo `supabase-storage-policies.sql` en este proyecto
   - Copia todo el contenido
   - Pégalo en el SQL Editor de Supabase
   - Haz clic en **Run** o presiona `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **Verifica que funcionó:**
   - Deberías ver un mensaje de éxito
   - Intenta subir una imagen nuevamente

### Opción 2: Configurar Manualmente desde el Dashboard

1. **Ve a Storage:**
   - https://supabase.com/dashboard/project/vwmdppmlczmdbfmqbzcr/storage/buckets/perfumes

2. **Haz clic en "Policies"**

3. **Crea 4 políticas:**

   **Política 1: Allow public uploads**
   - Haz clic en **New Policy**
   - Selecciona **For full customization**
   - **Policy name**: `Allow public uploads`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `anon`
   - **Policy definition**: 
     ```sql
     (bucket_id = 'perfumes'::text)
     ```
   - Haz clic en **Review** y luego **Save policy**

   **Política 2: Allow public reads**
   - **Policy name**: `Allow public reads`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `anon`
   - **Policy definition**: 
     ```sql
     (bucket_id = 'perfumes'::text)
     ```

   **Política 3: Allow authenticated uploads**
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `authenticated`
   - **Policy definition**: 
     ```sql
     (bucket_id = 'perfumes'::text)
     ```

   **Política 4: Allow authenticated reads**
   - **Policy name**: `Allow authenticated reads`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `authenticated`
   - **Policy definition**: 
     ```sql
     (bucket_id = 'perfumes'::text)
     ```

## 🔧 Verificar que Funcionó

Después de configurar las políticas:

1. Ve a `/admin/perfumes/new` en tu aplicación
2. Intenta subir una imagen
3. Si funciona, ¡listo! 🎉

## ⚠️ Nota de Seguridad

Estas políticas permiten que **cualquiera** (usuarios anónimos) pueda subir y leer archivos del bucket `perfumes`. 

Si necesitas más seguridad:
- Elimina las políticas para `anon` y solo permite `authenticated`
- O agrega condiciones adicionales en las políticas (por ejemplo, verificar que el usuario esté autenticado como admin)

