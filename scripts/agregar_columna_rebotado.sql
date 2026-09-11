-- Marca de rebote para la Ruleta de Descuentos.
-- Cuando un correo rebota ("destinatario no encontrado"), el código se marca
-- como rebotado y deja de mostrarse en el panel (correo no legítimo).
-- Ejecutar en el editor SQL de Supabase.

ALTER TABLE "RuletaDescuento"
  ADD COLUMN IF NOT EXISTS "rebotado"   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "rebotadoEn" TIMESTAMP(6);

CREATE INDEX IF NOT EXISTS "idx_ruleta_rebotado" ON "RuletaDescuento" ("rebotado");
