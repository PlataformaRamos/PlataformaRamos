'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  total: number
  status: string
  created_at: string
}

interface DashboardClientProps {
  store: {
    id: string
    name: string
    slug: string
  }
  initialMetrics: {
    totalSales: number
    totalOrders: number
    pendingOrders: Order[]
  }
  planLimits: {
    currentProducts: number
    maxProducts: number
    planName: string
  }
}

export default function DashboardClient({ store, initialMetrics, planLimits }: DashboardClientProps) {
  const [metrics, setMetrics] = useState(initialMetrics)
  const [pendingOrders, setPendingOrders] = useState<Order[]>(initialMetrics.pendingOrders)
  const supabase = createClient()

  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15)

      gain.gain.setValueAtTime(0.35, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6)

      osc.connect(gain)
      gain.connect(audioCtx.destination)

      osc.start()
      osc.stop(audioCtx.currentTime + 0.6)
    } catch (e) {
      console.warn('Alerta sonora bloqueada o no soportada', e)
    }
  }

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-orders-${store.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${store.id}`,
        },
        (payload) => {
          const newOrder = payload.new as Order
          playAlertSound()
          setPendingOrders((prev) => [newOrder, ...prev].slice(0, 5))
          setMetrics((prev) => ({
            ...prev,
            totalOrders: prev.totalOrders + 1,
          }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [store.id, supabase])

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: 'completed' | 'canceled') => {
    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', orderId)

    if (!error) {
      setPendingOrders((prev) => prev.filter((order) => order.id !== orderId))
      if (nextStatus === 'completed') {
        const orderValue = pendingOrders.find((o) => o.id === orderId)?.total || 0
        setMetrics((prev) => ({
          ...prev,
          totalSales: prev.totalSales + Number(orderValue),
        }))
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const ticketAverage = metrics.totalOrders > 0 
    ? metrics.totalSales / metrics.totalOrders 
    : 0

  const planPercentage = Math.min((planLimits.currentProducts / planLimits.maxProducts) * 100, 100)

  const publicStoreUrl = `http://${store.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}`

  return (
    <div className="space-y-8 font-body-base text-on-surface">
      {/* Cabecera del Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-admin-deep-blue mb-2">Visión General</h2>
          <p className="font-body-base text-body-base text-on-surface-variant">
            Monitoriza el rendimiento de tu tienda <span className="font-semibold text-primary">{store.name}</span> de un vistazo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a 
            href={publicStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white border border-border-subtle rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center gap-2 shadow-sm h-9"
          >
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            <span>Visitar Tienda Pública</span>
          </a>

          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center gap-2 h-9">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Conectado en Vivo</span>
          </div>
        </div>
      </div>

      {/* Metrics Bento Grid (Diseño exacto de Stitch) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Ventas Totales */}
        <div className="bg-surface border border-border-subtle rounded-lg p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Ventas Totales</span>
            <div className="p-2 bg-secondary-container/10 text-secondary rounded-full flex">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>
          <div>
            <span className="font-headline-lg text-headline-lg text-admin-deep-blue">
              {formatCurrency(metrics.totalSales)}
            </span>
            <p className="font-body-sm text-body-sm text-status-completed flex items-center mt-2">
              <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
              +15% vs mes anterior
            </p>
          </div>
        </div>

        {/* Pedidos Nuevos */}
        <div className="bg-surface border border-border-subtle rounded-lg p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Pedidos Nuevos</span>
            <div className="p-2 bg-secondary-container/10 text-secondary rounded-full flex">
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            </div>
          </div>
          <div>
            <span className="font-headline-lg text-headline-lg text-admin-deep-blue">
              {metrics.totalOrders}
            </span>
            <p className="font-body-sm text-body-sm text-status-completed flex items-center mt-2">
              <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
              +5% vs mes anterior
            </p>
          </div>
        </div>

        {/* Tasa de Conversión */}
        <div className="bg-surface border border-border-subtle rounded-lg p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Tasa de Conversión</span>
            <div className="p-2 bg-secondary-container/10 text-secondary rounded-full flex">
              <span className="material-symbols-outlined text-[20px]">analytics</span>
            </div>
          </div>
          <div>
            <span className="font-headline-lg text-headline-lg text-admin-deep-blue">3.2%</span>
            <p className="font-body-sm text-body-sm text-status-canceled flex items-center mt-2">
              <span className="material-symbols-outlined text-[16px] mr-1">trending_down</span>
              -0.5% vs mes anterior
            </p>
          </div>
        </div>
      </div>

      {/* Chart & Recent Orders Split (Diseño exacto de Stitch) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Sales Chart Area */}
        <div className="lg:col-span-2 bg-surface border border-border-subtle rounded-lg p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-md text-headline-md text-admin-deep-blue">Ventas Semanales</h3>
            <select className="bg-surface-container-low border border-border-subtle rounded px-3 py-1 font-body-sm text-body-sm text-on-surface-variant focus:ring-secondary focus:border-secondary focus:outline-none">
              <option>Esta semana</option>
              <option>Semana pasada</option>
            </select>
          </div>

          <div className="flex-1 bg-surface-container-lowest border border-border-subtle border-dashed rounded flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-end justify-around px-4 pb-4 opacity-50">
              <div className="w-12 bg-secondary/20 rounded-t h-[40%]"></div>
              <div className="w-12 bg-secondary/40 rounded-t h-[70%]"></div>
              <div className="w-12 bg-secondary/30 rounded-t h-[50%]"></div>
              <div className="w-12 bg-secondary/80 rounded-t h-[90%]"></div>
              <div className="w-12 bg-secondary/50 rounded-t h-[60%]"></div>
              <div className="w-12 bg-secondary/20 rounded-t h-[30%]"></div>
              <div className="w-12 bg-secondary/60 rounded-t h-[80%]"></div>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant z-10 bg-surface px-4 py-2 rounded shadow-sm border border-border-subtle font-bold">
              Gráfico interactivo aquí
            </span>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="lg:col-span-1 bg-surface border border-border-subtle rounded-lg flex flex-col h-[400px]">
          <div className="p-6 border-b border-border-subtle flex justify-between items-center">
            <h3 className="font-headline-md text-headline-md text-admin-deep-blue">Pedidos Recientes</h3>
            <Link href="/orders" className="font-body-sm text-body-sm text-secondary hover:underline">
              Ver todos
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto">
            {pendingOrders.length === 0 ? (
              <div className="text-center py-16 text-slate-400 flex flex-col items-center justify-center h-full">
                <span className="material-symbols-outlined text-[40px] text-slate-200 mb-2">task_alt</span>
                <div className="font-bold text-xs text-slate-700">¡Todo al día!</div>
                <p className="text-[10px] text-slate-500 mt-1">No hay nuevos pedidos.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border-subtle">
                {pendingOrders.map((order, index) => (
                  <li 
                    key={order.id} 
                    className={`p-4 hover:bg-surface-container-lowest transition-colors flex justify-between items-center ${
                      index % 2 === 1 ? 'bg-[#F8FAFC]' : ''
                    }`}
                  >
                    <div>
                      <p className="font-body-base text-body-base font-bold text-admin-deep-blue">
                        #ORD-{order.id.slice(0, 4).toUpperCase()}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {order.customer_name}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-price-display text-price-display text-primary mb-1">
                        {formatCurrency(order.total)}
                      </span>
                      <span className="px-2 py-1 rounded bg-status-pending/10 text-status-pending font-label-caps text-[10px] uppercase font-bold tracking-wider">
                        Pendiente
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Caja de consumo del Plan (Consola) */}
      <div className="bg-surface border border-border-subtle rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1">
          <h4 className="font-headline-md text-body-base font-semibold text-admin-deep-blue">Consumo de Plan - {planLimits.planName}</h4>
          <p className="text-xs text-on-surface-variant">Límite de productos activos en tu tienda.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:max-w-md">
          <div className="flex-1">
            <div className="flex justify-between text-[10px] mb-1 font-bold text-slate-500">
              <span>PRODUCTOS</span>
              <span>{planLimits.currentProducts} / {planLimits.maxProducts}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary rounded-full transition-all" 
                style={{ width: `${planPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
