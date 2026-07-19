import React from 'react'
import Skeleton from '@/components/ui/Skeleton'

export default function CustomersLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="space-y-2 pb-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm w-full">
        <div className="w-full md:w-80">
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Encabezados */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 border-b border-slate-100">
          <Skeleton className="h-4.5 w-24" />
          <Skeleton className="h-4.5 w-20" />
          <Skeleton className="h-4.5 w-32" />
          <Skeleton className="h-4.5 w-28 justify-self-end" />
        </div>

        {/* Filas */}
        <div className="divide-y divide-slate-50">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="grid grid-cols-4 gap-4 p-4 items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4.5 w-16 justify-self-end" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
