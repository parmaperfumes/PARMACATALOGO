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
	},
}

export default nextConfig
