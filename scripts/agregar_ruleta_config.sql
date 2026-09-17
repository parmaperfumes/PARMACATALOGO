-- Configuración del juego "Juega y Gana" (ruleta).
--  - activa:  mostrar/ocultar el juego en el sitio.
--  - premios: valores de descuento y su probabilidad (peso).
-- Ejecutar en el editor SQL de Supabase.

CREATE TABLE IF NOT EXISTS "RuletaConfig" (
    "id"        TEXT PRIMARY KEY DEFAULT 'main',
    "activa"    BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

-- Premios: lista de { valor: %descuento, peso: probabilidad relativa }.
ALTER TABLE "RuletaConfig"
  ADD COLUMN IF NOT EXISTS "premios" JSONB NOT NULL
  DEFAULT '[{"valor":5,"peso":51},{"valor":10,"peso":48},{"valor":15,"peso":1}]'::jsonb;

-- Fila única de configuración (arranca visible con los premios por defecto).
INSERT INTO "RuletaConfig" ("id", "activa") VALUES ('main', true)
ON CONFLICT (id) DO NOTHING;
