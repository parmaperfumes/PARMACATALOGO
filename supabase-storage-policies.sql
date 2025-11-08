-- Políticas de seguridad para el bucket 'perfumes' en Supabase Storage
-- Ejecuta este archivo en Supabase Dashboard > SQL Editor

-- Habilitar RLS en la tabla storage.objects (si no está habilitado)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay (para evitar errores si ya existen)
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;

-- Política 1: Permitir subida de archivos para usuarios anónimos
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'perfumes');

-- Política 2: Permitir lectura de archivos para usuarios anónimos
CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'perfumes');

-- Política 3: Permitir subida de archivos para usuarios autenticados
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'perfumes');

-- Política 4: Permitir lectura de archivos para usuarios autenticados
CREATE POLICY "Allow authenticated reads"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'perfumes');

-- Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

