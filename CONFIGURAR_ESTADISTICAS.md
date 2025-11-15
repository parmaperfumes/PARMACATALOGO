# Configurar Sistema de Estadísticas

## Paso 1: Crear la tabla en Supabase

1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **"SQL Editor"**
4. Haz clic en **"New query"**
5. Copia y pega el contenido del archivo `scripts/crear-tabla-visitas.sql`
6. Haz clic en **"Run"** (o presiona Ctrl+Enter)
7. Deberías ver el mensaje: "Tabla Visita creada correctamente"

## Paso 2: Verificar que funciona

1. Ve a http://localhost:3000/perfumes (o cualquier página pública)
2. Navega por la página durante unos segundos
3. Ve a http://localhost:3000/estadisticas (en el panel de admin)
4. Deberías ver las visitas registradas

## Paso 3: Desplegar a Vercel

Una vez que funcione en localhost:

1. Haz commit de los cambios:
   ```bash
   git add .
   git commit -m "feat: agregar sistema de estadísticas de visitas"
   git push
   ```

2. Vercel desplegará automáticamente

3. Las visitas comenzarán a registrarse automáticamente en producción

## ¿Qué registra el sistema?

✅ Cada visita a las páginas públicas (`/perfumes`, `/garantia`, etc.)  
✅ Dispositivo (móvil, desktop, tablet)  
✅ País y ciudad del visitante  
✅ Fecha y hora exacta  
✅ Página específica visitada  

## Estadísticas disponibles

En `/estadisticas` verás:
- Total de visitas
- Visitas por día (gráfico)
- Páginas más visitadas
- Dispositivos más usados
- Países de los visitantes
- Lista de visitas recientes

Puedes filtrar por: 7, 15, 30, 60 o 90 días


