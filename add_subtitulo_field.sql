-- Script para agregar el campo 'subtitulo' a la tabla Perfume
-- Ejecuta este script en Supabase Dashboard > SQL Editor

-- IMPORTANTE: Si la tabla "Perfume" no existe, primero ejecuta el archivo
-- "crear_tablas_y_agregar_subtitulo.sql" para crear todas las tablas necesarias.

-- Verificar si la tabla existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'Perfume'
) AS tabla_existe;

-- Si la tabla existe, agregar el campo subtitulo
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Perfume'
    ) THEN
        -- Agregar el campo si no existe
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'Perfume' AND column_name = 'subtitulo'
        ) THEN
            ALTER TABLE "Perfume" ADD COLUMN subtitulo TEXT;
            RAISE NOTICE 'Campo subtitulo agregado exitosamente';
        ELSE
            RAISE NOTICE 'El campo subtitulo ya existe';
        END IF;
    ELSE
        RAISE EXCEPTION 'La tabla Perfume no existe. Ejecuta primero crear_tablas_y_agregar_subtitulo.sql';
    END IF;
END $$;

-- Verificar que el campo se agregó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Perfume' AND column_name = 'subtitulo';

