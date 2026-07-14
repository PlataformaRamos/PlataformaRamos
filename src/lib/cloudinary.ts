const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''

interface OptimizationOptions {
  width?: number
  height?: number
  quality?: string // 'auto', 'best', 'good', 'eco', 'low'
  format?: string  // 'auto', 'webp', 'avif', 'png', 'jpg'
}

/**
 * Optimiza y transforma cualquier URL de imagen utilizando la API de Fetch de Cloudinary.
 * Convierte el formato a AVIF/WebP de forma automática (f_auto) y reduce el tamaño de archivo (q_auto).
 * 
 * @param imageUrl URL de la imagen original (Ej: subida a Cloudflare R2)
 * @param options Opciones de redimensionamiento y calidad
 */
export function getOptimizedImageUrl(imageUrl: string, options: OptimizationOptions = {}): string {
  if (!imageUrl) return ''
  if (!CLOUD_NAME) return imageUrl // Retorna la original si no hay configuración de Cloudinary

  // Si es un SVG o archivo local, no tiene sentido optimizarlo mediante Cloudinary
  if (imageUrl.endsWith('.svg') || imageUrl.startsWith('/')) {
    return imageUrl
  }

  const { width, height, quality = 'auto', format = 'auto' } = options

  // Construir los modificadores de Cloudinary
  const transformParts: string[] = [
    `f_${format}`,
    `q_${quality}`
  ]

  if (width) {
    transformParts.push(`w_${width}`)
  }
  if (height) {
    transformParts.push(`h_${height}`)
  }

  const transformString = transformParts.join(',')

  // Retornar la URL a través de la pasarela de Fetch de Cloudinary
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transformString}/${encodeURIComponent(imageUrl)}`
}
