import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, supabase } from "@/lib/supabase"
import sharp from "sharp"

export async function POST(req: NextRequest) {
  try {
    // Usar admin si está disponible, sino usar el cliente normal
    const client = supabaseAdmin || supabase
    
    if (!client) {
      return new NextResponse(
        "Supabase no configurado. Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local",
        { status: 500 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return new NextResponse("No se proporcionó ningún archivo", { status: 400 })
    }

    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return new NextResponse(
        "Tipo de archivo no válido. Solo se permiten: JPEG, PNG, WEBP",
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return new NextResponse(
        "El archivo es demasiado grande. Máximo 5MB",
        { status: 400 }
      )
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    let fileExt = file.name.split(".").pop()
    let fileName = `perfumes/${timestamp}-${randomString}.${fileExt}`
    let contentType = file.type

    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer()
    let buffer = Buffer.from(arrayBuffer)

    // NOTA: Procesamiento automático de eliminación de fondo desactivado temporalmente
    // para evitar problemas con las imágenes. Las imágenes se suben sin modificación.
    // Si necesitas eliminar el fondo, hazlo manualmente antes de subir la imagen.
    
    // Procesar imagen para eliminar fondo blanco automáticamente (DESACTIVADO)
    // if (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/jpg") {
    //   try {
    //     const image = sharp(buffer)
    //     
    //     // Convertir a RGBA para poder manipular la transparencia
    //     const { data, info } = await image
    //       .ensureAlpha() // Asegurar canal alfa
    //       .raw()
    //       .toBuffer({ resolveWithObject: true })
    //     
    //     // Procesar píxeles: hacer transparentes los que son blancos o casi blancos
    //     const pixelData = Buffer.from(data)
    //     for (let i = 0; i < pixelData.length; i += 4) {
    //       const r = pixelData[i]
    //       const g = pixelData[i + 1]
    //       const b = pixelData[i + 2]
    //       
    //       // Detectar píxeles blancos o casi blancos (umbral: 245 en cada canal RGB)
    //       // Esto elimina fondos blancos puros y casi blancos
    //       if (r >= 245 && g >= 245 && b >= 245) {
    //         pixelData[i + 3] = 0 // Hacer completamente transparente
    //       }
    //     }
    //     
    //     // Reconstruir la imagen con el fondo eliminado
    //     buffer = await sharp(pixelData, {
    //       raw: {
    //         width: info.width,
    //         height: info.height,
    //         channels: 4
    //       }
    //     })
    //     .png() // Guardar como PNG para mantener transparencia
    //     .toBuffer()
    //     
    //     // Actualizar extensión y tipo de contenido a PNG
    //     fileExt = "png"
    //     fileName = `perfumes/${timestamp}-${randomString}.${fileExt}`
    //     contentType = "image/png"
    //   } catch (processError) {
    //     // Si falla el procesamiento, continuar con la imagen original
    //     console.warn("No se pudo procesar la imagen para eliminar fondo:", processError)
    //     buffer = Buffer.from(arrayBuffer)
    //   }
    // }

    // Subir a Supabase Storage
    const { data, error } = await client.storage
      .from("perfumes")
      .upload(fileName, buffer, {
        contentType: contentType,
        upsert: false,
      })

    if (error) {
      console.error("Error al subir archivo:", error)
      
      // Si hay error de RLS (Row Level Security), intentar configurar políticas
      if (error.message.includes("row-level security") || error.message.includes("RLS") || error.message.includes("policy")) {
        try {
          const policiesRes = await fetch(`${req.nextUrl.origin}/api/setup-policies`, {
            method: "POST",
          })
          
          const policiesData = await policiesRes.json()
          
          if (policiesRes.ok && policiesData.success) {
            // Reintentar la subida después de configurar políticas
            const retryResult = await client.storage
              .from("perfumes")
              .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false,
              })
            
            if (retryResult.error) {
              return new NextResponse(
                JSON.stringify({
                  error: "Error después de configurar políticas",
                  message: retryResult.error.message,
                  needsManualSetup: true,
                }),
                { status: 500 }
              )
            }
            
            // Obtener URL pública
            const { data: urlData } = client.storage
              .from("perfumes")
              .getPublicUrl(retryResult.data.path)
            
            return NextResponse.json({
              url: urlData.publicUrl,
              path: retryResult.data.path,
            })
          } else {
            // Si no se pudo configurar automáticamente, dar instrucciones
            return new NextResponse(
              JSON.stringify({
                error: "Error de políticas de seguridad (RLS)",
                message: policiesData.message || "Las políticas de seguridad no están configuradas. Ejecuta el archivo SQL en Supabase Dashboard > SQL Editor",
                needsManualSetup: true,
                sqlFile: "supabase-storage-policies.sql",
              }),
              { status: 500 }
            )
          }
        } catch (policiesError: any) {
          return new NextResponse(
            JSON.stringify({
              error: "Error al configurar políticas",
              message: `No se pudieron configurar las políticas automáticamente: ${policiesError.message}. Por favor, ejecuta el archivo supabase-storage-policies.sql en Supabase Dashboard > SQL Editor`,
              needsManualSetup: true,
            }),
            { status: 500 }
          )
        }
      }
      
      // Si el bucket no existe, intentar crearlo automáticamente
      if (error.message.includes("Bucket not found") || error.message.includes("bucket")) {
        try {
          // Intentar crear el bucket
          const setupRes = await fetch(`${req.nextUrl.origin}/api/setup-bucket`, {
            method: "POST",
          })
          
          const setupData = await setupRes.json()
          
          if (setupRes.ok && setupData.success) {
            // Reintentar la subida después de crear el bucket
            const retryResult = await client.storage
              .from("perfumes")
              .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false,
              })
            
            if (retryResult.error) {
              return new NextResponse(
                `Error al subir archivo después de crear el bucket: ${retryResult.error.message}`,
                { status: 500 }
              )
            }
            
            // Obtener URL pública
            const { data: urlData } = client.storage
              .from("perfumes")
              .getPublicUrl(retryResult.data.path)
            
            return NextResponse.json({
              url: urlData.publicUrl,
              path: retryResult.data.path,
            })
          } else {
            // Si no se pudo crear automáticamente, dar instrucciones
            return new NextResponse(
              JSON.stringify({
                error: "El bucket 'perfumes' no existe y no se pudo crear automáticamente.",
                message: setupData.message || "Por favor, crea el bucket manualmente desde el dashboard de Supabase o agrega SUPABASE_SERVICE_ROLE_KEY en .env.local",
                needsSetup: true,
              }),
              { status: 500 }
            )
          }
        } catch (setupError: any) {
          return new NextResponse(
            `Error al crear bucket: ${setupError.message}. Por favor, crea el bucket 'perfumes' manualmente desde el dashboard de Supabase.`,
            { status: 500 }
          )
        }
      }
      
      return new NextResponse(
        `Error al subir archivo: ${error.message}`,
        { status: 500 }
      )
    }

    // Obtener URL pública
    const { data: urlData } = client.storage
      .from("perfumes")
      .getPublicUrl(data.path)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path,
    })
  } catch (error: any) {
    console.error("Error en upload:", error)
    return new NextResponse(
      `Error al procesar la imagen: ${error.message}`,
      { status: 500 }
    )
  }
}

