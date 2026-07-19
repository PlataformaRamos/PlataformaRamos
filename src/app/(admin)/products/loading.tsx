import React from 'react'
import Skeleton from '@/components/ui/Skeleton'

export default function ProductsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm w-full">
        {/* Buscador */}
        <div className="w-full md:w-80">
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
        {/* Filtros de Categorías */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-lg flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col">
            {/* Imagen del Producto */}
            <Skeleton className="h-44 w-full rounded-t-2xl rounded-b-none" />
            
            {/* Detalles del Producto */}
            <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4.5 w-3/4" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-5 w-20" />
                <div className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
