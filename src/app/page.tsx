import React from 'react'
import Link from 'next/link'
import { ShoppingBag, MessageSquare, Zap, Shield, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'Comercio Ligero - Crea tu Catálogo Digital y Vende por WhatsApp',
  description: 'La plataforma SaaS más rápida para crear tu catálogo web interactivo, recibir pedidos directamente en tu WhatsApp y administrar tu negocio sin comisiones.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* 1. CABECERA (Header) */}
      <header className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-800/60 sticky top-0 bg-slate-900/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Comercio Ligero
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-400">
          <a href="#features" className="hover:text-slate-100 transition-colors">Características</a>
          <a href="#pricing" className="hover:text-slate-100 transition-colors">Planes y Precios</a>
          <a href="#faq" className="hover:text-slate-100 transition-colors">Preguntas Frecuentes</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link 
            href="/login" 
            className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-lg text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
          >
            Crear mi Tienda
          </Link>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative w-full max-w-7xl mx-auto px-6 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        
        {/* Luces de Fondo (Gradients) */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[350px] h-[350px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Textos del Hero */}
        <div className="flex-1 space-y-6 lg:max-w-xl text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Listo en menos de 30 segundos</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Crea tu catálogo web y recibe pedidos por{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              WhatsApp
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
            La forma más sencilla de digitalizar tu inventario. Sube tus productos una sola vez y permite que tus clientes armen su carrito de compras y te envíen la orden terminada en un solo mensaje de chat.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
            <Link 
              href="/login" 
              className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold tracking-wide shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 group"
            >
              <span>Comenzar mi catálogo gratis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#features" 
              className="px-7 py-3.5 border border-slate-700/60 hover:border-slate-600 bg-slate-800/40 text-slate-300 hover:text-white rounded-xl text-xs font-bold tracking-wide flex items-center justify-center transition-colors"
            >
              Ver cómo funciona
            </a>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800/60 max-w-sm sm:max-w-md mx-auto lg:mx-0 text-center lg:text-left">
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">0%</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Comisiones</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">+10k</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Ventas directas</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">30s</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Configuración</div>
            </div>
          </div>
        </div>

        {/* Mockup Interactivo del Catálogo */}
        <div className="flex-1 w-full max-w-md lg:max-w-none relative flex justify-center z-10">
          <div className="relative w-full max-w-[340px] aspect-[9/18] rounded-[40px] border-[10px] border-slate-800 bg-slate-950 shadow-2xl overflow-hidden flex flex-col group transition-transform duration-500 hover:rotate-2">
            
            {/* Cámara e Isla del teléfono */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-full z-30" />

            {/* Cabecera del mockup */}
            <div className="p-5 pt-8 bg-indigo-950/40 text-center border-b border-indigo-900/30 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm border-2 border-slate-900 shadow">
                R
              </div>
              <div className="mt-2 text-xs font-bold text-white uppercase tracking-wider">Tienda Ramos</div>
              <div className="text-[9px] text-slate-500 mt-0.5">Catálogo Digital</div>
            </div>

            {/* Listado de Productos simulado */}
            <div className="p-4 flex-1 space-y-3 overflow-y-auto">
              <div className="h-6 bg-slate-900 rounded-md flex items-center px-2 text-[9px] text-slate-400">
                🔍 Buscar en el catálogo...
              </div>

              <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl flex gap-3">
                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-slate-600">🍕</div>
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="h-2.5 bg-slate-700 rounded w-2/3" />
                  <div className="h-2 bg-slate-800 rounded w-1/2" />
                  <div className="flex justify-between items-center pt-0.5">
                    <span className="text-[10px] font-black text-white">$12.50</span>
                    <span className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">+</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl flex gap-3 opacity-60">
                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-slate-600">🍔</div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 bg-slate-700 rounded w-3/4" />
                  <div className="h-2 bg-slate-800 rounded w-1/3" />
                </div>
              </div>
            </div>

            {/* Footer flotante del mockup (Carrito) */}
            <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex justify-between items-center px-4">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" />
                <span>1 artículo</span>
              </div>
              <div className="px-3 py-1 bg-emerald-600 text-white rounded-md text-[9px] font-bold flex items-center gap-1 shadow">
                <span>Ver Pedido</span>
                <MessageSquare className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>

          {/* Alertas flotantes decorativas */}
          <div className="absolute top-10 -right-6 bg-slate-800/90 border border-slate-700/60 p-3.5 rounded-xl shadow-lg flex items-center gap-3 backdrop-blur max-w-[200px] animate-bounce duration-[4000ms]">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold text-white">Nuevo Pedido</div>
              <div className="text-[9px] text-slate-400 truncate">Recibido en WhatsApp</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN DE CARACTERÍSTICAS (Features) */}
      <section id="features" className="w-full bg-slate-950 py-20 lg:py-28 border-t border-b border-slate-800/50 relative">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block">Todo lo que necesitas</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Diseñado para vender de forma simple</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">Olvídate de las configuraciones bancarias complejas, envíos tardíos y comisiones abusivas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            
            {/* Feature 1 */}
            <div className="p-6 bg-slate-900 border border-slate-800/80 rounded-2xl space-y-4 hover:border-slate-700 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Onboarding en 30s</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Registra tu correo, ponle un nombre a tu tienda, define tu slug y listo. Ya puedes empezar a subir productos.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-slate-900 border border-slate-800/80 rounded-2xl space-y-4 hover:border-slate-700 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Cierre por WhatsApp</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Tus clientes navegan tu catálogo de forma interactiva y te envían el pedido completo pre-formateado a tu chat en un clic.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-slate-900 border border-slate-800/80 rounded-2xl space-y-4 hover:border-slate-700 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Control de Pedidos</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Panel de administración integrado y reactivo (CDC) en tiempo real para cambiar estados de ordenes, imprimir recibos y monitorear ventas.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-slate-900 border border-slate-800/80 rounded-2xl space-y-4 hover:border-slate-700 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Imágenes Premium</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Las fotos de tus productos se guardan en Cloudflare R2 y se optimizan dinámicamente en WebP/AVIF con Cloudinary para cargar a la velocidad de la luz.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SECCIÓN DE PRECIOS (Pricing) */}
      <section id="pricing" className="w-full py-20 lg:py-28 relative">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block">Elige tu plan</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Planes simples para negocios en crecimiento</h2>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">Comienza totalmente gratis y escala cuando lo necesites.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-3xl mx-auto mt-16 font-semibold text-xs">
            
            {/* Plan Gratis */}
            <div className="flex-1 p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">Plan Inicial</h3>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-4xl font-black text-white">$0</span>
                    <span className="text-slate-500">/ mes</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 font-medium">Ideal para emprendedores y nuevos negocios.</p>
                </div>

                <div className="space-y-3.5 border-t border-slate-800/80 pt-6">
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
            <div className="flex-1 p-8 bg-indigo-950/40 border-2 border-indigo-600 rounded-3xl flex flex-col justify-between space-y-8 relative overflow-hidden">
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

      {/* 5. PIE DE PÁGINA (Footer) */}
      <footer className="w-full border-t border-slate-800/60 bg-slate-950 py-8">
        <div className="w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-semibold">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-indigo-600/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-300">Comercio Ligero</span>
          </div>

          <div>
            &copy; {new Date().getFullYear()} Plataforma Ramos. Todos los derechos reservados.
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-slate-300 transition-colors">Términos</a>
            <a href="#features" className="hover:text-slate-300 transition-colors">Privacidad</a>
            <a href="#features" className="hover:text-slate-300 transition-colors">Contacto</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
