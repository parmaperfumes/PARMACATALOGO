# Configurar Políticas de Storage Manualmente en Supabase

## ⚠️ Error: "must be owner of table objects"

Este error ocurre porque no puedes modificar directamente la tabla `storage.objects` desde el SQL Editor. Necesitas configurar las políticas desde el Dashboard de Supabase.

## ✅ Solución: Configurar desde el Dashboard

### Paso 1: Ve a Storage Policies

1. **Abre tu proyecto en Supabase:**
   - https://supabase.com/dashboard/project/vwmdppmlczmdbfmqbzcr

2. **Ve a Storage:**
   - En el menú lateral, haz clic en **Storage**
   - O ve directamente a: https://supabase.com/dashboard/project/vwmdppmlczmdbfmqbzcr/storage/buckets

3. **Abre el bucket `perfumes`:**
   - Haz clic en el bucket `perfumes`
   - O ve a: https://supabase.com/dashboard/project/vwmdppmlczmdbfmqbzcr/storage/buckets/perfumes

4. **Ve a la pestaña "Policies":**
   - Haz clic en la pestaña **Policies** en la parte superior

### Paso 2: Crear las Políticas

Necesitas crear **4 políticas**. Para cada una:

#### Política 1: Allow public uploads

1. Haz clic en **New Policy**
2. Selecciona **For full customization**
3. Completa:
   - **Policy name**: `Allow public uploads`
   - **Allowed operation**: Selecciona **INSERT**
   - **Target roles**: Selecciona **anon**
   - **Policy definition**: 
     ```sql
     (bucket_id = 'perfumes'::text)
     ```
4. Haz clic en **Review** y luego **Save policy**

#### Política 2: Allow public reads

1. Haz clic en **New Policy**
2. Selecciona **For full customization**
3. Completa:
   - **Policy name**: `Allow public reads`
   - **Allowed operation**: Selecciona **SELECT**
   - **Target roles**: Selecciona **anon**
   - **Policy definition**: 
     ```sql
     (bucket_id = 'perfumes'::text)
     ```
4. Haz clic en **Review** y luego **Save policy**

#### Política 3: Allow authenticated uploads

1. Haz clic en **New Policy**
2. Selecciona **For full customization**
3. Completa:
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: Selecciona **INSERT**
   - **Target roles**: Selecciona **authenticated**
   - **Policy definition**: 
     ```sql
     (bucket_id = 'perfumes'::text)
     ```
4. Haz clic en **Review** y luego **Save policy**

#### Política 4: Allow authenticated reads

1. Haz clic en **New Policy**
2. Selecciona **For full customization**
3. Completa:
   - **Policy name**: `Allow authenticated reads`
   - **Allowed operation**: Selecciona **SELECT**
   - **Target roles**: Selecciona **authenticated**
   - **Policy definition**: 
     ```sql
     (bucket_id = 'perfumes'::text)
     ```
4. Haz clic en **Review** y luego **Save policy**

### Paso 3: Verificar

Después de crear las 4 políticas, deberías verlas listadas en la pestaña **Policies**.

### Paso 4: Probar

1. Vuelve a tu aplicación: `/admin/perfumes/new`
2. Intenta subir una imagen
3. ¡Debería funcionar! 🎉

## 📝 Resumen de las Políticas

| Nombre | Operación | Rol | Definición |
|--------|-----------|-----|------------|
| Allow public uploads | INSERT | anon | `(bucket_id = 'perfumes'::text)` |
| Allow public reads | SELECT | anon | `(bucket_id = 'perfumes'::text)` |
| Allow authenticated uploads | INSERT | authenticated | `(bucket_id = 'perfumes'::text)` |
| Allow authenticated reads | SELECT | authenticated | `(bucket_id = 'perfumes'::text)` |

## 🔗 Enlaces Directos

- **Storage Buckets**: https://supabase.com/dashboard/project/vwmdppmlczmdbfmqbzcr/storage/buckets
- **Bucket perfumes**: https://supabase.com/dashboard/project/vwmdppmlczmdbfmqbzcr/storage/buckets/perfumes

