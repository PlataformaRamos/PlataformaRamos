import React from 'react'
import Skeleton from '@/components/ui/Skeleton'

export default function StorefrontLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased animate-fade-in">
      
      {/* 1. Cabecera de la Tienda (Header) */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 py-3 flex justify-between items-center z-30 shadow-sm">
        <div className="flex items-center gap-2">
          {/* Logo y Nombre */}
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <Skeleton className="h-4.5 w-32" />
        </div>
        
        {/* Bolsa de Compras */}
        <Skeleton className="w-10 h-10 rounded-xl" />
      </header>

      {/* 2. Contenido de la tienda */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Banner de Tienda */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center">
          <Skeleton className="w-24 h-24 rounded-full flex-shrink-0" />
          <div className="space-y-3 flex-grow text-center md:text-left">
            <Skeleton className="h-6 w-56 mx-auto md:mx-0" />
            <Skeleton className="h-4 w-5/6 mx-auto md:mx-0" />
            <Skeleton className="h-4.5 w-36 mx-auto md:mx-0" />
          </div>
        </div>

        {/* Buscador */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm w-full">
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col">
              {/* Imagen del Producto */}
              <Skeleton className="aspect-square w-full rounded-t-2xl rounded-b-none" />
              
              {/* Detalles del Producto */}
              <div className="p-3 space-y-2 flex-grow flex flex-col justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-4.5 w-16" />
                  <Skeleton className="w-7 h-7 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
