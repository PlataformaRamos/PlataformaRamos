import React from 'react'
import Skeleton from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cabecera del Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>

      {/* Bento Grid de Métricas y Uso de Plan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta 1: Ventas Totales */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
          <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="space-y-2 flex-grow">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>

        {/* Tarjeta 2: Pedidos Totales */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
          <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="space-y-2 flex-grow">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>

        {/* Tarjeta 3: Estado de Suscripción */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
          <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="space-y-2 flex-grow">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
      </div>

      {/* Grid Inferior: Límites de Consumo y Pedidos Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Límite de Productos */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-10" />
              <Skeleton className="h-3.5 w-16" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>

        {/* Listado de Pedidos Recientes */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <div className="space-y-1">
              <Skeleton className="h-4.5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-3.5 w-16" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3.5 w-36" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
