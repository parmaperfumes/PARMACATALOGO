-- Script completo para crear las tablas necesarias y agregar el campo subtitulo
-- Ejecuta este script en Supabase Dashboard > SQL Editor

-- 1. Verificar qué tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Crear la tabla Perfume si no existe (incluyendo el campo subtitulo desde el inicio)
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
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- 3. Agregar el campo subtitulo si no existe (por si la tabla ya existía sin este campo)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Perfume' AND column_name = 'subtitulo'
    ) THEN
        ALTER TABLE "Perfume" ADD COLUMN subtitulo TEXT;
    END IF;
END $$;

-- 4. Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_perfume_categoria ON "Perfume"("categoriaId");
CREATE INDEX IF NOT EXISTS idx_perfume_marca ON "Perfume"("marcaId");
CREATE INDEX IF NOT EXISTS idx_perfume_slug ON "Perfume"(slug);
CREATE INDEX IF NOT EXISTS idx_perfume_activo_destacado ON "Perfume"(activo, destacado);

-- 5. Verificar que todo se creó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Perfume' 
ORDER BY ordinal_position;

