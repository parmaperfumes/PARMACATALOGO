# Guía para Desplegar en Vercel

## 📋 Requisitos Previos

1. **Cuenta de Vercel**: Crea una cuenta en [vercel.com](https://vercel.com)
2. **Repositorio Git**: Asegúrate de que tu proyecto esté en GitHub, GitLab o Bitbucket
3. **Variables de Entorno**: Prepara todas las variables de entorno necesarias

## 🚀 Pasos para Desplegar

### Opción 1: Desde la Interfaz Web de Vercel (Recomendado)

1. **Ve a Vercel Dashboard**
   - Visita [vercel.com/dashboard](https://vercel.com/dashboard)
   - Inicia sesión con tu cuenta

2. **Importar Proyecto**
   - Haz clic en "Add New..." → "Project"
   - Conecta tu repositorio de Git (GitHub, GitLab o Bitbucket)
   - Selecciona el repositorio `perfume-catalog`

3. **Configurar el Proyecto**
   - **Framework Preset**: Next.js (se detecta automáticamente)
   - **Root Directory**: `./` (raíz del proyecto)
   - **Build Command**: `npm run build` (o `next build`)
   - **Output Directory**: `.next` (por defecto)
   - **Install Command**: `npm install`

4. **Configurar Variables de Entorno**
   
   Haz clic en "Environment Variables" y agrega las siguientes variables:

   ```
   DATABASE_URL=postgresql://postgres.vwmdppmlczmdbfmqbzcr:parmacatalogo123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   
   **⚠️ IMPORTANTE sobre DATABASE_URL:**
   - Debes usar **Session Pooler** (puerto 6543) para Vercel, NO la conexión directa (puerto 5432)
   - Obtén la URL correcta desde Supabase Dashboard → Settings → Database → "Connect to your project" → Method: "Session Pooler"
   - Ver guía completa en: `CONFIGURAR_DATABASE_URL_VERCEL.md`
   
   NEXT_PUBLIC_SUPABASE_URL=https://vwmdppmlczmdbfmqbzcr.supabase.co
   
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bWRwcG1sY3ptZGJmbXFiemNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NzIxMjUsImV4cCI6MjA3ODE0ODEyNX0.roOU7ain8MJagi-wj33u3BiMA3HnD3_g9sVUhN-J1CM
   
   SUPABASE_SERVICE_ROLE_KEY=(Tu Service Role Key de Supabase - opcional pero recomendado)
   
   NEXTAUTH_SECRET=(Genera una clave secreta aleatoria - ver instrucciones abajo)
   
   NEXTAUTH_URL=https://tu-proyecto.vercel.app
   
   ADMIN_EMAIL=admin
   
   ADMIN_PASSWORD=admin123
   ```

   **⚠️ IMPORTANTE**: 
   - Reemplaza `https://tu-proyecto.vercel.app` con la URL real de tu proyecto en Vercel (la obtendrás después del primer deploy)
   - Para generar `NEXTAUTH_SECRET`, puedes usar: `openssl rand -base64 32` o cualquier generador de strings aleatorios

5. **Desplegar**
   - Haz clic en "Deploy"
   - Espera a que termine el proceso de build
   - Una vez completado, obtendrás una URL como: `https://perfume-catalog-xxxxx.vercel.app`

6. **Actualizar NEXTAUTH_URL**
   - Después del primer deploy, vuelve a "Settings" → "Environment Variables"
   - Actualiza `NEXTAUTH_URL` con la URL real de tu proyecto
   - Haz un nuevo deploy para aplicar los cambios

### Opción 2: Desde la Terminal (CLI de Vercel)

1. **Instalar Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Iniciar sesión**
   ```bash
   vercel login
   ```

3. **Desplegar**
   ```bash
   vercel
   ```
   
   Sigue las instrucciones en pantalla:
   - Selecciona el scope (tu cuenta)
   - Confirma el proyecto
   - Confirma las configuraciones

4. **Configurar Variables de Entorno**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   vercel env add ADMIN_EMAIL
   vercel env add ADMIN_PASSWORD
   ```

5. **Desplegar a Producción**
   ```bash
   vercel --prod
   ```

## 🔧 Configuraciones Adicionales

### Build Settings en Vercel

Asegúrate de que en "Settings" → "General" → "Build & Development Settings":

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: (dejar vacío, Next.js lo maneja automáticamente)
- **Install Command**: `npm install`

### Variables de Entorno por Entorno

Puedes configurar variables diferentes para:
- **Production**: Variables para producción
- **Preview**: Variables para branches de preview
- **Development**: Variables para desarrollo local

## 📝 Checklist Pre-Deploy

- [ ] Proyecto está en un repositorio Git
- [ ] Todas las dependencias están en `package.json`
- [ ] Scripts de build están configurados (`build`, `start`)
- [ ] Variables de entorno están listas
- [ ] Base de datos de Supabase está activa
- [ ] Bucket de Supabase Storage está configurado
- [ ] Políticas RLS están configuradas en Supabase

## 🐛 Solución de Problemas Comunes

### Error: "Module not found"
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que `package-lock.json` esté en el repositorio

### Error: "DATABASE_URL not found"
- Verifica que las variables de entorno estén configuradas en Vercel
- Asegúrate de que el nombre de la variable sea exactamente `DATABASE_URL`

### Error: "Build failed"
- Revisa los logs de build en Vercel Dashboard
- Verifica que no haya errores de TypeScript o ESLint
- Asegúrate de que `prisma generate` se ejecute en `postinstall`

### Error de conexión a Supabase
- **IMPORTANTE:** Vercel requiere usar **Session Pooler** (puerto 6543), NO la conexión directa (puerto 5432)
- Verifica que la URL de Supabase sea correcta y use el formato del Session Pooler
- La URL debe incluir `?pgbouncer=true` al final
- Verifica que el proyecto de Supabase no esté pausado
- Ver guía detallada en: `CONFIGURAR_DATABASE_URL_VERCEL.md`

## 🔗 Enlaces Útiles

- [Documentación de Vercel](https://vercel.com/docs)
- [Next.js en Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Variables de Entorno en Vercel](https://vercel.com/docs/environment-variables)

## 📞 Soporte

Si tienes problemas durante el deploy, revisa:
1. Los logs de build en Vercel Dashboard
2. Los logs de runtime en Vercel Dashboard
3. La consola del navegador para errores del cliente

