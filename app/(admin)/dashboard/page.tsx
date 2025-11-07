export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Total Perfumes</h2>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Categorías</h2>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Marcas</h2>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  )
}

