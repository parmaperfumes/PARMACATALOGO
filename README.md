# Catálogo de Perfumes

Proyecto de catálogo de perfumes construido con Next.js 15, TypeScript, Tailwind CSS, Prisma y NextAuth.

## 🚀 Características

- ✅ Next.js 15 con App Router
- ✅ TypeScript para type safety
- ✅ Tailwind CSS + shadcn/ui para UI moderna y responsive
- ✅ Prisma ORM con PostgreSQL
- ✅ NextAuth para autenticación (Email y Google OAuth)
- ✅ PWA ready (Progressive Web App)
- ✅ Panel administrativo y público
- ✅ Optimizado para dispositivos móviles

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL (o usar Supabase/Neon para base de datos en la nube)
- Cuenta de Cloudinary (opcional, para imágenes)

## 🛠️ Instalación

1. **Clonar o navegar al proyecto:**
```bash
cd perfume-catalog
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:
- `DATABASE_URL`: URL de tu base de datos PostgreSQL
- `NEXTAUTH_SECRET`: Genera una clave secreta (usa `openssl rand -base64 32`)
- `NEXTAUTH_URL`: URL de tu aplicación (http://localhost:3000 para desarrollo)

4. **Configurar la base de datos:**
```bash
# Generar cliente Prisma
npx prisma generate

# Crear las tablas en la base de datos
npx prisma db push

# O usar migraciones (recomendado para producción)
npx prisma migrate dev --name init
```

5. **Iniciar servidor de desarrollo:**
```bash
npm run dev
```

6. **Abrir en el navegador:**
```
http://localhost:3000
```

## 📁 Estructura del Proyecto

```
perfume-catalog/
├── app/                    # App Router de Next.js
│   ├── (public)/          # Rutas públicas
│   ├── (admin)/           # Panel administrativo
│   ├── (auth)/            # Autenticación
│   ├── api/               # API Routes
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── ui/                # Componentes UI reutilizables
│   ├── public/            # Componentes públicos
│   ├── admin/             # Componentes admin
│   └── providers/         # Providers (Auth, etc.)
├── lib/                   # Utilidades y configuraciones
│   ├── prisma.ts          # Cliente Prisma
│   ├── auth.ts            # Configuración NextAuth
│   └── utils.ts           # Utilidades
├── prisma/                # Prisma
│   └── schema.prisma       # Esquema de base de datos
└── public/                # Archivos estáticos
```

## 🗄️ Base de Datos

El esquema incluye:
- **User**: Usuarios con roles (ADMIN, EDITOR, PUBLIC)
- **Perfume**: Productos de perfumes
- **Categoria**: Categorías de perfumes
- **Marca**: Marcas de perfumes
- **Account/Session**: Para NextAuth

### Comandos útiles de Prisma:

```bash
# Ver datos en Prisma Studio
npm run db:studio

# Crear migración
npm run db:migrate

# Sincronizar esquema con BD
npm run db:push
```

## 🔐 Autenticación

NextAuth configurado con:
- Email (Magic Link)
- Google OAuth

Para habilitar Google OAuth:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto y configura OAuth
3. Agrega las credenciales a `.env.local`

## 📱 PWA

El proyecto está configurado como PWA. Los usuarios pueden instalar la app en sus dispositivos móviles.

## 🎨 UI Components

Usa shadcn/ui para componentes. Para agregar componentes:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
# etc.
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático

### Base de Datos

Usa [Supabase](https://supabase.com) o [Neon](https://neon.tech) para PostgreSQL en la nube.

## 📝 Próximos Pasos

- [ ] Implementar catálogo público con filtros
- [ ] Sistema de búsqueda (Meilisearch/Algolia)
- [ ] Panel administrativo completo
- [ ] Subida de imágenes con Cloudinary
- [ ] Optimización de imágenes
- [ ] Sistema de favoritos
- [ ] Carrito de compras (si aplica)

## 📄 Licencia

MIT

