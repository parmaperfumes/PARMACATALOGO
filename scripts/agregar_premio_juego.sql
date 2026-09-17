-- Soporte de premios variados y de varios juegos en los códigos.
--  - premio: etiqueta del premio (ej. "Envío gratis"); null = descuento normal.
--  - juego:  de qué juego vino el código ('ruleta', 'sopa', ...).
-- Ejecutar en el editor SQL de Supabase.

ALTER TABLE "RuletaDescuento"
  ADD COLUMN IF NOT EXISTS "premio" TEXT,
  ADD COLUMN IF NOT EXISTS "juego"  TEXT NOT NULL DEFAULT 'ruleta';

CREATE INDEX IF NOT EXISTS "idx_ruleta_juego" ON "RuletaDescuento" ("juego");
