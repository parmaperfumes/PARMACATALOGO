-- Configuración del juego "Crucigrama".
--  - activa:   mostrar/ocultar en el sitio.
--  - descuento: % que gana el cliente al resolverlo.
--  - filas/columnas: tamaño de la cuadrícula.
--  - entradas: palabras colocadas { palabra, pista, fila, columna, direccion }.
-- Ejecutar en el editor SQL de Supabase.

CREATE TABLE IF NOT EXISTS "CrucigramaConfig" (
    "id"        TEXT PRIMARY KEY DEFAULT 'main',
    "activa"    BOOLEAN NOT NULL DEFAULT false,
    "descuento" INTEGER NOT NULL DEFAULT 10,
    "filas"     INTEGER NOT NULL DEFAULT 8,
    "columnas"  INTEGER NOT NULL DEFAULT 8,
    "entradas"  JSONB   NOT NULL DEFAULT '[]'::jsonb,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

INSERT INTO "CrucigramaConfig" ("id") VALUES ('main')
ON CONFLICT (id) DO NOTHING;
