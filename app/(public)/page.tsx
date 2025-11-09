// Version: 2024-01-16 - Force Vercel rebuild - Landing page
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold">
          Catálogo de Perfumes
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Descubre nuestra colección exclusiva de fragancias
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg">
            <Link href="/perfumes">Ver Catálogo</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/login">Administración</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

