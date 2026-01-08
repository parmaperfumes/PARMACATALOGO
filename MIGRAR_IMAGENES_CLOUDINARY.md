# Migración de Imágenes de Supabase a Cloudinary

Este documento explica cómo migrar todas las imágenes de perfumes desde Supabase Storage a Cloudinary para reducir costos.

## ¿Por qué migrar a Cloudinary?

- **Plan gratuito generoso**: 25GB de almacenamiento y 25GB de ancho de banda mensual
- **Optimización automática**: Cloudinary optimiza las imágenes automáticamente
- **CDN global**: Las imágenes se sirven desde servidores cercanos al usuario
- **Sin costo adicional**: Perfecto para proyectos pequeños/medianos

## Requisitos Previos

### 1. Crear cuenta en Cloudinary (si no tienes una)

1. Ve a [cloudinary.com](https://cloudinary.com) y crea una cuenta gratuita
2. En el Dashboard, encontrarás tus credenciales:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2. Configurar Variables de Entorno

Agrega estas variables en tu archivo `.env.local` y en Render/Vercel:

```env
# Cloudinary (para subir imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Clave secreta para la migración (inventa una clave segura)
MIGRATION_SECRET_KEY=tu_clave_secreta_muy_larga_y_segura_123
```

## Proceso de Migración

### Paso 1: Verificar Estado Actual

Antes de migrar, verifica cuántas imágenes necesitan ser migradas:

```bash
# En el navegador o con curl:
GET https://tu-dominio.com/api/migrate-images
```

Esto te mostrará:
- Total de perfumes
- Cuántos tienen imágenes en Supabase (pendientes)
- Cuántos ya están en Cloudinary

### Paso 2: Ejecutar la Migración

**⚠️ IMPORTANTE**: Haz un backup de tu base de datos antes de migrar.

Envía una solicitud POST al endpoint de migración:

```bash
# Con curl:
curl -X POST https://tu-dominio.com/api/migrate-images \
  -H "Content-Type: application/json" \
  -d '{"secretKey": "tu_clave_secreta_muy_larga_y_segura_123"}'
```

O desde la consola del navegador (en tu sitio):

```javascript
fetch('/api/migrate-images', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ secretKey: 'tu_clave_secreta_muy_larga_y_segura_123' })
})
.then(res => res.json())
.then(data => console.log(data))
```

### Paso 3: Verificar Resultados

La respuesta incluirá:

```json
{
  "success": true,
  "summary": {
    "total": 53,
    "migrated": 50,
    "skipped": 2,
    "errors": 1
  },
  "results": [
    {
      "id": "perfume_123",
      "nombre": "SAUVAGE",
      "status": "success",
      "message": "Migradas 2 imagen(es)",
      "oldUrls": ["https://...supabase.co/..."],
      "newUrls": ["https://res.cloudinary.com/..."]
    }
  ]
}
```

## Después de la Migración

### 1. Verificar que las imágenes se muestran correctamente

Navega a tu catálogo y verifica que todas las imágenes se cargan correctamente.

### 2. Opcional: Eliminar imágenes de Supabase

Una vez verificado que todo funciona:

1. Ve a Supabase Dashboard → Storage
2. Selecciona el bucket "perfumes"
3. Elimina los archivos para liberar espacio

### 3. Cancelar/degradar plan de Supabase

Si ya no necesitas el storage de Supabase, puedes:
- Degradar al plan gratuito
- Mantener solo la base de datos PostgreSQL

## Solución de Problemas

### Error: "Cloudinary no está configurado"
Verifica que las variables de entorno estén configuradas:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Error: "No autorizado"
Verifica que `MIGRATION_SECRET_KEY` esté configurada y que estés enviando la clave correcta.

### Algunas imágenes fallan
- Revisa el array `results` en la respuesta para ver qué imágenes fallaron
- Puedes ejecutar la migración nuevamente - las imágenes ya migradas serán omitidas

### Timeout en la migración
Si tienes muchas imágenes, la migración puede tardar. Considera:
- Ejecutar en horarios de bajo tráfico
- Si falla por timeout, simplemente ejecuta de nuevo (las ya migradas se omiten)

## Configuración en Render

Agrega las variables de entorno en tu dashboard de Render:

1. Ve a tu servicio → Environment
2. Agrega:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `MIGRATION_SECRET_KEY`
3. Haz redeploy

## Costos Estimados

| Servicio | Plan Gratuito | Suficiente para |
|----------|---------------|-----------------|
| Cloudinary | 25GB storage, 25GB bandwidth/mes | ~5,000 imágenes, ~50,000 visitas/mes |
| Supabase (solo DB) | 500MB DB, 2GB bandwidth | Base de datos de perfumes |

¡Con esta configuración, tu hosting de imágenes será completamente gratuito!

