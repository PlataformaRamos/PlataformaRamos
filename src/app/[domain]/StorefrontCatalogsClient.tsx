'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingBag, ChevronRight, Phone, Mail, MapPin } from 'lucide-react'

interface Catalog {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_default: boolean
}

interface Product {
  id: string
  title: string
  slug: string
  description: string | null
  price: number
  images: string[]
}

interface StorefrontCatalogsClientProps {
  store: {
    id: string
    name: string
    slug: string
    whatsapp_phone: string
    currency_code: string
    theme_settings: any
    show_decimals: boolean
    logo_url: string | null
    instagram_handle?: string | null
    contact_email?: string | null
    address_details?: string | null
    description?: string | null
  }
  catalogs: Catalog[]
  catalogRelations: any[]
  products: Product[]
}

export default function StorefrontCatalogsClient({
  store,
  catalogs,
  catalogRelations,
  products,
}: StorefrontCatalogsClientProps) {
  const getProductLink = (slug: string) => `/p/${slug}`

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: store.currency_code || 'PEN',
      minimumFractionDigits: store.show_decimals ? 2 : 0,
      maximumFractionDigits: store.show_decimals ? 2 : 0,
    }).format(Number(price))
  }

  const getOptimizedImageUrl = (url: string, options: { width?: number; height?: number; quality?: number } = {}) => {
    if (!url) return ''
    if (url.includes('cloudinary.com')) {
      const parts = url.split('/upload/')
      if (parts.length === 2) {
        const params = []
        if (options.width) params.push(`w_${options.width}`)
        if (options.height) params.push(`h_${options.height}`)
        params.push('c_fill')
        params.push('f_auto')
        params.push('q_auto')
        return `${parts[0]}/upload/${params.join(',')}/${parts[1]}`
      }
    }
    return url
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50">
      {/* 1. DISEÑO MÓVIL PREMIUM */}
      <div className="md:hidden flex-1 flex flex-col w-full bg-white min-h-screen relative pb-24">
        {/* Header Móvil */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-100/80 shadow-sm">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[var(--tenant-primary)] overflow-hidden shadow-sm border-2 border-white flex items-center justify-center flex-shrink-0">
                {store.logo_url ? (
                  <img src={getOptimizedImageUrl(store.logo_url, { width: 80, height: 80 })} alt={store.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-black text-sm">{store.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight truncate">{store.name}</h1>
            </div>
          </div>
        </header>

        {/* Colecciones en Móvil */}
        <main className="flex-1 px-4 py-6 space-y-8 bg-slate-50/30">
          <div className="space-y-4">
            <div className="text-center max-w-sm mx-auto space-y-1">
              <h2 className="text-base font-black text-slate-900 tracking-tight">Nuestras Colecciones</h2>
              <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed">
                Elige uno de nuestros catálogos especializados para explorar todos los productos.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2">
              {catalogs.map((catalog) => {
                const catalogUrl = `/c/${catalog.slug}`
                const associatedCount = catalogRelations.filter((r) => r.catalog_id === catalog.id).length
                
                return (
                  <Link 
                    key={catalog.id}
                    href={catalogUrl}
                    className="group bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex justify-between items-center min-h-[90px]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-900 text-sm truncate">
                          {catalog.name}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-bold">{associatedCount} {associatedCount === 1 ? 'producto' : 'productos'}</span>
                      </div>
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Recomendados en Móvil */}
          {products.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">🔥 Recomendados</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {products.slice(0, 6).map((prod) => (
                  <Link 
                    key={prod.id} 
                    href={getProductLink(prod.slug)}
                    className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group"
                  >
                    <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                      {prod.images[0] ? (
                        <img 
                          src={getOptimizedImageUrl(prod.images[0], { width: 300, height: 300 })}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 flex flex-col gap-1 flex-1">
                      <h3 className="font-bold text-slate-800 text-[11px] leading-tight line-clamp-2">
                        {prod.title}
                      </h3>
                      <span className="font-black text-slate-900 text-xs mt-auto pt-1">
                        {formatPrice(prod.price)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 2. DISEÑO DE ESCRITORIO PREMIUM */}
      <div className="hidden md:flex flex-col flex-1 min-h-screen bg-slate-50/50">
        {/* Header Escritorio */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-16 flex items-center px-12 justify-between z-30 shadow-sm">
          <div className="flex items-center gap-3">
            {store.logo_url && (
              <img
                src={getOptimizedImageUrl(store.logo_url, { width: 100, height: 100 })}
                alt={store.name}
                className="w-9 h-9 rounded-xl object-cover border border-slate-100 shadow-sm flex-shrink-0"
              />
            )}
            <h1 className="text-lg font-black tracking-tight text-slate-800 uppercase">
              {store.name}
            </h1>
          </div>
        </header>

        {/* Marquee */}
        <div className="w-full h-9 bg-[var(--tenant-primary)] text-white flex items-center overflow-hidden relative z-10">
          <div className="flex w-max animate-[marquee_25s_linear_infinite] whitespace-nowrap gap-8">
            <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
              <span>⚡ ¡Haz tu pedido rápido y directo a WhatsApp!</span>
              <span>✦</span>
              <span>📦 Envíos a domicilio y retiro en tienda local</span>
              <span>✦</span>
              <span>💵 Pago fácil coordinado al instante</span>
              <span>✦</span>
              <span>💬 Soporte y atención al cliente garantizado</span>
            </div>
            <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-wider" aria-hidden="true">
              <span>⚡ ¡Haz tu pedido rápido y directo a WhatsApp!</span>
              <span>✦</span>
              <span>📦 Envíos a domicilio y retiro en tienda local</span>
              <span>✦</span>
              <span>💵 Pago fácil coordinado al instante</span>
              <span>✦</span>
              <span>💬 Soporte y atención al cliente garantizado</span>
            </div>
          </div>
        </div>

        {/* Colecciones y Recomendados Escritorio */}
        <div className="flex-grow max-w-7xl w-full mx-auto px-12 py-10 space-y-12">
          {/* Catálogos */}
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nuestras Colecciones</h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Elige uno de nuestros catálogos especializados para explorar todos los productos que tenemos para ti.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
              {catalogs.map((catalog) => {
                const catalogUrl = `/c/${catalog.slug}`
                const associatedCount = catalogRelations.filter((r) => r.catalog_id === catalog.id).length
                
                return (
                  <Link 
                    key={catalog.id}
                    href={catalogUrl}
                    className="group bg-white border border-slate-200/60 p-6.5 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-xl hover:border-slate-350 transition-all duration-300 flex flex-col justify-between min-h-[200px]"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <ShoppingBag className="w-6 h-6 text-indigo-600" />
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                          {catalog.name}
                        </h3>
                        {catalog.description && (
                          <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                            {catalog.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-100/80 flex justify-between items-center mt-6 text-xs font-bold">
                      <span className="text-slate-400">{associatedCount} {associatedCount === 1 ? 'producto' : 'productos'}</span>
                      <span className="text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Explorar</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Productos Recomendados */}
          {products.length > 0 && (
            <div className="space-y-6 pt-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">🔥 Productos Recomendados</h3>
                <span className="text-xs text-slate-400 font-bold uppercase">Destacados</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.slice(0, 8).map((prod, index) => (
                  <Link 
                    key={prod.id}
                    href={getProductLink(prod.slug)}
                    className="border border-slate-100 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div>
                      {prod.images[0] ? (
                        <div className="w-full aspect-square relative bg-slate-50 overflow-hidden border-b border-slate-50">
                          <img 
                            src={getOptimizedImageUrl(prod.images[0], { width: 400, height: 400 })} 
                            alt={prod.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-square bg-slate-50 border-b border-slate-100 flex items-center justify-center text-slate-350">
                          <ShoppingBag className="w-12 h-12" />
                        </div>
                      )}

                      <div className="p-4 space-y-1.5">
                        <h4 className="font-bold text-slate-800 group-hover:text-[var(--tenant-primary)] transition-colors text-[13px] leading-tight line-clamp-2">
                          {prod.title}
                        </h4>
                        {prod.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-normal">
                            {prod.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex justify-between items-center mt-auto">
                      <span className="font-black text-slate-900 text-sm">{formatPrice(prod.price)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Escritorio */}
        <footer className="bg-slate-900 text-slate-300 py-12 mt-auto border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-white font-black uppercase tracking-wider text-sm">{store.name}</h3>
              <p className="text-xs leading-relaxed text-slate-400">
                Tu catálogo favorito en línea. Elige tus productos, personaliza tus variantes y envía tu orden directamente a WhatsApp.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Contacto</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <a href={`https://wa.me/${store.whatsapp_phone.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    {store.whatsapp_phone}
                  </a>
                </li>
                {store.contact_email && (
                  <li className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <a href={`mailto:${store.contact_email}`} className="hover:text-white transition-colors">
                      {store.contact_email}
                    </a>
                  </li>
                )}
                {store.instagram_handle && (
                  <li className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                    <a href={`https://instagram.com/${store.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                      {store.instagram_handle}
                    </a>
                  </li>
                )}
                {store.address_details && (
                  <li className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-400 leading-snug">{store.address_details}</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Aviso Legal</h4>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Evita fraudes y estafas. No realices depósitos adelantados a vendedores que no conozcas. El vendedor es responsable exclusivo de los artículos publicados.
              </p>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                Desarrollado por <span className="text-[var(--tenant-primary)] font-bold">Plataforma Ramos</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
