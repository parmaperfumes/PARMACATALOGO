-- Agregar campo para marcar perfumes como NUEVO o RE-STOCK
-- Ejecuta este script en Supabase Dashboard > SQL Editor

-- Agregar columna tipoLanzamiento (puede ser: 'NUEVO', 'RESTOCK', o NULL)
ALTER TABLE "Perfume" 
ADD COLUMN IF NOT EXISTS "tipoLanzamiento" TEXT;

-- Comentario explicativo
COMMENT ON COLUMN "Perfume"."tipoLanzamiento" IS 'Tipo de lanzamiento del perfume: NUEVO, RESTOCK, o NULL si no aplica';

-- Verificar que se agregó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Perfume' AND column_name = 'tipoLanzamiento';




