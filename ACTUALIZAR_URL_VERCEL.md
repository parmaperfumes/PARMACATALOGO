# Actualizar URL en Vercel

## Nueva URL del proyecto
**URL:** `https://parmacatalogo.vercel.app`

## Pasos para actualizar en Vercel

### 1. Actualizar variable de entorno NEXTAUTH_URL

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona el proyecto `parmacatalogo`
3. Ve a **Settings** → **Environment Variables**
4. Busca la variable `NEXTAUTH_URL`
5. Actualiza su valor a:
   ```
   https://parmacatalogo.vercel.app
   ```
6. Asegúrate de que esté configurada para:
   - ✅ Production
   - ✅ Preview (opcional)
   - ✅ Development (opcional)

### 2. Verificar otras variables de entorno

Asegúrate de que estas variables estén correctas:
- `NEXTAUTH_URL` = `https://parmacatalogo.vercel.app`
- `NEXTAUTH_SECRET` = (tu secreto actual)
- `DATABASE_URL` = (tu URL de base de datos)

### 3. Redesplegar

Después de actualizar las variables:
1. Ve a **Deployments**
2. Haz clic en los tres puntos (⋯) del último deployment
3. Selecciona **Redeploy**
4. O simplemente haz un nuevo commit y push

### 4. Verificar

Una vez desplegado, verifica que:
- La aplicación carga correctamente en `https://parmacatalogo.vercel.app`
- El login funciona correctamente
- No hay errores de autenticación

## Nota importante

Si tienes un dominio personalizado configurado, también deberás actualizar:
- Google OAuth redirect URIs (si usas Google login)
- Cualquier otra configuración externa que use la URL

