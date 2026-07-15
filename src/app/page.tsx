import React from 'react'
import Link from 'next/link'
import { ShoppingBag, MessageSquare, Zap, Shield, Sparkles, ArrowRight, CheckCircle2, ChevronDown, Check, Star } from 'lucide-react'

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden relative">
      
      {/* 1. CABECERA (Header con Glassmorphism) */}
      <header className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-800/40 sticky top-0 bg-slate-950/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <ShoppingBag className="w-5.5 h-5.5" />
          </div>
          <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            Plataforma Ramos
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Características</a>
          <a href="#steps" className="hover:text-white transition-colors">Cómo Funciona</a>
          <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
          <a href="#faq" className="hover:text-white transition-colors">Preguntas</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
          >
            Ingresar
          </Link>
          <Link 
            href="/login" 
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-extrabold uppercase tracking-wider rounded-xl text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
          >
            Crear Tienda
          </Link>
        </div>
      </header>

      {/* 2. HERO SECTION con efectos de luz */}
      <section className="relative w-full max-w-7xl mx-auto px-6 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        
        {/* Glows y Luces de Fondo */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Textos del Hero */}
        <div className="flex-1 space-y-6 lg:max-w-2xl text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Plataforma SaaS Lista en 30 Segundos</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-black tracking-tight leading-[1.05] text-white">
            Crea tu catálogo digital y recibe pedidos por{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
              WhatsApp
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
            La forma más rápida y estética de digitalizar tu inventario. Sube tus productos, define tus variantes y permite que tus clientes te envíen la orden de compra directamente a tu chat de WhatsApp en un clic, sin pagar comisiones por venta.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
            <Link 
              href="/login" 
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-bold tracking-wider uppercase shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.03] active:scale-95 group"
            >
              <span>Empezar Gratis Ahora</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#steps" 
              className="px-8 py-4 border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 text-slate-300 hover:text-white rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center transition-all hover:scale-[1.03]"
            >
              ¿Cómo funciona?
            </a>
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[60px]" />
          
          <div className="relative w-full max-w-[320px] aspect-[9/18] rounded-[44px] border-[8px] border-slate-900 bg-slate-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col group transition-all duration-500 hover:scale-[1.02] hover:-rotate-1">
            {/* Isla del teléfono */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-800 rounded-full z-30" />

            {/* Cabecera del catálogo simulado */}
            <div className="p-5 pt-8 bg-indigo-950/20 text-center border-b border-slate-900 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[var(--tenant-primary,#4F46E5)] text-white flex items-center justify-center font-black text-sm border-2 border-slate-900 shadow">
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
                    <span className="w-4.5 h-4.5 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center shadow">+</span>
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
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" />
                <span>1 artículo</span>
              </div>
              <div className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black flex items-center gap-1.5 shadow active:scale-95 transition-transform cursor-pointer">
                <span>Ver Pedido</span>
                <MessageSquare className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>

          {/* Alertas flotantes decorativas */}
          <div className="absolute top-12 -right-6 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur max-w-[210px] hover:scale-105 transition-transform duration-300">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold text-white">Nuevo Pedido</div>
              <div className="text-[9px] text-slate-400 truncate">Enviado por Kenneth</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN DE CARACTERÍSTICAS (Features con Hover Iluminado) */}
      <section id="features" className="w-full bg-slate-950 py-24 lg:py-32 border-t border-b border-slate-900 relative">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block">Potencia tu negocio</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Diseñado para vender de forma simple</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">Olvídate de las integraciones bancarias complejas, envíos tardíos y comisiones abusivas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            
            {/* Feature 1 */}
            <div className="p-6 bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/40 rounded-3xl space-y-4 transition-all duration-300 shadow-md group">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-bold text-white text-base">Onboarding en 30s</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Registra tu correo, ponle un nombre a tu tienda, define tu slug y listo. Ya puedes empezar a subir productos.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/40 rounded-3xl space-y-4 transition-all duration-300 shadow-md group">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-bold text-white text-base">Cierre por WhatsApp</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Tus clientes navegan tu catálogo de forma interactiva y te envían el pedido completo pre-formateado a tu chat en un clic.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/40 rounded-3xl space-y-4 transition-all duration-300 shadow-md group">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-bold text-white text-base">Control de Pedidos</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Panel de administración integrado y reactivo en tiempo real para cambiar estados de ordenes, imprimir recibos y monitorear ventas.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/40 rounded-3xl space-y-4 transition-all duration-300 shadow-md group">
              <div className="w-11 h-11 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-bold text-white text-base">Optimización de Fotos</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Las fotos se guardan en Cloudflare R2 y se optimizan en WebP/AVIF vía Cloudinary para cargar a la velocidad de la luz.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. CÓMO FUNCIONA (Sección de Pasos UX) */}
      <section id="steps" className="w-full py-24 lg:py-32 relative bg-slate-950/30">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block font-bold">Flujo simple</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Vende en 3 sencillos pasos</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">Diseñamos el camino más corto entre tu inventario y el dinero del cliente.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            
            {/* Paso 1 */}
            <div className="space-y-4 text-center md:text-left relative group">
              <div className="text-[64px] font-black text-slate-900 group-hover:text-indigo-600/35 transition-colors select-none leading-none">01</div>
              <h3 className="text-lg font-bold text-white">Sube tus productos</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Sube fotos, nombres, precios y variantes (como sabores, tamaños o colores) desde tu panel administrativo intuitivo.</p>
            </div>

            {/* Paso 2 */}
            <div className="space-y-4 text-center md:text-left relative group">
              <div className="text-[64px] font-black text-slate-900 group-hover:text-indigo-600/35 transition-colors select-none leading-none">02</div>
              <h3 className="text-lg font-bold text-white">Comparte tu enlace</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Coloca tu link personalizado (ej. `tienda.rutaslima.app`) en tu perfil de Instagram, TikTok o envíalo por WhatsApp.</p>
            </div>

            {/* Paso 3 */}
            <div className="space-y-4 text-center md:text-left relative group">
              <div className="text-[64px] font-black text-slate-900 group-hover:text-indigo-600/35 transition-colors select-none leading-none">03</div>
              <h3 className="text-lg font-bold text-white">Recibe pedidos y acuerda el pago</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Tus clientes arman el carrito y te mandan el pedido listo a WhatsApp para que coordines el pago y la entrega.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. SECCIÓN DE PRECIOS */}
      <section id="pricing" className="w-full py-24 lg:py-32 relative border-t border-slate-900 bg-slate-950/80">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block">Planes simples</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Precios transparentes y sin sorpresas</h2>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">Comienza gratis y escala cuando tu volumen crezca.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-3xl mx-auto mt-16 font-semibold text-xs">
            
            {/* Plan Gratis */}
            <div className="flex-1 p-8 bg-slate-900 border border-slate-800/80 rounded-3xl flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">Plan Inicial</h3>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-4xl font-black text-white">$0</span>
                    <span className="text-slate-500 font-bold">/ mes</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 font-medium">Ideal para emprendedores y nuevos negocios.</p>
                </div>

                <div className="space-y-3.5 border-t border-slate-800/60 pt-6">
                  {[
                    'Hasta 50 productos en catálogo',
                    'Recibir pedidos por WhatsApp',
                    'Panel de control de administración',
                    'Logo de la tienda personalizable',
                    'Optimización de imágenes básica R2',
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-slate-300">
                      <CheckCircle2 className="w-4.5 h-4.5 text-indigo-500 flex-shrink-0" />
                      <span className="font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link 
                href="/login" 
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700/80 text-center font-bold text-white rounded-xl shadow transition-colors"
              >
                Comenzar gratis
              </Link>
            </div>

            {/* Plan Pro */}
            <div className="flex-1 p-8 bg-indigo-950/20 border-2 border-indigo-600 rounded-3xl flex flex-col justify-between space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white font-black text-[9px] uppercase tracking-wider px-4 py-1.5 rounded-bl-xl">
                Recomendado
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">Plan Premium</h3>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-4xl font-black text-white">$9.90</span>
                    <span className="text-indigo-400 font-bold">/ mes</span>
                  </div>
                  <p className="text-[11px] text-indigo-200 mt-2 font-medium">Para comercios establecidos y marcas consolidadas.</p>
                </div>

                <div className="space-y-3.5 border-t border-indigo-900/60 pt-6">
                  {[
                    'Productos ilimitados en catálogo',
                    'Dominio propio personalizado',
                    'Hasta 5 colaboradores del equipo',
                    'Estadísticas de ventas avanzadas',
                    'Soporte prioritario 24/7',
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-indigo-100">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
                      <span className="font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link 
                href="/login" 
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-center font-bold text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
              >
                Adquirir Premium
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 6. ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ UX) */}
      <section id="faq" className="w-full py-24 lg:py-32 relative bg-slate-950/50 border-t border-slate-900">
        <div className="w-full max-w-4xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block font-bold">Preguntas frecuentes</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Todo lo que necesitas saber</h2>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">¿Tienes dudas? Aquí te las respondemos al instante.</p>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            {[
              {
                q: '¿Cómo llega el pedido a mi WhatsApp?',
                a: 'Cuando tu cliente completa el proceso de checkout en la tienda, nuestro sistema procesa la orden, crea un registro en Supabase para ti, y de inmediato abre un enlace pre-formateado a WhatsApp con los detalles del cliente, dirección, entrega y los artículos. Solo debes dar un clic a enviar.'
              },
              {
                q: '¿Puedo usar mi propio dominio personalizado?',
                a: 'Sí. En el Plan Premium puedes vincular tu propio dominio (ej. `tienda.com`) para que tus clientes no vean el subdominio de rutaslima.app. Nosotros nos encargamos del SSL y la configuración de CDN.'
              },
              {
                q: '¿Hay algún límite de comisiones por venta?',
                a: 'Ninguno. No cobramos comisiones por tus pedidos ni limitamos tus ingresos. El pago del plan es una suscripción fija recurrente.'
              },
              {
                q: '¿Necesito conocimientos técnicos para empezar?',
                a: 'Para nada. La plataforma está pensada para ser extremadamente fácil de usar. Puedes subir tus productos desde tu móvil en segundos y compartir tu link.'
              }
            ].map((item, index) => (
              <div key={index} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                <h3 className="font-bold text-white text-sm flex justify-between items-center">
                  <span>{item.q}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </h3>
                <p className="text-slate-400 font-medium leading-relaxed mt-2">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PIE DE PÁGINA (Footer) */}
      <footer className="w-full border-t border-slate-800/40 bg-slate-950 py-12">
        <div className="w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500 font-semibold">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-slate-300">Plataforma Ramos</span>
          </div>

          <div>
            &copy; {new Date().getFullYear()} Plataforma Ramos. Todos los derechos reservados.
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-slate-300 transition-colors">Términos y condiciones</a>
            <a href="#features" className="hover:text-slate-300 transition-colors">Privacidad</a>
            <a href="#features" className="hover:text-slate-300 transition-colors">Contacto</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
