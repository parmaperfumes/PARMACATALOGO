-- Popup de ofertas en /perfumes: imagen de la oferta + botón «Pedir oferta» a WhatsApp.
-- Se configura en Ajustes del Catálogo. Arranca desactivado.
-- Ejecutar en el editor SQL de Supabase.

CREATE TABLE IF NOT EXISTS "OfertaPopupConfig" (
    "id"              TEXT PRIMARY KEY DEFAULT 'main',
    "activo"          BOOLEAN NOT NULL DEFAULT false,
    "imagen"          TEXT,
    "mensajeWhatsApp" TEXT,
    "updatedAt"       TIMESTAMP(6) NOT NULL DEFAULT NOW()
);

INSERT INTO "OfertaPopupConfig" ("id") VALUES ('main')
ON CONFLICT (id) DO NOTHING;
