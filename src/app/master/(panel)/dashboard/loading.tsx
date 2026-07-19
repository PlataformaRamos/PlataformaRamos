import React from 'react'
import Skeleton from '@/components/ui/Skeleton'

export default function MasterDashboardLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cabecera */}
      <div className="space-y-2 pb-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Grid de Métricas Master */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
            <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
            <div className="space-y-2 flex-grow">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Grilla Secundaria */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4.5 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
