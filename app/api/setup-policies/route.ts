import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      return new NextResponse(
        "Supabase no configurado. Configura NEXT_PUBLIC_SUPABASE_URL",
        { status: 500 }
      )
    }

    // Necesitamos el service role key para configurar políticas
    if (!serviceRoleKey) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Se necesita SUPABASE_SERVICE_ROLE_KEY para configurar las políticas. Agrégalo en .env.local",
          needsServiceRoleKey: true,
        }),
        { status: 403 }
      )
    }

    // Crear cliente admin para ejecutar SQL
    const adminClient = supabaseAdmin
    if (!adminClient) {
      return new NextResponse(
        "No se pudo crear el cliente de Supabase admin",
        { status: 500 }
      )
    }

    // Políticas SQL para permitir subida y lectura pública
    const policies = [
      // Política para INSERT (subir archivos) - usuarios anónimos
      `CREATE POLICY IF NOT EXISTS "Allow public uploads" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'perfumes');`,
      
      // Política para SELECT (leer archivos) - usuarios anónimos
      `CREATE POLICY IF NOT EXISTS "Allow public reads" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'perfumes');`,
      
      // Política para INSERT - usuarios autenticados
      `CREATE POLICY IF NOT EXISTS "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'perfumes');`,
      
      // Política para SELECT - usuarios autenticados
      `CREATE POLICY IF NOT EXISTS "Allow authenticated reads" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'perfumes');`,
    ]

    // Ejecutar cada política usando RPC o directamente con SQL
    // Nota: Supabase no permite ejecutar SQL directo desde el cliente JS
    // Necesitamos usar la API REST de PostgREST o configurar manualmente
    
    // Alternativa: Usar la API REST de Supabase para ejecutar funciones
    // Pero la forma más directa es usar el cliente admin con rpc
    
    // Intentar deshabilitar RLS temporalmente o crear políticas mediante la API
    // La mejor forma es usar fetch directo a la API de Supabase
    
    const results = []
    for (const policy of policies) {
      try {
        // Usar la API REST de Supabase para ejecutar SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": serviceRoleKey,
            "Authorization": `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({ sql: policy }),
        })

        if (!response.ok) {
          // Si no existe la función exec_sql, intentar otro método
          console.warn(`No se pudo ejecutar política: ${policy}`)
        } else {
          results.push({ policy, success: true })
        }
      } catch (error) {
        console.warn(`Error ejecutando política: ${error}`)
      }
    }

    // Si no podemos ejecutar SQL directamente, retornar instrucciones
    if (results.length === 0) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "No se pudo configurar las políticas automáticamente. Por favor, configúralas manualmente en Supabase Dashboard > Storage > perfumes > Policies",
          instructions: [
            "1. Ve a Supabase Dashboard > Storage > perfumes",
            "2. Haz clic en 'Policies'",
            "3. Haz clic en 'New Policy'",
            "4. Selecciona 'For full customization'",
            "5. Crea estas políticas:",
            "   - INSERT para 'anon' y 'authenticated'",
            "   - SELECT para 'anon' y 'authenticated'",
            "6. Policy definition: (bucket_id = 'perfumes')",
          ],
        }),
        { status: 200 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Políticas configuradas exitosamente",
      policiesCreated: results.length,
    })
  } catch (error: any) {
    console.error("Error al configurar políticas:", error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: `Error: ${error.message}`,
      }),
      { status: 500 }
    )
  }
}

