-- Agregar campos para fijar perfumes en el catálogo
ALTER TABLE "Perfume" ADD COLUMN IF NOT EXISTS "fijado" BOOLEAN DEFAULT false;
ALTER TABLE "Perfume" ADD COLUMN IF NOT EXISTS "ordenFijado" INTEGER DEFAULT 0;
