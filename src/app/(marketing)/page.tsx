import React from 'react'
import Link from 'next/link'
import { ShoppingBag, MessageSquare, Sparkles, ArrowRight } from 'lucide-react'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Plataforma Ramos - Tu Catálogo Digital en WhatsApp',
  description: 'La forma más rápida de digitalizar tu inventario, recibir pedidos en tu WhatsApp y administrar tu negocio sin comisiones intermedias.',
}

interface HomePageProps {
  searchParams: Promise<{ code?: string; error?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams
  
  // Redirección de emergencia para OAuth de Supabase
  if (resolvedParams.code) {
    redirect(`/api/auth/callback?code=${resolvedParams.code}`)
  }

  return (
    <main className="flex-1 flex flex-col justify-center items-center">
      {/* HERO SECTION con efectos de luz Azul, Rojo y Blanco */}
      <section className="relative w-full max-w-7xl mx-auto px-6 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-12 lg:gap-8 overflow-hidden">
        
        {/* Glows y Luces de Fondo (Azul y Rojo) */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Textos del Hero */}
        <div className="flex-grow flex-shrink-0 space-y-6 lg:max-w-2xl text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-white">Plataforma SaaS Lista en 30 Segundos</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-black tracking-tight leading-[1.05] text-white">
            Crea tu catálogo digital y recibe pedidos por{' '}
            <span className="text-[#25D366]">
              WhatsApp
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
            La forma más rápida y estética de digitalizar tu inventario. Sube tus productos, define tus variantes y permite que tus clientes te envíen la orden de compra directamente a tu chat de WhatsApp en un clic, sin pagar comisiones por venta.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
            <Link 
              href="/login" 
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl text-xs font-bold tracking-wider uppercase shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.03] active:scale-95 group border border-white/10"
            >
              <span className="text-white font-black">Empezar Gratis Ahora</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/como-funciona" 
              className="px-8 py-4 border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 text-slate-300 hover:text-white rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center transition-all hover:scale-[1.03]"
            >
              ¿Cómo funciona?
            </Link>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800/60 max-w-sm sm:max-w-md mx-auto lg:mx-0 text-center lg:text-left">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">0%</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Comisiones</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">+50,000</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Pedidos Enviados</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">2 Min</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Configuración</div>
            </div>
          </div>
        </div>

        {/* Mockup Interactivo del Teléfono (Fórmula Blama Shop/Shopify) */}
        <div className="flex-1 w-full max-w-md lg:max-w-none relative flex justify-center z-10">
          {/* Círculo luminoso detrás del móvil */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-[60px]" />
          
          <div className="relative w-full max-w-[320px] aspect-[9/18] rounded-[44px] border-[8px] border-slate-900 bg-slate-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col group transition-all duration-500 hover:scale-[1.02] hover:-rotate-1">
            {/* Isla del teléfono */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-800 rounded-full z-30" />

            {/* Cabecera del catálogo simulado */}
            <div className="p-5 pt-8 bg-blue-950/20 text-center border-b border-slate-900 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm border-2 border-slate-900 shadow">
                R
              </div>
              <div className="mt-2 text-xs font-black text-white uppercase tracking-wider">Tienda Ramos</div>
              <div className="text-[9px] text-slate-500 mt-0.5">Catálogo Digital</div>
            </div>

            {/* Listado de Productos simulado */}
            <div className="p-4 flex-grow space-y-3 overflow-y-auto no-scrollbar">
              <div className="h-7 bg-slate-900 border border-slate-800 rounded-xl flex items-center px-3.5 text-[9px] text-slate-500 font-bold">
                🔍 Buscar en el catálogo...
              </div>

              <div className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex gap-3">
                <div className="w-11 h-11 bg-slate-800 rounded-lg flex items-center justify-center text-lg flex-shrink-0">🍕</div>
                <div className="flex-grow space-y-1.5 min-w-0">
                  <div className="h-2.5 bg-slate-700 rounded w-2/3" />
                  <div className="h-2 bg-slate-800 rounded w-1/2" />
                  <div className="flex justify-between items-center pt-0.5">
                    <span className="text-[10px] font-black text-white">$12.50</span>
                    <span className="w-4.5 h-4.5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shadow">+</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex gap-3 opacity-60">
                <div className="w-11 h-11 bg-slate-800 rounded-lg flex items-center justify-center text-lg flex-shrink-0">🍔</div>
                <div className="flex-grow space-y-1.5">
                  <div className="h-2.5 bg-slate-700 rounded w-3/4" />
                  <div className="h-2 bg-slate-800 rounded w-1/3" />
                </div>
              </div>
            </div>

            {/* Footer flotante del mockup (Carrito) */}
            <div className="p-4 bg-slate-900/90 backdrop-blur border-t border-slate-800/60 flex justify-between items-center px-4">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
                <span>1 artículo</span>
              </div>
              <div className="px-3.5 py-1.5 bg-red-600 text-white rounded-lg text-[9px] font-black flex items-center gap-1.5 shadow active:scale-95 transition-transform cursor-pointer">
                <span>Ver Pedido</span>
                <MessageSquare className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>

          {/* Alertas flotantes decorativas */}
          <div className="absolute top-12 -right-6 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur max-w-[210px] hover:scale-105 transition-transform duration-300">
            <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold text-white">Nuevo Pedido</div>
              <div className="text-[9px] text-slate-400 truncate">Enviado por Kenneth</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
