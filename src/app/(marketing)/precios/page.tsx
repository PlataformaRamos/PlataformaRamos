import React from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'Precios - Plataforma Ramos',
  description: 'Conoce nuestros planes transparentes y económicos para digitalizar tu catálogo hoy mismo.',
}

export default function PreciosPage() {
  return (
    <main className="flex-1 bg-white py-24 relative overflow-hidden">
      {/* Glows de fondo */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[400px] h-[400px] bg-red-600/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">Planes simples</span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Precios transparentes y sin sorpresas</h1>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">Comienza gratis y escala cuando tu volumen crezca.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-3xl mx-auto mt-16 font-semibold text-xs">
          
          {/* Plan Gratis */}
          <div className="flex-1 p-8 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Plan Inicial</h3>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-4xl font-black text-slate-900">$0</span>
                  <span className="text-slate-500 font-bold">/ mes</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 font-medium">Ideal para emprendedores y nuevos negocios.</p>
              </div>

              <div className="space-y-3.5 border-t border-slate-200 pt-6">
                {[
                  'Hasta 50 productos en catálogo',
                  'Recibir pedidos por WhatsApp',
                  'Panel de control de administración',
                  'Logo de la tienda personalizable',
                  'Optimización de imágenes básica R2',
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5 text-slate-700">
                    <CheckCircle2 className="w-4.5 h-4.5 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link 
              href="/login?mode=signup" 
              className="w-full py-3.5 bg-slate-200 hover:bg-slate-300 text-center font-bold text-slate-800 rounded-xl transition-colors"
            >
              Comenzar gratis
            </Link>
          </div>

          {/* Plan Pro */}
          <div className="flex-1 p-8 bg-blue-50/30 border-2 border-blue-600 rounded-3xl flex flex-col justify-between space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-600 text-white font-black text-[9px] uppercase tracking-wider px-4 py-1.5 rounded-bl-xl">
              Recomendado
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Plan Premium</h3>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-4xl font-black text-slate-900">$9.90</span>
                  <span className="text-blue-600 font-bold">/ mes</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 font-medium">Para comercios establecidos y marcas consolidadas.</p>
              </div>

              <div className="space-y-3.5 border-t border-slate-200 pt-6">
                {[
                  'Productos ilimitados en catálogo',
                  'Dominio propio personalizado',
                  'Hasta 5 colaboradores del equipo',
                  'Estadísticas de ventas avanzadas',
                  'Soporte prioritario 24/7',
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5 text-slate-700">
                    <CheckCircle2 className="w-4.5 h-4.5 text-red-500 flex-shrink-0" />
                    <span className="font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link 
              href="/login?mode=signup" 
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-center font-bold text-white rounded-xl shadow-lg shadow-blue-600/10 transition-all hover:scale-105 active:scale-95"
            >
              Adquirir Premium
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}
