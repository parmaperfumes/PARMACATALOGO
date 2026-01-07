"use client"

import { useState } from "react"
import Link from "next/link"

type Stats = {
  total_perfumes: number
  imagenes_en_supabase: number
  imagenes_en_cloudinary: number
  imagenes_otras: number
  perfumes_a_migrar: number
  nombres_a_migrar: string[]
  mensaje: string
}

type MigrationResult = {
  success: boolean
  dryRun: boolean
  mensaje: string
  resultados: {
    processed: number
    migrated: number
    errors: string[]
    details: any[]
  }
}

export default function MigracionPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [result, setResult] = useState<MigrationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/migrate-images")
      const data = await res.json()
      if (data.error) {
        setError(data.error + ": " + (data.message || ""))
      } else {
        setStats(data)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const runMigration = async (dryRun: boolean) => {
    setMigrating(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch("/api/migrate-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun, limit: 100 })
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
        // Refrescar estadísticas después de migrar
        if (!dryRun) {
          setTimeout(fetchStats, 1000)
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setMigrating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="text-purple-300 hover:text-purple-100 text-sm mb-4 inline-block"
          >
            ← Volver al Admin
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            🖼️ Migración de Imágenes
          </h1>
          <p className="text-purple-200">
            Migra las imágenes de Supabase Storage a Cloudinary
          </p>
        </div>

        {/* Card de estadísticas */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            📊 Estado Actual
          </h2>
          
          {!stats && !loading && (
            <button
              onClick={fetchStats}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Verificar Imágenes
            </button>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-purple-200">
              <div className="animate-spin h-5 w-5 border-2 border-purple-400 border-t-transparent rounded-full"></div>
              Analizando imágenes...
            </div>
          )}

          {stats && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">{stats.total_perfumes}</div>
                  <div className="text-purple-300 text-sm">Total Perfumes</div>
                </div>
                <div className="bg-orange-500/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-orange-400">{stats.imagenes_en_supabase}</div>
                  <div className="text-orange-300 text-sm">En Supabase</div>
                </div>
                <div className="bg-green-500/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-400">{stats.imagenes_en_cloudinary}</div>
                  <div className="text-green-300 text-sm">En Cloudinary</div>
                </div>
                <div className="bg-blue-500/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-400">{stats.perfumes_a_migrar}</div>
                  <div className="text-blue-300 text-sm">A Migrar</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-purple-200">{stats.mensaje}</p>
              </div>

              {stats.nombres_a_migrar.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-2">Perfumes a migrar (primeros 10):</h3>
                  <div className="flex flex-wrap gap-2">
                    {stats.nombres_a_migrar.map((nombre, i) => (
                      <span key={i} className="bg-orange-500/30 text-orange-200 px-3 py-1 rounded-full text-sm">
                        {nombre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={fetchStats}
                className="text-purple-300 hover:text-purple-100 text-sm underline"
              >
                Actualizar estadísticas
              </button>
            </div>
          )}
        </div>

        {/* Card de migración */}
        {stats && stats.imagenes_en_supabase > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              🚀 Ejecutar Migración
            </h2>
            
            <div className="space-y-4">
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-yellow-200 text-sm">
                  <strong>⚠️ Importante:</strong> La migración puede tardar varios minutos 
                  dependiendo del número de imágenes. No cierres esta página durante el proceso.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => runMigration(true)}
                  disabled={migrating}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {migrating ? "Procesando..." : "🔍 Prueba (sin guardar)"}
                </button>
                
                <button
                  onClick={() => runMigration(false)}
                  disabled={migrating}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {migrating ? "Migrando..." : "✅ Migrar Ahora"}
                </button>
              </div>

              {migrating && (
                <div className="flex items-center gap-3 text-purple-200">
                  <div className="animate-spin h-5 w-5 border-2 border-green-400 border-t-transparent rounded-full"></div>
                  Migrando imágenes a Cloudinary... Esto puede tardar varios minutos.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resultado de migración */}
        {result && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {result.success ? "✅ Resultado" : "❌ Error"}
            </h2>
            
            <div className="space-y-4">
              {result.dryRun && (
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-blue-200 text-sm">
                    <strong>Modo Prueba:</strong> No se guardaron cambios en la base de datos.
                  </p>
                </div>
              )}

              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white">{result.mensaje}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{result.resultados.processed}</div>
                  <div className="text-purple-300 text-sm">Procesados</div>
                </div>
                <div className="bg-green-500/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{result.resultados.migrated}</div>
                  <div className="text-green-300 text-sm">Migrados</div>
                </div>
                <div className="bg-red-500/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">{result.resultados.errors.length}</div>
                  <div className="text-red-300 text-sm">Errores</div>
                </div>
              </div>

              {result.resultados.errors.length > 0 && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                  <h3 className="text-red-300 font-medium mb-2">Errores:</h3>
                  <ul className="text-red-200 text-sm space-y-1">
                    {result.resultados.errors.map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.resultados.details.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-2">Detalles de migración:</h3>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {result.resultados.details.map((detail, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3 text-sm">
                        <div className="text-white font-medium">{detail.nombre}</div>
                        <div className="text-purple-300 truncate text-xs">
                          Anterior: {detail.imagenPrincipal_anterior}
                        </div>
                        <div className="text-green-300 truncate text-xs">
                          Nueva: {detail.imagenPrincipal_nueva}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error general */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-red-300 mb-2">❌ Error</h2>
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Información adicional */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-3">ℹ️ Información</h2>
          <ul className="text-purple-200 text-sm space-y-2">
            <li>• Las imágenes se subirán a Cloudinary con optimización automática</li>
            <li>• Las URLs en la base de datos se actualizarán automáticamente</li>
            <li>• Las imágenes originales en Supabase NO se eliminarán automáticamente</li>
            <li>• Después de verificar que todo funciona, puedes eliminar el bucket de Supabase manualmente</li>
            <li>• Cloudinary tiene 25GB de almacenamiento y ancho de banda gratis</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

