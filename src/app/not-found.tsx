import React from 'react'
import Link from 'next/link'
import Logo from '@/components/marketing/Logo'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: '404 - Página No Encontrada',
  description: 'La página o tienda que estás buscando no existe en Plataforma Ramos.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Glows de fondo */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/[0.04] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[350px] h-[350px] bg-red-600/[0.04] rounded-full blur-[90px] pointer-events-none" />

      {/* Contenido Principal */}
      <div className="max-w-md w-full text-center space-y-6 relative z-10">
        
        {/* Logos Flanqueados y Título */}
        <div className="flex items-center justify-center gap-4 animate-in fade-in duration-500">
          <Logo size={44} />
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter">404</h1>
          <Logo size={44} mirror />
        </div>

        {/* Marca Coloreada */}
        <div className="flex items-center justify-center gap-1.5 select-none font-black text-sm tracking-widest uppercase">
          <span className="text-[#EF4444]">Plataforma</span>
          <span className="text-[#3B82F6]">Ramos</span>
        </div>

        {/* Texto Explicativo */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">¿Te has perdido?</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            La página o el catálogo digital que intentas buscar no se encuentra disponible, fue desactivado o nunca existió.
          </p>
        </div>

        {/* Botón de Regreso */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold tracking-wider uppercase shadow-lg shadow-blue-600/10 transition-all hover:scale-[1.03] active:scale-95 group border border-blue-500/20"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver a Inicio</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
