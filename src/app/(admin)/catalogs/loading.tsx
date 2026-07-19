import React from 'react'
import Skeleton from '@/components/ui/Skeleton'

export default function CatalogsLoading() {
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

      {/* Grid de Catálogos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3.5 w-60" />
                </div>
              </div>
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4.5 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24 rounded-lg" />
                <Skeleton className="h-9 w-10 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
