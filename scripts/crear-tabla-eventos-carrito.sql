-- Crear tabla para rastrear eventos del carrito de compras
-- Ejecutar en Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS eventos_carrito (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL, -- 'click_continuar' o 'carrito_abandonado'
  cantidad_items INTEGER NOT NULL DEFAULT 0,
  items JSONB, -- Información de los productos en el carrito
  dispositivo VARCHAR(20),
  pais VARCHAR(100),
  ciudad VARCHAR(100),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_eventos_carrito_tipo ON eventos_carrito(tipo);
CREATE INDEX IF NOT EXISTS idx_eventos_carrito_fecha ON eventos_carrito(createdAt);
CREATE INDEX IF NOT EXISTS idx_eventos_carrito_tipo_fecha ON eventos_carrito(tipo, createdAt);

-- Comentarios
COMMENT ON TABLE eventos_carrito IS 'Tabla para rastrear eventos de carrito: clicks en continuar pedido y carritos abandonados';
COMMENT ON COLUMN eventos_carrito.tipo IS 'Tipo de evento: click_continuar o carrito_abandonado';
COMMENT ON COLUMN eventos_carrito.cantidad_items IS 'Número de productos en el carrito al momento del evento';
COMMENT ON COLUMN eventos_carrito.items IS 'Detalle de los productos en formato JSON';

