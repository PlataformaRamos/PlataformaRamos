import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2 } from '@/lib/r2'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticación del usuario administrador
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // 2. Extraer archivo y ruta del FormData
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const uploadPath = formData.get('path') as string | null // Ej. "stores/id-tienda/logo"

    if (!file || !uploadPath) {
      return NextResponse.json({ error: 'Archivo o ruta de destino ausente' }, { status: 400 })
    }

    // 3. Convertir el archivo a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const contentType = file.type || 'application/octet-stream'

    // 4. Subir a Cloudflare R2
    // Ejemplo de Key: "stores/id-tienda/logo.jpg"
    const extension = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}.${extension}`
    const r2Key = `${uploadPath}/${fileName}`

    const publicUrl = await uploadToR2(buffer, r2Key, contentType)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key: r2Key
    })

  } catch (error: any) {
    console.error('[Upload API Error]:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}
