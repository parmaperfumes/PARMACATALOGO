-- Agregar campos de precio personalizado por tamaño
-- Ejecutar en Supabase Dashboard > SQL Editor

-- Agregar campo precio30 (precio para 30ml)
ALTER TABLE "Perfume" ADD COLUMN IF NOT EXISTS "precio30" TEXT;

-- Agregar campo precio50 (precio para 50ml)
ALTER TABLE "Perfume" ADD COLUMN IF NOT EXISTS "precio50" TEXT;

-- Verificar que se agregaron correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Perfume' 
AND column_name IN ('precio30', 'precio50');
