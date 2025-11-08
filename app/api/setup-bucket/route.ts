import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return new NextResponse(
        "Supabase no configurado. Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY",
        { status: 500 }
      )
    }

    // Intentar crear el bucket usando la API REST de Supabase
    // Necesitamos el service role key para crear buckets
    const keyToUse = serviceRoleKey || supabaseAnonKey

    const response = await fetch(`${supabaseUrl}/rest/v1/storage/buckets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": keyToUse,
        "Authorization": `Bearer ${keyToUse}`,
      },
      body: JSON.stringify({
        id: "perfumes",
        name: "perfumes",
        public: true, // Bucket público para que las imágenes sean accesibles
        file_size_limit: 5242880, // 5MB en bytes
        allowed_mime_types: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Si el bucket ya existe, eso está bien
      if (response.status === 409 || data?.message?.includes("already exists")) {
        return NextResponse.json({
          success: true,
          message: "El bucket 'perfumes' ya existe",
        })
      }

      // Si no tenemos permisos, necesitamos el service role key
      if (response.status === 401 || response.status === 403) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: "Se necesita SUPABASE_SERVICE_ROLE_KEY para crear el bucket. Por favor, agrega esta variable en .env.local. Puedes encontrarla en Supabase Dashboard > Settings > API > service_role key",
            needsServiceRoleKey: true,
          }),
          { status: 403 }
        )
      }

      return new NextResponse(
        JSON.stringify({
          success: false,
          message: `Error al crear bucket: ${data.message || response.statusText}`,
          error: data,
        }),
        { status: response.status }
      )
    }

    // Configurar políticas para permitir subida anónima
    try {
      const policyResponse = await fetch(`${supabaseUrl}/rest/v1/storage/buckets/perfumes/policies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": keyToUse,
          "Authorization": `Bearer ${keyToUse}`,
        },
        body: JSON.stringify({
          name: "Allow public uploads",
          definition: {
            bucket_id: "perfumes",
          },
          check: "true",
          role: "anon",
        }),
      })

      // No importa si falla la política, el bucket ya está creado
      console.log("Política de acceso:", policyResponse.status)
    } catch (policyError) {
      console.warn("No se pudo configurar la política automáticamente:", policyError)
    }

    return NextResponse.json({
      success: true,
      message: "Bucket 'perfumes' creado exitosamente",
    })
  } catch (error: any) {
    console.error("Error al crear bucket:", error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: `Error: ${error.message}`,
      }),
      { status: 500 }
    )
  }
}


