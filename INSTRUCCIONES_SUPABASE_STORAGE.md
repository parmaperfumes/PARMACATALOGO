# Instrucciones para Configurar Supabase Storage

## 📦 Configurar el Bucket de Imágenes

Para que la subida de imágenes funcione, necesitas crear un bucket en Supabase Storage:

### Paso 1: Crear el Bucket

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard/project/vwmdppmlczmdbfmqbzcr
2. En el menú lateral, ve a **Storage**
3. Haz clic en **New bucket**
4. Configura el bucket:
   - **Name**: `perfumes`
   - **Public bucket**: ✅ **Marca esta opción** (para que las imágenes sean accesibles públicamente)
   - Haz clic en **Create bucket**

### Paso 2: Configurar Políticas de Acceso (Opcional pero Recomendado)

Para permitir que los usuarios suban imágenes:

1. En el bucket `perfumes`, ve a **Policies**
2. Haz clic en **New Policy**
3. Selecciona **For full customization**
4. Configura:
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: `INSERT`
   - **Policy definition**: 
     ```sql
     (bucket_id = 'perfumes'::text)
     ```
   - **Target roles**: `authenticated` o `anon` (según tus necesidades)

O simplemente marca el bucket como público y permite operaciones anónimas si es solo para desarrollo.

### Paso 3: Verificar Variables de Entorno

Asegúrate de que tu `.env.local` tenga estas variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://vwmdppmlczmdbfmqbzcr.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bWRwcG1sY3ptZGJmbXFiemNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NzIxMjUsImV4cCI6MjA3ODE0ODEyNX0.roOU7ain8MJagi-wj33u3BiMA3HnD3_g9sVUhN-J1CM"

# Opcional: Para operaciones administrativas (si necesitas más control)
# SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui"
```

**Nota**: La `SUPABASE_SERVICE_ROLE_KEY` solo es necesaria si quieres operaciones administrativas. Para subir imágenes con el anon key, asegúrate de que el bucket permita operaciones anónimas.

### Paso 4: Probar la Subida

1. Reinicia el servidor de desarrollo
2. Ve a `/admin/perfumes/new`
3. Intenta subir una imagen
4. Si aparece un error sobre el bucket, verifica que:
   - El bucket se llame exactamente `perfumes`
   - El bucket esté marcado como público
   - Las políticas permitan operaciones de INSERT

## 🔧 Solución de Problemas

### Error: "Bucket not found"
- Verifica que el bucket se llame exactamente `perfumes`
- Asegúrate de que el bucket esté creado en Supabase

### Error: "new row violates row-level security policy"
- Ve a **Storage > Policies** en Supabase
- Crea una política que permita INSERT para usuarios anónimos o autenticados

### Error: "Invalid API key"
- Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` esté correctamente configurada en `.env.local`
- Reinicia el servidor después de actualizar las variables de entorno

