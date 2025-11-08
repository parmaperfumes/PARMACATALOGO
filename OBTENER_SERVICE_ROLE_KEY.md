# Cómo Obtener el Service Role Key de Supabase

Para que el sistema pueda crear el bucket automáticamente, necesitas agregar el **Service Role Key** a tu `.env.local`.

## Pasos:

1. **Ve a tu proyecto en Supabase:**
   - https://supabase.com/dashboard/project/vwmdppmlczmdbfmqbzcr

2. **Ve a Settings (Configuración):**
   - En el menú lateral, haz clic en **Settings** (⚙️)
   - Luego haz clic en **API**

3. **Copia el Service Role Key:**
   - Busca la sección **Project API keys**
   - Encuentra **`service_role`** (⚠️ **secreto**)
   - Haz clic en el ícono de **copiar** o **revelar** para ver la clave
   - **IMPORTANTE**: Esta clave tiene permisos completos, no la compartas públicamente

4. **Agrega la clave a `.env.local`:**
   ```env
   SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui"
   ```

5. **Reinicia el servidor:**
   ```bash
   npx next dev -p 3001
   ```

## ⚠️ Seguridad

- **NUNCA** subas el `.env.local` a Git
- **NUNCA** compartas el Service Role Key públicamente
- Esta clave tiene permisos administrativos completos en tu proyecto

## Alternativa: Crear el bucket manualmente

Si prefieres no usar el Service Role Key, puedes crear el bucket manualmente:

1. Ve a **Storage** en el dashboard de Supabase
2. Haz clic en **New bucket**
3. Nombre: `perfumes`
4. Marca **Public bucket** ✅
5. Haz clic en **Create bucket**

Después de crear el bucket manualmente, el sistema funcionará sin necesidad del Service Role Key.


