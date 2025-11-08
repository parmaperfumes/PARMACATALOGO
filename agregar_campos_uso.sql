-- Script para agregar los campos usoPorDefecto y fijarUso a la tabla Perfume
-- Ejecuta este script en Supabase Dashboard > SQL Editor

-- 1. Agregar el campo usoPorDefecto si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Perfume' AND column_name = 'usoPorDefecto'
    ) THEN
        ALTER TABLE "Perfume" ADD COLUMN "usoPorDefecto" TEXT;
    END IF;
END $$;

-- 2. Agregar el campo fijarUso si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Perfume' AND column_name = 'fijarUso'
    ) THEN
        ALTER TABLE "Perfume" ADD COLUMN "fijarUso" BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 3. Verificar que los campos se agregaron correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'Perfume' 
AND column_name IN ('usoPorDefecto', 'fijarUso')
ORDER BY column_name;

