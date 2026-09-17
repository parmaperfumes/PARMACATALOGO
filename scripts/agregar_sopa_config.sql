-- Configuración del juego "Sopa de letras".
--  - activa:    mostrar/ocultar en el sitio.
--  - descuento: % que gana el cliente al encontrar todas las palabras.
--  - filas/columnas: tamaño de la cuadrícula.
--  - palabras: lista de palabras a buscar.
--  - letras: cuadrícula generada.
--  - colocaciones: dónde quedó cada palabra (respuestas).
-- Ejecutar en el editor SQL de Supabase.

CREATE TABLE IF NOT EXISTS "SopaConfig" (
    "id"           TEXT PRIMARY KEY DEFAULT 'main',
    "activa"       BOOLEAN NOT NULL DEFAULT false,
    "descuento"    INTEGER NOT NULL DEFAULT 10,
    "filas"        INTEGER NOT NULL DEFAULT 12,
    "columnas"     INTEGER NOT NULL DEFAULT 12,
    "palabras"     JSONB   NOT NULL DEFAULT '[]'::jsonb,
    "letras"       JSONB   NOT NULL DEFAULT '[]'::jsonb,
    "colocaciones" JSONB   NOT NULL DEFAULT '[]'::jsonb,
    "updatedAt"    TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

-- Premios que el cliente elige al ganar (lista de { etiqueta, descuento }).
ALTER TABLE "SopaConfig"
  ADD COLUMN IF NOT EXISTS "premios" JSONB NOT NULL
  DEFAULT '[{"etiqueta":"10% de descuento","descuento":10},{"etiqueta":"15% de descuento","descuento":15}]'::jsonb;

INSERT INTO "SopaConfig" ("id") VALUES ('main')
ON CONFLICT (id) DO NOTHING;
