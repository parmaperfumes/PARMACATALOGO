import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cloudinary } from "@/lib/cloudinary"

// Este endpoint migra las imágenes de Supabase a Cloudinary
// Protegido por una clave secreta para evitar uso no autorizado

export async function POST(req: NextRequest) {
  try {
    // Verificar clave secreta de autorización
    const body = await req.json()
    const { secretKey } = body
    
    // La clave debe coincidir con MIGRATION_SECRET_KEY en las variables de entorno
    if (secretKey !== process.env.MIGRATION_SECRET_KEY) {
      return NextResponse.json(
        { error: "No autorizado. Clave secreta incorrecta." },
        { status: 401 }
      )
    }

    // Verificar que Cloudinary esté configurado
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary no está configurado. Agrega las variables de entorno." },
        { status: 500 }
      )
    }

    // Obtener todos los perfumes con imágenes de Supabase
    const perfumes = await prisma.perfume.findMany({
      select: {
        id: true,
        nombre: true,
        imagenPrincipal: true,
        imagenes: true,
      }
    })

    const results: {
      id: string
      nombre: string
      status: "success" | "skipped" | "error"
      message: string
      oldUrls?: string[]
      newUrls?: string[]
    }[] = []

    let migratedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const perfume of perfumes) {
      try {
        // Verificar si las imágenes ya están en Cloudinary (ya migradas)
        const isSupabaseUrl = (url: string) => 
          url.includes("supabase.co") || url.includes("supabase.in")
        
        const mainImageIsSupabase = isSupabaseUrl(perfume.imagenPrincipal)
        const galleryHasSupabase = perfume.imagenes.some(isSupabaseUrl)

        if (!mainImageIsSupabase && !galleryHasSupabase) {
          results.push({
            id: perfume.id,
            nombre: perfume.nombre,
            status: "skipped",
            message: "Imágenes ya migradas a Cloudinary"
          })
          skippedCount++
          continue
        }

        const oldUrls: string[] = []
        const newUrls: string[] = []

        // Migrar imagen principal
        let newMainImage = perfume.imagenPrincipal
        if (mainImageIsSupabase) {
          oldUrls.push(perfume.imagenPrincipal)
          newMainImage = await migrateImageToCloudinary(
            perfume.imagenPrincipal,
            `perfumes/${perfume.id}/main`
          )
          newUrls.push(newMainImage)
        }

        // Migrar galería de imágenes
        const newGallery: string[] = []
        for (let i = 0; i < perfume.imagenes.length; i++) {
          const imgUrl = perfume.imagenes[i]
          if (isSupabaseUrl(imgUrl)) {
            oldUrls.push(imgUrl)
            const newUrl = await migrateImageToCloudinary(
              imgUrl,
              `perfumes/${perfume.id}/gallery-${i}`
            )
            newGallery.push(newUrl)
            newUrls.push(newUrl)
          } else {
            // Ya está en Cloudinary, mantener
            newGallery.push(imgUrl)
          }
        }

        // Actualizar en la base de datos
        await prisma.perfume.update({
          where: { id: perfume.id },
          data: {
            imagenPrincipal: newMainImage,
            imagenes: newGallery.length > 0 ? newGallery : [newMainImage],
          }
        })

        results.push({
          id: perfume.id,
          nombre: perfume.nombre,
          status: "success",
          message: `Migradas ${newUrls.length} imagen(es)`,
          oldUrls,
          newUrls,
        })
        migratedCount++

      } catch (error: any) {
        results.push({
          id: perfume.id,
          nombre: perfume.nombre,
          status: "error",
          message: error.message || "Error desconocido"
        })
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: perfumes.length,
        migrated: migratedCount,
        skipped: skippedCount,
        errors: errorCount,
      },
      results,
    })

  } catch (error: any) {
    console.error("Error en migración:", error)
    return NextResponse.json(
      { error: "Error en la migración", message: error.message },
      { status: 500 }
    )
  }
}

// Función para migrar una imagen individual de Supabase a Cloudinary
async function migrateImageToCloudinary(supabaseUrl: string, publicId: string): Promise<string> {
  try {
    // Cloudinary puede subir directamente desde una URL
    const uploadResult = await cloudinary.uploader.upload(supabaseUrl, {
      public_id: publicId,
      folder: "perfume-catalog",
      resource_type: "image",
      overwrite: true,
      // Optimizaciones automáticas
      transformation: [
        { quality: "auto:good" },
        { fetch_format: "auto" }
      ]
    })

    return uploadResult.secure_url
  } catch (error: any) {
    console.error(`Error migrando imagen ${supabaseUrl}:`, error)
    throw new Error(`No se pudo migrar: ${error.message}`)
  }
}

// Endpoint GET para verificar el estado (sin ejecutar migración)
export async function GET(req: NextRequest) {
  try {
    // Contar imágenes pendientes de migración
    const perfumes = await prisma.perfume.findMany({
      select: {
        id: true,
        nombre: true,
        imagenPrincipal: true,
        imagenes: true,
      }
    })

    const isSupabaseUrl = (url: string) => 
      url.includes("supabase.co") || url.includes("supabase.in")

    let pendingCount = 0
    let migratedCount = 0
    const pendingPerfumes: { id: string; nombre: string; imageCount: number }[] = []

    for (const perfume of perfumes) {
      const mainImageIsSupabase = isSupabaseUrl(perfume.imagenPrincipal)
      const supabaseImages = perfume.imagenes.filter(isSupabaseUrl)
      
      if (mainImageIsSupabase || supabaseImages.length > 0) {
        pendingCount++
        pendingPerfumes.push({
          id: perfume.id,
          nombre: perfume.nombre,
          imageCount: (mainImageIsSupabase ? 1 : 0) + supabaseImages.length
        })
      } else {
        migratedCount++
      }
    }

    return NextResponse.json({
      status: "ready",
      cloudinaryConfigured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
      migrationSecretConfigured: !!process.env.MIGRATION_SECRET_KEY,
      summary: {
        totalPerfumes: perfumes.length,
        pendingMigration: pendingCount,
        alreadyMigrated: migratedCount,
      },
      pendingPerfumes: pendingPerfumes.slice(0, 10), // Mostrar solo los primeros 10
      instructions: pendingCount > 0 
        ? "Envía un POST a este endpoint con { secretKey: 'tu_clave' } para iniciar la migración"
        : "¡Todas las imágenes ya están migradas a Cloudinary!"
    })

  } catch (error: any) {
    console.error("Error verificando estado:", error)
    return NextResponse.json(
      { error: "Error verificando estado", message: error.message },
      { status: 500 }
    )
  }
}

