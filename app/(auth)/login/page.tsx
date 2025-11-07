export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
          <p className="text-muted-foreground mt-2">
            Accede al panel administrativo
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-center text-muted-foreground">
            Próximamente: Formulario de login con NextAuth
          </p>
        </div>
      </div>
    </div>
  )
}

