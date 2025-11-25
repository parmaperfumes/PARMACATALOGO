# Instrucciones para Configurar Estadísticas de Carrito

## ✅ Funcionalidad Implementada

Se han agregado dos nuevos contadores de estadísticas:

1. **Clicks en "Continuar con el pedido"**: Cuenta cuántas personas completaron el proceso y fueron redirigidas a WhatsApp
2. **Carritos abandonados**: Cuenta cuántas personas agregaron productos al carrito pero cerraron el modal sin continuar

## 📋 Pasos para Activar

### 1. Crear la Tabla en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor** (en el menú lateral)
3. Abre el archivo `scripts/crear-tabla-eventos-carrito.sql`
4. Copia todo el contenido
5. Pégalo en el SQL Editor de Supabase
6. Haz clic en **Run** (o presiona `Ctrl + Enter`)

### 2. Verificar que Funciona

1. Reinicia tu servidor de desarrollo (si está corriendo)
2. Ve al catálogo público de perfumes
3. Agrega algunos perfumes al carrito
4. Haz clic en "Continuar con el pedido" → Esto registrará un evento de "click_continuar"
5. Agrega otros perfumes y cierra el modal sin hacer clic en continuar → Esto registrará un "carrito_abandonado"
6. Ve a `/estadisticas` en el panel de administración
7. Deberías ver las nuevas tarjetas con:
   - ✅ **Pedidos Continuados**: Número de clicks en continuar
   - ❌ **Carritos Abandonados**: Número de carritos abandonados
   - 📊 **Tasa de Conversión**: Porcentaje de conversión (clicks continuar / total eventos)

## 📊 Información Mostrada

Las estadísticas muestran:

- **Total de eventos** por tipo
- **Promedio de items** en cada tipo de evento
- **Tasa de conversión**: (Pedidos Continuados / Total Eventos) × 100

## 🔍 Datos Capturados

Para cada evento se guarda:
- Tipo de evento (click_continuar o carrito_abandonado)
- Cantidad de items en el carrito
- Detalle de los productos (nombre, tamaño, uso)
- Dispositivo (móvil o desktop)
- País y ciudad (si está disponible)
- Fecha y hora

## 🎯 Ventajas

Con estas estadísticas puedes:
- Saber cuántas personas realmente continúan con el pedido
- Identificar cuántos carritos se abandonan
- Calcular tu tasa de conversión real
- Ver el promedio de productos que las personas agregan antes de continuar o abandonar
- Tomar decisiones informadas para mejorar tu proceso de ventas

## 🚀 ¡Ya está todo listo!

Una vez que ejecutes el SQL, el sistema empezará a rastrear automáticamente estos eventos.
No necesitas hacer nada más. Los datos se mostrarán en tu panel de estadísticas.

