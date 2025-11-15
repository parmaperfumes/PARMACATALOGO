-- ===============================================
-- SOLUCIÓN: Error al guardar perfume
-- Problema: Campos 'usoPorDefecto' y 'fijarUso' faltantes en la tabla Perfume
-- ===============================================

-- INSTRUCCIONES:
-- 1. Ve a https://supabase.com/dashboard
-- 2. Selecciona tu proyecto de perfumes
-- 3. En el menú lateral izquierdo, haz clic en "SQL Editor"
-- 4. Haz clic en el botón "+ New query"
-- 5. Copia y pega TODO este script
-- 6. Haz clic en el botón "RUN" (o presiona Ctrl+Enter)
-- 7. Verifica que aparezcan los dos campos en el resultado final

-- ===============================================
-- SCRIPT
-- ===============================================

-- Paso 1: Verificar si la tabla Perfume existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'Perfume'
) AS tabla_perfume_existe;

-- Paso 2: Agregar el campo usoPorDefecto si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Perfume' AND column_name = 'usoPorDefecto'
    ) THEN
        ALTER TABLE "Perfume" ADD COLUMN "usoPorDefecto" TEXT;
        RAISE NOTICE '✓ Campo usoPorDefecto agregado exitosamente';
    ELSE
        RAISE NOTICE '✓ El campo usoPorDefecto ya existe';
    END IF;
END $$;

-- Paso 3: Agregar el campo fijarUso si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Perfume' AND column_name = 'fijarUso'
    ) THEN
        ALTER TABLE "Perfume" ADD COLUMN "fijarUso" BOOLEAN DEFAULT false;
        RAISE NOTICE '✓ Campo fijarUso agregado exitosamente';
    ELSE
        RAISE NOTICE '✓ El campo fijarUso ya existe';
    END IF;
END $$;

-- Paso 4: Verificar que los campos se agregaron correctamente
SELECT 
    column_name AS "Nombre del Campo", 
    data_type AS "Tipo de Dato", 
    is_nullable AS "Permite NULL",
    column_default AS "Valor por Defecto"
FROM information_schema.columns 
WHERE table_name = 'Perfume' 
AND column_name IN ('usoPorDefecto', 'fijarUso')
ORDER BY column_name;

-- Paso 5: Mostrar todos los campos de la tabla Perfume
SELECT 
    column_name AS "Campo", 
    data_type AS "Tipo"
FROM information_schema.columns 
WHERE table_name = 'Perfume' 
ORDER BY ordinal_position;

-- ===============================================
-- RESULTADO ESPERADO:
-- Deberías ver:
-- - usoPorDefecto | text | YES | NULL
-- - fijarUso | boolean | YES | false
-- ===============================================

