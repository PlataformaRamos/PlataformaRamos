import React from 'react'

export const metadata = {
  title: 'Cómo Funciona - Plataforma Ramos',
  description: 'Aprende cómo configurar tu tienda en 3 sencillos pasos y comenzar a recibir pedidos hoy mismo.',
}

export default function ComoFuncionaPage() {
  return (
    <main className="flex-1 bg-white py-24 relative overflow-hidden">
      {/* Glows de fondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 translate-x-1/2 w-[400px] h-[400px] bg-red-600/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block font-bold">Flujo simple</span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Vende en 3 sencillos pasos</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">Diseñamos el camino más corto entre tu inventario y el dinero del cliente.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Paso 1 */}
          <div className="space-y-4 text-center md:text-left relative group">
            <div className="text-[72px] font-black text-slate-100 group-hover:text-blue-600/15 transition-colors select-none leading-none">01</div>
            <h3 className="text-xl font-bold text-slate-900">Sube tus productos</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Sube fotos, nombres, precios y variantes (como sabores, tamaños o colores) desde tu panel administrativo intuitivo en menos de lo que te toma hacer un post en redes.
            </p>
          </div>

          {/* Paso 2 */}
          <div className="space-y-4 text-center md:text-left relative group">
            <div className="text-[72px] font-black text-slate-100 group-hover:text-blue-600/15 transition-colors select-none leading-none">02</div>
            <h3 className="text-xl font-bold text-slate-900">Comparte tu enlace</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Coloca tu link personalizado (ej. `tienda.rutaslima.app`) en tu perfil de Instagram, TikTok o envíalo por WhatsApp directamente a tus clientes interesados.
            </p>
          </div>

          {/* Paso 3 */}
          <div className="space-y-4 text-center md:text-left relative group">
            <div className="text-[72px] font-black text-slate-100 group-hover:text-blue-600/15 transition-colors select-none leading-none">03</div>
            <h3 className="text-xl font-bold text-slate-900">Recibe pedidos y acuerda el pago</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Tus clientes arman el carrito de compras dinámicamente y te mandan el pedido listo a WhatsApp para que coordines el pago (Yape, Plin, Transferencia) y la entrega final.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
