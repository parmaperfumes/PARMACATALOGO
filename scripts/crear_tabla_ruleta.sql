-- Tabla para la Ruleta de Descuentos "Juega y Gana"
-- Ejecutar este script en el editor SQL de Supabase.

CREATE TABLE IF NOT EXISTS "RuletaDescuento" (
    "id"        TEXT PRIMARY KEY,
    "codigo"    TEXT NOT NULL,
    "correo"    TEXT NOT NULL,
    "descuento" INTEGER NOT NULL,
    "usado"     BOOLEAN NOT NULL DEFAULT false,
    "telefono"  TEXT,
    "usadoEn"   TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

-- Un correo solo puede participar una vez (mata el re-giro).
CREATE UNIQUE INDEX IF NOT EXISTS "RuletaDescuento_correo_key" ON "RuletaDescuento" ("correo");
-- Cada codigo es unico (mata el compartir/duplicar).
CREATE UNIQUE INDEX IF NOT EXISTS "RuletaDescuento_codigo_key" ON "RuletaDescuento" ("codigo");
-- Indices de apoyo.
CREATE INDEX IF NOT EXISTS "idx_ruleta_codigo" ON "RuletaDescuento" ("codigo");
CREATE INDEX IF NOT EXISTS "idx_ruleta_correo" ON "RuletaDescuento" ("correo");
CREATE INDEX IF NOT EXISTS "idx_ruleta_usado" ON "RuletaDescuento" ("usado");
