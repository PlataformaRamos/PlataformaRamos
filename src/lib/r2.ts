import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

// 1. Inicializar el cliente S3 para Cloudflare R2
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || ''
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''

/**
 * Sube un archivo a Cloudflare R2 y retorna la URL pública del objeto.
 * @param fileBuffer Buffer binario del archivo
 * @param key Ruta del objeto dentro del bucket (Ej. "stores/123/productos/prod-abc.png")
 * @param contentType Tipo MIME de la imagen/archivo (Ej. "image/png")
 */
export async function uploadToR2(
  fileBuffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  // Limpiar barras iniciales para evitar subdirectorios vacíos
  const cleanKey = key.startsWith('/') ? key.slice(1) : key

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: cleanKey,
    Body: fileBuffer,
    ContentType: contentType,
  })

  await r2Client.send(command)

  // Construir y retornar la URL pública del archivo
  return `${PUBLIC_URL}/${cleanKey}`
}

/**
 * Elimina un objeto almacenado en Cloudflare R2.
 * @param key Ruta del objeto dentro del bucket
 */
export async function deleteFromR2(key: string): Promise<void> {
  const cleanKey = key.startsWith('/') ? key.slice(1) : key

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: cleanKey,
  })

  await r2Client.send(command)
}
