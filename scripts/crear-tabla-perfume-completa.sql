-- Script completo para crear la tabla Perfume con todos los campos actualizados
-- Ejecuta este script en Supabase Dashboard > SQL Editor

-- 1. Verificar qué tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Crear la tabla Perfume con TODOS los campos actualizados
CREATE TABLE IF NOT EXISTS "Perfume" (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    precio DOUBLE PRECISION NOT NULL,
    "precioDescuento" DOUBLE PRECISION,
    "imagenPrincipal" TEXT NOT NULL,
    imagenes TEXT[] DEFAULT ARRAY[]::TEXT[],
    stock INTEGER DEFAULT 0,
    destacado BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    "categoriaId" TEXT,
    "marcaId" TEXT,
    genero TEXT,
    subtitulo TEXT,
    volumen TEXT,
    notas TEXT[] DEFAULT ARRAY[]::TEXT[],
    sizes INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "usoPorDefecto" TEXT,
    "fijarUso" BOOLEAN DEFAULT false,
    "tipoLanzamiento" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Agregar campos faltantes si la tabla ya existía (ejecutar uno por uno)
DO $$ 
BEGIN
    -- Agregar subtitulo si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Perfume' AND column_name = 'subtitulo'
    ) THEN
        ALTER TABLE "Perfume" ADD COLUMN subtitulo TEXT;
    END IF;

    -- Agregar usoPorDefecto si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Perfume' AND column_name = 'usoPorDefecto'
    ) THEN
        ALTER TABLE "Perfume" ADD COLUMN "usoPorDefecto" TEXT;
    END IF;

    -- Agregar fijarUso si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Perfume' AND column_name = 'fijarUso'
    ) THEN
        ALTER TABLE "Perfume" ADD COLUMN "fijarUso" BOOLEAN DEFAULT false;
    END IF;

    -- Agregar tipoLanzamiento si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Perfume' AND column_name = 'tipoLanzamiento'
    ) THEN
        ALTER TABLE "Perfume" ADD COLUMN "tipoLanzamiento" TEXT;
    END IF;
END $$;

-- 4. Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_perfume_categoria ON "Perfume"("categoriaId");
CREATE INDEX IF NOT EXISTS idx_perfume_marca ON "Perfume"("marcaId");
CREATE INDEX IF NOT EXISTS idx_perfume_slug ON "Perfume"(slug);
CREATE INDEX IF NOT EXISTS idx_perfume_activo_destacado ON "Perfume"(activo, destacado);

-- 5. Crear tablas relacionadas si no existen
CREATE TABLE IF NOT EXISTS "Categoria" (
    id TEXT PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    imagen TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Marca" (
    id TEXT PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    logo TEXT,
    pais TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Verificar que todo se creó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Perfume' 
ORDER BY ordinal_position;

