import React from 'react'
import Skeleton from '@/components/ui/Skeleton'

export default function OrdersLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="space-y-2 pb-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Tabs y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm w-full">
        {/* Buscador */}
        <div className="w-full md:w-80">
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
        {/* Tabs de Filtro */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar py-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8.5 w-28 rounded-lg flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Encabezados de Tabla */}
        <div className="grid grid-cols-5 gap-4 p-4 bg-slate-50 border-b border-slate-100">
          <Skeleton className="h-4.5 w-16" />
          <Skeleton className="h-4.5 w-24" />
          <Skeleton className="h-4.5 w-24" />
          <Skeleton className="h-4.5 w-20" />
          <Skeleton className="h-4.5 w-20 justify-self-end" />
        </div>

        {/* Filas de la Tabla */}
        <div className="divide-y divide-slate-50">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-5 gap-4 p-4 items-center">
              <Skeleton className="h-4 w-12" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4.5 w-16 justify-self-end" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
