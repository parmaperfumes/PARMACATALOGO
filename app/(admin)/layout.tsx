export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Panel Administrativo</h1>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}

