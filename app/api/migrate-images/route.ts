import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cloudinary } from "@/lib/cloudinary"

// Función para verificar si una URL es de Supabase
function isSupabaseUrl(url: string): boolean {
  return url.includes('supabase.co/storage')
}

// Función para subir una imagen desde URL a Cloudinary
async function uploadToCloudinary(imageUrl: string, folder: string = "perfume-catalog"): Promise<string | null> {
  try {
    // Generar nombre único
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 10)
    const publicId = `${folder}/${timestamp}-${randomString}`

    // Subir directamente desde URL (Cloudinary puede hacer fetch desde URLs)
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId,
      folder: folder,
      resource_type: "image",
      transformation: [
        { quality: "auto:good" },
        { fetch_format: "auto" }
      ],
      // Timeout de 60 segundos para imágenes grandes
      timeout: 60000
    })

    return result.secure_url
  } catch (error: any) {
    console.error(`Error al subir imagen a Cloudinary: ${imageUrl}`, error.message)
    return null
  }
}

// GET - Obtener estadísticas de imágenes a migrar
export async function GET(req: NextRequest) {
  try {
    // Verificar configuración de Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({
        error: "Cloudinary no configurado",
        message: "Configura CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET"
      }, { status: 500 })
    }

    // Obtener todos los perfumes
    const perfumes = await prisma.perfume.findMany({
      select: {
        id: true,
        nombre: true,
        imagenPrincipal: true,
        imagenes: true
      }
    })

    let supabaseImages = 0
    let cloudinaryImages = 0
    let otherImages = 0
    const perfumesToMigrate: string[] = []

    for (const perfume of perfumes) {
      let needsMigration = false

      // Verificar imagen principal
      if (isSupabaseUrl(perfume.imagenPrincipal)) {
        supabaseImages++
        needsMigration = true
      } else if (perfume.imagenPrincipal.includes('cloudinary')) {
        cloudinaryImages++
      } else {
        otherImages++
      }

      // Verificar imágenes adicionales
      for (const img of perfume.imagenes) {
        if (isSupabaseUrl(img)) {
          supabaseImages++
          needsMigration = true
        } else if (img.includes('cloudinary')) {
          cloudinaryImages++
        } else {
          otherImages++
        }
      }

      if (needsMigration) {
        perfumesToMigrate.push(perfume.nombre)
      }
    }

    return NextResponse.json({
      total_perfumes: perfumes.length,
      imagenes_en_supabase: supabaseImages,
      imagenes_en_cloudinary: cloudinaryImages,
      imagenes_otras: otherImages,
      perfumes_a_migrar: perfumesToMigrate.length,
      nombres_a_migrar: perfumesToMigrate.slice(0, 10), // Mostrar solo los primeros 10
      mensaje: supabaseImages > 0 
        ? `Hay ${supabaseImages} imágenes en Supabase que necesitan migración. Usa POST para iniciar la migración.`
        : "¡Todas las imágenes ya están en Cloudinary!"
    })
  } catch (error: any) {
    console.error("Error al obtener estadísticas:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Ejecutar migración
export async function POST(req: NextRequest) {
  try {
    // Verificar configuración de Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({
        error: "Cloudinary no configurado"
      }, { status: 500 })
    }

    const body = await req.json().catch(() => ({}))
    const dryRun = body.dryRun === true // Modo prueba sin guardar cambios
    const limit = body.limit || 100 // Límite de perfumes a procesar (por seguridad)

    // Obtener perfumes con imágenes de Supabase
    const perfumes = await prisma.perfume.findMany({
      take: limit,
      select: {
        id: true,
        nombre: true,
        imagenPrincipal: true,
        imagenes: true
      }
    })

    const results = {
      processed: 0,
      migrated: 0,
      errors: [] as string[],
      details: [] as any[]
    }

    for (const perfume of perfumes) {
      let updated = false
      let newImagenPrincipal = perfume.imagenPrincipal
      let newImagenes = [...perfume.imagenes]

      // Migrar imagen principal si es de Supabase
      if (isSupabaseUrl(perfume.imagenPrincipal)) {
        console.log(`Migrando imagen principal de: ${perfume.nombre}`)
        const newUrl = await uploadToCloudinary(perfume.imagenPrincipal, "perfumes")
        
        if (newUrl) {
          newImagenPrincipal = newUrl
          updated = true
          console.log(`✅ Migrada: ${perfume.nombre}`)
        } else {
          results.errors.push(`Error al migrar imagen principal de ${perfume.nombre}`)
        }
      }

      // Migrar imágenes adicionales si son de Supabase
      for (let i = 0; i < perfume.imagenes.length; i++) {
        if (isSupabaseUrl(perfume.imagenes[i])) {
          console.log(`Migrando imagen ${i + 1} de: ${perfume.nombre}`)
          const newUrl = await uploadToCloudinary(perfume.imagenes[i], "perfumes")
          
          if (newUrl) {
            newImagenes[i] = newUrl
            updated = true
          } else {
            results.errors.push(`Error al migrar imagen ${i + 1} de ${perfume.nombre}`)
          }
        }
      }

      // Actualizar en la base de datos si hubo cambios
      if (updated && !dryRun) {
        try {
          await prisma.perfume.update({
            where: { id: perfume.id },
            data: {
              imagenPrincipal: newImagenPrincipal,
              imagenes: newImagenes,
              updatedAt: new Date()
            }
          })
          results.migrated++
        } catch (dbError: any) {
          results.errors.push(`Error al actualizar BD para ${perfume.nombre}: ${dbError.message}`)
        }
      } else if (updated && dryRun) {
        results.migrated++
      }

      if (updated) {
        results.details.push({
          nombre: perfume.nombre,
          imagenPrincipal_anterior: perfume.imagenPrincipal,
          imagenPrincipal_nueva: newImagenPrincipal,
          imagenes_migradas: newImagenes.filter((img, i) => img !== perfume.imagenes[i]).length
        })
      }

      results.processed++
    }

    return NextResponse.json({
      success: true,
      dryRun,
      mensaje: dryRun 
        ? "Modo prueba - no se guardaron cambios en la BD"
        : `Migración completada: ${results.migrated} perfumes actualizados`,
      resultados: results
    })
  } catch (error: any) {
    console.error("Error en migración:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

