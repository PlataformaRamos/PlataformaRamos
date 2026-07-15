import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // 1. Refrescar sesión de Supabase Auth
  const supabaseResponse = await updateSession(request)

  const url = request.nextUrl
  const host = request.headers.get('host') || ''

  // Normalizar el host (remover puerto y prefijo www. para evitar bucles)
  const rawHostname = host.split(':')[0]
  const hostname = rawHostname.replace(/^www\./, '')
  const path = url.pathname

  // Omitir peticiones internas y recursos estáticos
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.includes('.') ||
    path.startsWith('/static')
  ) {
    return supabaseResponse
  }

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const rootDomainName = rootDomain.split(':')[0]

  // Comprobar pertenencia al dominio principal y subdominios del sistema
  const isRootDomain = 
    hostname === rootDomainName || 
    hostname === 'localhost' || 
    hostname === 'plataforma-ramos.vercel.app'
  const isConsoleDomain = hostname.startsWith('app.')

  if (isConsoleDomain) {
    if (path === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  if (isRootDomain) {
    return supabaseResponse
  }

  // Es un subdominio o dominio personalizado de inquilino (tienda)
  let tenantDomain = hostname

  // Si es un subdominio de la plataforma, extraemos el slug (ej: tienda1.plataforma.com -> tienda1)
  if (hostname.endsWith('.' + rootDomainName)) {
    tenantDomain = hostname.replace('.' + rootDomainName, '')
  }

  // Si la ruta ya empieza con el dominio del inquilino (evitar bucle de reescritura en pasadas de Next.js)
  if (path.startsWith(`/${tenantDomain}`)) {
    return supabaseResponse
  }

  // Reescribir dinámicamente hacia la carpeta dinámica de inquilinos
  return NextResponse.rewrite(new URL(`/${tenantDomain}${path}`, request.url))
}

export const config = {
  matcher: [
    '/((?!api|_next|_static|_next/image|favicon.ico|auth/callback|.*\\..*).*)',
  ],
}
