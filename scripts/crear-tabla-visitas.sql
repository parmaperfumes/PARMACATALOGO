-- Script para crear la tabla de Visitas en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- Crear la tabla Visita
CREATE TABLE IF NOT EXISTS "Visita" (
    id TEXT PRIMARY KEY,
    path TEXT NOT NULL,
    "userAgent" TEXT,
    referrer TEXT,
    ip TEXT,
    pais TEXT,
    ciudad TEXT,
    dispositivo TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS "Visita_createdAt_idx" ON "Visita"("createdAt");
CREATE INDEX IF NOT EXISTS "Visita_path_idx" ON "Visita"(path);
CREATE INDEX IF NOT EXISTS "Visita_dispositivo_idx" ON "Visita"(dispositivo);

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla Visita creada correctamente' AS mensaje;
SELECT COUNT(*) AS total_visitas FROM "Visita";


