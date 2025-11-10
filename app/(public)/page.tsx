// Version: 2024-01-16 - Force Vercel rebuild - Landing page
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="text-center space-y-4 sm:space-y-6 max-w-2xl w-full px-4">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold">
          Catálogo de Perfumes
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-2">
          Descubre nuestra colección exclusiva de fragancias
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/perfumes">Ver Catálogo</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
            <Link href="/login">Administración</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

