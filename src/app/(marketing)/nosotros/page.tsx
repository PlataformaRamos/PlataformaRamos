import React from 'react'
import { CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'Nosotros - Plataforma Ramos',
  description: 'Conoce nuestra historia, misión y el equipo detrás de la plataforma que digitaliza a los pequeños y medianos comercios.',
}

export default function NosotrosPage() {
  return (
    <main className="flex-1 bg-white py-24 relative overflow-hidden">
      {/* Glows de fondo */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[400px] h-[400px] bg-red-600/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block font-bold">Nuestra Historia</span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Sobre Plataforma Ramos</h1>
          <p className="text-sm text-slate-550 max-w-xs mx-auto">Digitalizando e-commerce locales sin barreras técnicas ni comisiones abusivas.</p>
        </div>

        <div className="space-y-12 text-sm text-slate-600 leading-relaxed font-medium">
          {/* Misión y Visión */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Nuestra Misión</h2>
              <p className="text-xs">
                Empoderar a pequeños comerciantes, emprendedores y marcas consolidadas brindándoles las herramientas necesarias para digitalizar su inventario de forma estética, rápida y económica, optimizando la comunicación de venta directa con sus clientes a través de WhatsApp.
              </p>
            </div>
            
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Nuestra Visión</h2>
              <p className="text-xs">
                Convertirnos en la plataforma SaaS líder de comercio directo en Latinoamérica, facilitando la descentralización de las ventas digitales y proveyendo un ecosistema libre de comisiones donde la experiencia visual y la simpleza de cierre de ventas sean el motor de crecimiento de cada negocio.
              </p>
            </div>
          </div>

          {/* Valores */}
          <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl space-y-6">
            <h2 className="text-xl font-bold text-slate-900 text-center md:text-left">Nuestros Valores Fundamentales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 font-bold">
              {[
                { title: 'Transparencia Absoluta', desc: 'Sin comisiones ocultas sobre tus ventas. Lo que vendes es 100% tuyo.' },
                { title: 'Diseño Centrado en el Usuario', desc: 'UIs hermosas, rápidas y fluidas optimizadas especialmente para dispositivos móviles.' },
                { title: 'Velocidad Increíble', desc: 'Optimización de assets al instante para que tus clientes no esperen a que cargue la página.' },
                { title: 'Soporte y Cercanía', desc: 'Atención personalizada para que configures tu catálogo digital sin dolores de cabeza.' }
              ].map((val, idx) => (
                <div key={idx} className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-bold">{val.title}</h3>
                    <p className="text-slate-400 font-medium mt-1">{val.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
