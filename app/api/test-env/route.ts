import { NextResponse } from "next/server"

export async function GET() {
	const hasDbUrl = !!process.env.DATABASE_URL
	const dbUrlPreview = process.env.DATABASE_URL 
		? process.env.DATABASE_URL.substring(0, 50) + "..." 
		: "NO CONFIGURADA"
	
	return NextResponse.json({
		DATABASE_URL_exists: hasDbUrl,
		DATABASE_URL_preview: dbUrlPreview,
		all_env_keys: Object.keys(process.env).filter(k => k.includes("DATABASE") || k.includes("SUPABASE"))
	})
}

