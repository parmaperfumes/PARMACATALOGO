"use client"

import useSWR from "swr"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminDashboardPage() {
	const { data, mutate, isLoading, error } = useSWR("/api/perfumes", fetcher)

	async function handleDelete(id: string) {
		if (!confirm("¿Eliminar este perfume?")) return
		const res = await fetch(`/api/perfumes/${id}`, { method: "DELETE" })
		if (res.ok) mutate()
		else alert(await res.text())
	}

	return (
		<div className="container mx-auto px-4 py-8 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Perfumes</h1>
				<Button asChild>
					<Link href="/perfumes/new">Agregar perfume</Link>
				</Button>
			</div>
			<div className="overflow-x-auto border rounded-lg">
				<table className="min-w-full text-sm">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-4 py-2 text-left">Nombre</th>
							<th className="px-4 py-2 text-left">Stock</th>
							<th className="px-4 py-2"></th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr><td className="px-4 py-6" colSpan={3}>Cargando...</td></tr>
						) : error ? (
							<tr><td className="px-4 py-6 text-red-500" colSpan={3}>Error al cargar</td></tr>
						) : (data ?? []).length === 0 ? (
							<tr><td className="px-4 py-6 text-muted-foreground" colSpan={3}>Sin datos (configura DATABASE_URL para persistir)</td></tr>
						) : (
							(data ?? []).map((p: any) => (
								<tr key={p.id} className="border-t">
									<td className="px-4 py-2">{p.nombre}</td>
									<td className="px-4 py-2">{p.stock}</td>
									<td className="px-4 py-2 flex gap-2 justify-end">
										<Link className="underline" href={`/perfumes/${p.id}/edit`}>Editar</Link>
										<button className="text-red-600 underline" onClick={() => handleDelete(p.id)}>Eliminar</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
