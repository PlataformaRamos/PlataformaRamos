import React from 'react'
import { Zap, MessageSquare, Shield, Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Características - Plataforma Ramos',
  description: 'Descubre todas las potentes herramientas de nuestra plataforma para vender por WhatsApp.',
}

export default function CaracteristicasPage() {
  return (
    <main className="flex-1 bg-white py-24 relative overflow-hidden">
      {/* Glows de fondo */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[400px] h-[400px] bg-red-600/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block font-bold">Potencia tu negocio</span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Diseñado para vender de forma simple</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">Olvídate de las configuraciones bancarias complejas, envíos tardíos y comisiones abusivas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          {/* Feature 1 */}
          <div className="p-8 bg-slate-50 border border-slate-200 hover:border-blue-500/40 rounded-3xl space-y-4 transition-all duration-300 shadow-sm group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-100">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Onboarding en 30s</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Registra tu correo, ponle un nombre a tu tienda, define tu slug y listo. Ya puedes empezar a subir productos. No necesitas conocimientos técnicos previos ni tarjetas de crédito para iniciar.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 bg-slate-50 border border-slate-200 hover:border-blue-500/40 rounded-3xl space-y-4 transition-all duration-300 shadow-sm group">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform border border-red-100">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Cierre por WhatsApp</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Tus clientes navegan tu catálogo de forma interactiva y te envían el pedido completo pre-formateado a tu chat en un clic. Todo el pedido listo con cantidades, direcciones y subtotales en un solo mensaje.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 bg-slate-50 border border-slate-200 hover:border-blue-500/40 rounded-3xl space-y-4 transition-all duration-300 shadow-sm group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-100">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Control de Pedidos</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Panel de administración integrado y reactivo en tiempo real para cambiar estados de órdenes, imprimir recibos físicos o digitales, y monitorear tus ventas sin ninguna complejidad.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-8 bg-slate-50 border border-slate-200 hover:border-blue-500/40 rounded-3xl space-y-4 transition-all duration-300 shadow-sm group">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform border border-red-100">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Optimización de Fotos</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Las fotos de tus productos se guardan en Cloudflare R2 y se optimizan en WebP/AVIF vía Cloudinary para cargar a la velocidad de la luz en cualquier pantalla móvil o computadora.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
