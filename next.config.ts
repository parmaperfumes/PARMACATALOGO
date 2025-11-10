import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	images: {
		// Habilita dominios remotos usados en ProductCard y Header
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
			{
				protocol: 'https',
				hostname: '*.supabase.co',
			},
		],
		// Optimizaciones de imágenes
		formats: ['image/avif', 'image/webp'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		minimumCacheTTL: 60,
	},
	// Optimizaciones de compilación
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production' ? {
			exclude: ['error', 'warn'],
		} : false,
	},
	// Optimizaciones de producción
	poweredByHeader: false,
	compress: true,
}

export default nextConfig
