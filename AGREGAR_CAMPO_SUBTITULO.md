# Agregar Campo Subtítulo a la Base de Datos

## ⚠️ Importante

El campo `subtitulo` fue agregado al schema de Prisma pero **necesita ser agregado manualmente a la base de datos de Supabase**.

## 📋 Pasos para Agregar el Campo

### Opción 1: Desde Supabase Dashboard (Recomendado)

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor** en el menú lateral
4. Haz clic en **New query**
5. Copia y pega este SQL:

```sql
ALTER TABLE "Perfume" 
ADD COLUMN IF NOT EXISTS "subtitulo" TEXT;
```

6. Haz clic en **Run** (o presiona `Ctrl+Enter`)
7. Deberías ver un mensaje de éxito

### Opción 2: Usando Prisma Migrate

Si tienes `DATABASE_URL` configurada en tu `.env.local`, puedes ejecutar:

```bash
npx prisma migrate dev --name add_subtitulo_field
```

O si prefieres solo sincronizar sin crear migración:

```bash
npx prisma db push
```

## ✅ Verificar que Funcionó

Después de ejecutar el SQL:

1. Intenta guardar un perfume desde el panel de administración
2. Si se guarda correctamente, ¡está funcionando!
3. El subtítulo se guardará y se mostrará en el catálogo

## 🔄 Solución Temporal

Si no puedes agregar el campo ahora, el código está preparado para funcionar sin el campo `subtitulo`. Los perfumes se guardarán correctamente, pero el subtítulo no se guardará hasta que agregues el campo a la base de datos.

