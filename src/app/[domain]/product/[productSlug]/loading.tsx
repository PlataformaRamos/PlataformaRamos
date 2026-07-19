import React from 'react'
import Skeleton from '@/components/ui/Skeleton'

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased animate-fade-in">
      
      {/* Cabecera */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 py-3 flex justify-between items-center z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
          <Skeleton className="h-4.5 w-36" />
        </div>
        <Skeleton className="w-10 h-10 rounded-xl" />
      </header>

      {/* Contenedor Principal */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-6 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          {/* Columna Izquierda: Imagen */}
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-3xl" />
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-2xl flex-shrink-0" />
              ))}
            </div>
          </div>

          {/* Columna Derecha: Detalles de Compra */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Categoría y Título */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-5/6" />
              </div>

              {/* Precio */}
              <Skeleton className="h-7 w-32" />

              {/* Descripción */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              {/* Variantes / Opciones Simuladas */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-9 w-20 rounded-xl" />
                  ))}
                </div>
              </div>
            </div>

            {/* Acción de Agregar al Carrito */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                {/* Control de Cantidad */}
                <Skeleton className="h-9 w-28 rounded-xl" />
              </div>
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
