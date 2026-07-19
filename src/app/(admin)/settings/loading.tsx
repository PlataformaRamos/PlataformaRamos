import React from 'react'
import Skeleton from '@/components/ui/Skeleton'

export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="space-y-2 pb-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Grid de Tabs de Configuración */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 pb-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8.5 w-32 rounded-lg flex-shrink-0" />
        ))}
      </div>

      {/* Formulario de Configuración Principal */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-2xl space-y-6">
        <div className="space-y-2 border-b border-slate-50 pb-4">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3.5 w-64" />
        </div>

        {/* Campos de Entrada */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>

        {/* Botón de Guardar */}
        <div className="flex justify-end pt-4">
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
