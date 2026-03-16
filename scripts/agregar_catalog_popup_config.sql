-- Script para crear la tabla CatalogPopupConfig
-- Ejecuta este script en Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS "CatalogPopupConfig" (
    id TEXT PRIMARY KEY DEFAULT 'main',
    "mensajeTitulo" TEXT,
    "mensajeTexto" TEXT,
    "mensajeWhatsApp" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

INSERT INTO "CatalogPopupConfig" (id, "mensajeTitulo", "mensajeTexto", "mensajeWhatsApp")
VALUES (
    'main',
    '¿Necesitas ayuda personalizada?',
    'Te ayudamos a encontrar el perfume ideal para ti. ¿Hablamos por WhatsApp?',
    'Hola 👋, necesito ayuda personalizada para elegir mi perfume.'
)
ON CONFLICT (id) DO NOTHING;

SELECT * FROM "CatalogPopupConfig";
