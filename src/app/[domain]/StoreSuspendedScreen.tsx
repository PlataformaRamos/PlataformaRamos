'use client'

import React from 'react'
import { AlertTriangle, ShieldAlert, ExternalLink } from 'lucide-react'

interface StoreSuspendedScreenProps {
  storeName?: string
}

export default function StoreSuspendedScreen({ storeName }: StoreSuspendedScreenProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Glow de fondo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-600/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg text-center space-y-8 relative z-10">
        {/* Icono Central */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-900/30 flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-400" />
          </div>
        </div>

        {/* Título */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Tienda temporalmente suspendida
          </h1>
          {storeName && (
            <p className="text-sm text-slate-400 font-bold">
              &quot;{storeName}&quot;
            </p>
          )}
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
            Esta tienda se encuentra actualmente fuera de servicio por mantenimiento o revisión administrativa. 
            Por favor, vuelve a intentarlo más tarde.
          </p>
        </div>

        {/* Información adicional */}
        <div className="p-5 bg-slate-900/60 border border-slate-800/60 rounded-2xl space-y-3 text-left">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Si eres el propietario de esta tienda y consideras que se trata de un error, por favor comunícate con el equipo de soporte de <span className="text-white font-bold">Plataforma Ramos</span>.
            </p>
          </div>
        </div>

        {/* Footer con branding */}
        <div className="pt-4 border-t border-slate-800/40">
          <a
            href="https://rutaslima.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[10px] text-slate-500 hover:text-indigo-400 font-bold uppercase tracking-wider transition-colors group"
          >
            <span>Impulsado por Plataforma Ramos</span>
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  )
}
