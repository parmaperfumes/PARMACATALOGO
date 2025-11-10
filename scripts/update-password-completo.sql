-- Script SQL para actualizar la contraseña del usuario parma01@gmail.com
-- Contraseña: parmacatalogo0405
-- Hash generado: $2b$10$fqxEqwPNqA/cl1DxcdwhaO3ZTDjQvXRu3T69G5Bp1tjY5JVlHFNQa
-- 
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard > SQL Editor
-- 2. Copia y pega este script completo
-- 3. Ejecuta el script

-- Verificar si el usuario existe
DO $$
DECLARE
    user_exists BOOLEAN;
    user_id TEXT;
BEGIN
    -- Verificar si el usuario existe
    SELECT EXISTS(SELECT 1 FROM "User" WHERE email = 'parma01@gmail.com') INTO user_exists;
    SELECT id INTO user_id FROM "User" WHERE email = 'parma01@gmail.com' LIMIT 1;
    
    IF user_exists THEN
        -- Actualizar la contraseña del usuario existente
        UPDATE "User" 
        SET "passwordHash" = '$2b$10$fqxEqwPNqA/cl1DxcdwhaO3ZTDjQvXRu3T69G5Bp1tjY5JVlHFNQa',
            "updatedAt" = NOW()
        WHERE email = 'parma01@gmail.com';
        
        RAISE NOTICE '✅ Contraseña actualizada para el usuario: parma01@gmail.com';
        RAISE NOTICE '   ID: %', user_id;
    ELSE
        -- Crear el usuario si no existe
        INSERT INTO "User" (id, email, name, "passwordHash", role, "createdAt", "updatedAt")
        VALUES (
            gen_random_uuid(),
            'parma01@gmail.com',
            'Admin',
            '$2b$10$fqxEqwPNqA/cl1DxcdwhaO3ZTDjQvXRu3T69G5Bp1tjY5JVlHFNQa',
            'ADMIN',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '✅ Usuario creado exitosamente: parma01@gmail.com';
    END IF;
END $$;

-- Verificar el resultado
SELECT id, email, name, role, "createdAt" FROM "User" WHERE email = 'parma01@gmail.com';


