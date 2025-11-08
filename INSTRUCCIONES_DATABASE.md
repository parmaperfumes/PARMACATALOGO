# Instrucciones para Conectar a Supabase

## ✅ Lo que ya está configurado:
- Schema de Prisma actualizado
- API route listo para guardar datos
- Cliente de Prisma generado

## 🔑 Necesitas encontrar la contraseña de la base de datos:

### Opción 1: Desde el Dashboard de Supabase (Recomendado)

1. Ve a: https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto: `vwmdppmlczmdbfmqbzcr`
4. Ve a **Settings** (Configuración) en el menú lateral
5. Haz clic en **Database**
6. Busca la sección **Connection string** o **Connection pooling**
7. Verás una URL como esta:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.vwmdppmlczmdbfmqbzcr.supabase.co:5432/postgres
   ```
8. Copia la parte `[YOUR-PASSWORD]` (la contraseña real)

### Opción 2: Resetear la contraseña

Si no encuentras la contraseña:

1. Ve a **Settings > Database**
2. Busca **Database password** o **Reset database password**
3. Haz clic en **Reset password** o **Generate new password**
4. Copia la nueva contraseña (solo se muestra una vez)

## 📝 Actualizar .env.local

Una vez que tengas la contraseña, actualiza el archivo `.env.local`:

```env
DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA_AQUI@db.vwmdppmlczmdbfmqbzcr.supabase.co:5432/postgres"
```

**Reemplaza `TU_CONTRASEÑA_AQUI` con la contraseña real.**

## 🚀 Después de actualizar la contraseña:

Ejecuta estos comandos:

```bash
# Aplicar el schema a la base de datos
npx prisma migrate dev --name init

# O si prefieres solo sincronizar sin crear migración
npx prisma db push

# Reiniciar el servidor
npx next dev
```

## ✅ Verificar la conexión:

1. Ve a `/admin` en tu aplicación
2. Intenta agregar un perfume
3. Si se guarda correctamente, ¡está funcionando!

También puedes ver los datos con:
```bash
npx prisma studio
```

Esto abrirá una interfaz visual para ver y editar los datos en tu base de datos.


