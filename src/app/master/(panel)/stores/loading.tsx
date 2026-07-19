import React from 'react'
import Skeleton from '@/components/ui/Skeleton'

export default function MasterStoresLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera */}
      <div className="space-y-2 pb-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Grid de Métricas Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#1E293B]/20 p-6 rounded-2xl border border-slate-100/5 shadow-sm flex flex-col gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#1E293B]/20 p-4 rounded-2xl border border-slate-100/5 shadow-sm">
        <Skeleton className="h-9 w-full sm:w-80 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Tabla de Tiendas Master */}
      <div className="bg-[#1E293B]/10 rounded-2xl border border-slate-100/5 shadow-sm overflow-hidden">
        {/* Encabezados */}
        <div className="grid grid-cols-6 gap-4 p-4 bg-[#1E293B]/20 border-b border-slate-100/5">
          <Skeleton className="h-4.5 w-16" />
          <Skeleton className="h-4.5 w-24" />
          <Skeleton className="h-4.5 w-20" />
          <Skeleton className="h-4.5 w-16" />
          <Skeleton className="h-4.5 w-16" />
          <Skeleton className="h-4.5 w-20 justify-self-end" />
        </div>

        {/* Filas */}
        <div className="divide-y divide-slate-100/5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="grid grid-cols-6 gap-4 p-4 items-center">
              <div className="space-y-1.5">
                <Skeleton className="h-4.5 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <div className="flex gap-2 justify-self-end">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
