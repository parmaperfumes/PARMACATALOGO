import { NextRequest, NextResponse } from "next/server"
import { cloudinary } from "@/lib/cloudinary"

export async function POST(req: NextRequest) {
  try {
    // Verificar que Cloudinary esté configurado
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return new NextResponse(
        JSON.stringify({
          error: "Cloudinary no configurado",
          message: "Configura CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en .env.local",
        }),
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

    // Validar tamaño (máximo 10MB para Cloudinary)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return new NextResponse(
        "El archivo es demasiado grande. Máximo 10MB",
        { status: 400 }
      )
    }

    // Convertir File a base64 para Cloudinary
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString("base64")
    const dataUri = `data:${file.type};base64,${base64}`

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const publicId = `perfumes/${timestamp}-${randomString}`

    // Subir a Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      public_id: publicId,
      folder: "perfume-catalog",
      resource_type: "image",
      // Optimizaciones automáticas
      transformation: [
        { quality: "auto:good" },
        { fetch_format: "auto" }
      ]
    })

    return NextResponse.json({
      url: uploadResult.secure_url,
      path: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
    })
  } catch (error: any) {
    console.error("Error en upload a Cloudinary:", error)
    return new NextResponse(
      JSON.stringify({
        error: "Error al subir imagen",
        message: error.message || "Error desconocido al subir a Cloudinary",
      }),
      { status: 500 }
    )
  }
}
