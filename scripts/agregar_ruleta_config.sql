-- Interruptor para mostrar/ocultar el juego "Juega y Gana" en el sitio.
-- Ejecutar en el editor SQL de Supabase.

CREATE TABLE IF NOT EXISTS "RuletaConfig" (
    "id"        TEXT PRIMARY KEY DEFAULT 'main',
    "activa"    BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

-- Fila única de configuración (arranca visible).
INSERT INTO "RuletaConfig" ("id", "activa") VALUES ('main', true)
ON CONFLICT (id) DO NOTHING;
