-- Script SQL para actualizar la contraseña del usuario parma01@gmail.com
-- Ejecuta este script en Supabase Dashboard > SQL Editor

-- Primero, verifica si el usuario existe
SELECT id, email, role FROM "User" WHERE email = 'parma01@gmail.com';

-- Si el usuario NO existe, ejecuta esto para crearlo:
-- (Necesitarás generar el hash de la contraseña primero usando bcrypt)
-- INSERT INTO "User" (id, email, name, "passwordHash", role, "createdAt", "updatedAt")
-- VALUES (
--   gen_random_uuid(),
--   'parma01@gmail.com',
--   'Admin',
--   '$2a$10$TU_HASH_AQUI', -- Reemplaza con el hash de 'parmacatalogo0405'
--   'ADMIN',
--   NOW(),
--   NOW()
-- );

-- Si el usuario YA existe, ejecuta esto para actualizar la contraseña:
-- (Necesitarás generar el hash de la contraseña primero usando bcrypt)
-- UPDATE "User" 
-- SET "passwordHash" = '$2a$10$TU_HASH_AQUI', -- Reemplaza con el hash de 'parmacatalogo0405'
--     "updatedAt" = NOW()
-- WHERE email = 'parma01@gmail.com';


