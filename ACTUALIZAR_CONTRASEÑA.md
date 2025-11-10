# Actualizar Contraseña del Panel Administrativo

## ✅ Opción 1: Ejecutar SQL directamente en Supabase (MÁS FÁCIL Y RECOMENDADO)

1. Ve a tu proyecto en Supabase Dashboard: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor** en el menú lateral
4. Abre el archivo `scripts/update-password-completo.sql` en este proyecto
5. Copia todo el contenido del archivo
6. Pégalo en el SQL Editor de Supabase
7. Haz clic en **Run** o presiona Ctrl+Enter
8. Verás un mensaje de éxito ✅

**El script ya incluye el hash de la contraseña `parmacatalogo0405`, así que solo necesitas copiarlo y ejecutarlo.**

---

## Opción 2: Usar el Endpoint API

He creado un endpoint API que puedes llamar desde el navegador.

### Desde el navegador:

1. Abre tu aplicación en el navegador (http://localhost:3000 o tu URL de producción)
2. Abre la consola del navegador (F12)
3. Ejecuta este código:

```javascript
fetch('/api/admin/update-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'parma01@gmail.com',
    password: 'parmacatalogo0405'
  })
})
.then(r => r.json())
.then(data => console.log('✅ Resultado:', data))
.catch(err => console.error('❌ Error:', err))
```

### Desde la terminal (curl):

```bash
curl -X POST http://localhost:3000/api/admin/update-password \
  -H "Content-Type: application/json" \
  -d '{"email":"parma01@gmail.com","password":"parmacatalogo0405"}'
```

---

## Opción 3: Usar el script de Node.js

Si tienes acceso a la terminal y DATABASE_URL configurada correctamente:

```bash
npm run update-password
```

**Nota:** Este script requiere que DATABASE_URL esté correctamente configurada en `.env.local`.

---

## Credenciales

- **Email:** parma01@gmail.com
- **Contraseña:** parmacatalogo0405
