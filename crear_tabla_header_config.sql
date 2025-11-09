-- Script para crear la tabla HeaderConfig
-- Ejecuta este script en Supabase Dashboard > SQL Editor

-- Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS "HeaderConfig" (
    id TEXT PRIMARY KEY DEFAULT 'main',
    "logoText" TEXT DEFAULT 'parma',
    "logoImage" TEXT,
    "navLinks" JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Insertar configuración inicial si no existe
INSERT INTO "HeaderConfig" (id, "logoText", "logoImage", "navLinks")
VALUES ('main', 'parma', NULL, '[{"label": "Catálogo", "href": "/perfumes"}, {"label": "Garantía", "href": "/garantia"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Verificar que se creó correctamente
SELECT * FROM "HeaderConfig";

