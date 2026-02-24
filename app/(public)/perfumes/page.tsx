import { headers } from "next/headers"
import PerfumesClient, { type PerfumeFromDB } from "./PerfumesClient"

export const dynamic = "force-dynamic"

async function fetchPerfumesOnServer(): Promise<PerfumeFromDB[]> {
  const headersList = headers()
  const host = headersList.get("host") ?? "localhost:3000"
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
  const baseUrl = `${protocol}://${host}`

  try {
    const res = await fetch(`${baseUrl}/api/perfumes?t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })

    if (!res.ok) {
      console.error("Error al cargar perfumes en el servidor:", res.status, res.statusText)
      return []
    }

    const responseData = await res.json()
    const data: PerfumeFromDB[] = Array.isArray(responseData)
      ? responseData
      : (responseData.perfumes || [])

    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error al hacer fetch de perfumes en el servidor:", error)
    return []
  }
}

export default async function PerfumesPage() {
  const perfumes = await fetchPerfumesOnServer()
  return <PerfumesClient initialData={perfumes} />
}

