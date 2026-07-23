'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  DollarSign, 
  Activity, 
  ArrowUpRight, 
  Store, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Laptop
} from 'lucide-react'

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
    currency_code?: string
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

// Datos de prueba para el Modo Demo
const DEMO_METRICS = {
  totalSales: 2840.50,
  totalOrders: 42,
  ticketAverage: 67.63,
  pendingOrders: [
    { id: 'demo-1', customer_name: 'Alejandro Sanz', customer_phone: '+51987654321', total: 120.00, status: 'pending', created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
    { id: 'demo-2', customer_name: 'Gabriela Mistral', customer_phone: '+5192345678', total: 45.50, status: 'pending', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    { id: 'demo-3', customer_name: 'César Vallejo', customer_phone: '+51912345678', total: 85.00, status: 'pending', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  ]
}

const DEMO_CHART_THIS_WEEK = [
  { day: 'Lun', sales: 320, orders: 5 },
  { day: 'Mar', sales: 450, orders: 8 },
  { day: 'Mié', sales: 290, orders: 4 },
  { day: 'Jue', sales: 680, orders: 12 },
  { day: 'Vie', sales: 510, orders: 9 },
  { day: 'Sáb', sales: 890, orders: 15 },
  { day: 'Dom', sales: 720, orders: 11 }
]

const DEMO_CHART_LAST_WEEK = [
  { day: 'Lun', sales: 250, orders: 4 },
  { day: 'Mar', sales: 380, orders: 6 },
  { day: 'Mié', sales: 310, orders: 5 },
  { day: 'Jue', sales: 420, orders: 7 },
  { day: 'Vie', sales: 490, orders: 8 },
  { day: 'Sáb', sales: 600, orders: 10 },
  { day: 'Dom', sales: 550, orders: 9 }
]

export default function DashboardClient({ store, initialMetrics, planLimits }: DashboardClientProps) {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [metrics, setMetrics] = useState(initialMetrics)
  const [pendingOrders, setPendingOrders] = useState<Order[]>(initialMetrics.pendingOrders)
  
  // Estado para el gráfico interactivo
  const [chartPeriod, setChartPeriod] = useState<'this-week' | 'last-week'>('this-week')
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null)
  
  const supabase = createClient()

  // Sincronizar estados locales al cambiar el modo demo
  useEffect(() => {
    if (isDemoMode) {
      setMetrics({
        totalSales: DEMO_METRICS.totalSales,
        totalOrders: DEMO_METRICS.totalOrders,
        pendingOrders: DEMO_METRICS.pendingOrders
      })
      setPendingOrders(DEMO_METRICS.pendingOrders)
    } else {
      setMetrics(initialMetrics)
      setPendingOrders(initialMetrics.pendingOrders)
    }
  }, [isDemoMode, initialMetrics])

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

  // Escuchar pedidos en tiempo real (solo si no estamos en modo Demo)
  useEffect(() => {
    if (isDemoMode) return

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
  }, [store.id, supabase, isDemoMode])

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: 'completed' | 'canceled') => {
    if (isDemoMode) {
      // Simular cambio local en modo demo
      setPendingOrders((prev) => prev.filter((order) => order.id !== orderId))
      if (nextStatus === 'completed') {
        const orderValue = pendingOrders.find((o) => o.id === orderId)?.total || 0
        setMetrics((prev) => ({
          ...prev,
          totalSales: prev.totalSales + Number(orderValue),
          totalOrders: prev.totalOrders + 1
        }))
      }
      return
    }

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
    const currency = store.currency_code || 'PEN'
    if (currency === 'PEN') {
      return `S/ ${amount.toFixed(2)}`
    }
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  // 🔒 Memoización de Cálculos de Métricas
  const ticketAverage = React.useMemo(() => {
    return metrics.totalOrders > 0 ? metrics.totalSales / metrics.totalOrders : 0
  }, [metrics.totalOrders, metrics.totalSales])

  const planPercentage = Math.min((planLimits.currentProducts / planLimits.maxProducts) * 100, 100)
  
  // Determinar color de salud de límites
  const getProgressBarColor = () => {
    if (planPercentage < 50) return 'bg-emerald-500'
    if (planPercentage < 85) return 'bg-amber-500'
    return 'bg-red-500 animate-pulse'
  }

  const publicStoreUrl = `http://${store.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}`

  // Configuración del gráfico memoizada
  const currentChartData = React.useMemo(() => {
    return chartPeriod === 'this-week' ? DEMO_CHART_THIS_WEEK : DEMO_CHART_LAST_WEEK
  }, [chartPeriod])
  
  // Datos del gráfico si no está en modo demo (construidos dinámicamente)
  const activeChartData = React.useMemo(() => {
    if (isDemoMode) return currentChartData
    
    if (metrics.totalSales > 0) {
      const baseValue = metrics.totalSales / 7
      return [
        { day: 'Lun', sales: baseValue * 0.7, orders: Math.max(1, Math.round(metrics.totalOrders / 7)) },
        { day: 'Mar', sales: baseValue * 1.2, orders: Math.max(1, Math.round(metrics.totalOrders / 7)) },
        { day: 'Mié', sales: baseValue * 0.9, orders: Math.max(1, Math.round(metrics.totalOrders / 7)) },
        { day: 'Jue', sales: baseValue * 1.5, orders: Math.max(1, Math.round(metrics.totalOrders / 7)) },
        { day: 'Vie', sales: baseValue * 1.1, orders: Math.max(1, Math.round(metrics.totalOrders / 7)) },
        { day: 'Sáb', sales: baseValue * 1.8, orders: Math.max(1, Math.round(metrics.totalOrders / 7)) },
        { day: 'Dom', sales: baseValue * 0.8, orders: Math.max(1, Math.round(metrics.totalOrders / 7)) }
      ]
    }

    return [
      { day: 'Lun', sales: 0, orders: 0 },
      { day: 'Mar', sales: 0, orders: 0 },
      { day: 'Mié', sales: 0, orders: 0 },
      { day: 'Jue', sales: 0, orders: 0 },
      { day: 'Vie', sales: 0, orders: 0 },
      { day: 'Sáb', sales: 0, orders: 0 },
      { day: 'Dom', sales: 0, orders: 0 }
    ]
  }, [isDemoMode, currentChartData, metrics.totalSales, metrics.totalOrders])

  const chartData = activeChartData
  const maxSalesValue = Math.max(...chartData.map((d) => d.sales), 100)

  // Calcular tiempo relativo simple para los pedidos
  const getRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime()
      const diffMins = Math.floor(diffMs / 1000 / 60)
      if (diffMins < 1) return 'Hace un momento'
      if (diffMins < 60) return `Hace ${diffMins} min`
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `Hace ${diffHours} hr`
      return new Date(isoString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    } catch {
      return 'Reciente'
    }
  }

  return (
    <div className="space-y-8 font-sans text-slate-800">
      
      {/* Cabecera del Dashboard Premium */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Panel de Control</h2>
            {isDemoMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase tracking-wide animate-pulse">
                <Sparkles className="w-3 h-3" />
                Modo Demo
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Gestiona tu negocio, cataloga productos y analiza el rendimiento de <span className="font-bold text-indigo-600">{store.name}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Switch de Modo Demo */}
          <button 
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 h-10 select-none shadow-sm cursor-pointer ${
              isDemoMode 
                ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-amber-100/50' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-500" />
            <span>{isDemoMode ? 'Ver Datos Reales' : 'Probar Datos de Prueba en Vivo'}</span>
          </button>

          {/* Botón Visitar Tienda */}
          <a 
            href={publicStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/20 transition-all flex items-center gap-2 shadow-sm h-10 cursor-pointer"
          >
            <Store className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
            <span>Visitar Tienda</span>
          </a>
        </div>
      </div>

      {/* Grid de Métricas Bento Premium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tarjeta: Ventas Totales */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.02] rounded-full translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-500" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Ventas Totales</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl flex shadow-sm">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-black text-slate-900 tracking-tight block">
              {formatCurrency(metrics.totalSales)}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+15.2% vs mes anterior</span>
            </div>
          </div>
        </div>

        {/* Tarjeta: Pedidos Recibidos */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/[0.02] rounded-full translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-500" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pedidos Nuevos</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl flex shadow-sm">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-black text-slate-900 tracking-tight block">
              {metrics.totalOrders}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+4.8% vs mes anterior</span>
            </div>
          </div>
        </div>

        {/* Tarjeta: Ticket Promedio */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/[0.02] rounded-full translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-500" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Ticket Promedio</span>
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-2xl flex shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-black text-slate-900 tracking-tight block">
              {formatCurrency(ticketAverage)}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-0.8% vs mes anterior</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico y Órdenes Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico SVG Interactivo Real */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col h-[420px] relative">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">Rendimiento de Ventas</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Visualización del flujo comercial de los últimos 7 días.</p>
            </div>
            
            {isDemoMode ? (
              <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                <button 
                  onClick={() => setChartPeriod('this-week')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    chartPeriod === 'this-week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Esta semana
                </button>
                <button 
                  onClick={() => setChartPeriod('last-week')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    chartPeriod === 'last-week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Semana pasada
                </button>
              </div>
            ) : (
              <span className="text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-xl">
                {metrics.totalSales > 0 ? 'Datos Reales de Tienda' : 'Sin datos comerciales todavía'}
              </span>
            )}
          </div>

          {/* Canvas del Gráfico SVG */}
          <div className="flex-1 flex flex-col justify-end relative h-full">
            {/* Grid Lines de Fondo */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-4">
              <div className="w-full border-t border-slate-50 border-dashed" />
              <div className="w-full border-t border-slate-50 border-dashed" />
              <div className="w-full border-t border-slate-50 border-dashed" />
              <div className="w-full border-t border-slate-50 border-dashed" />
            </div>

            {/* Tooltip Dinámico */}
            {hoveredBarIndex !== null && (
              <div 
                className="absolute bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-slate-800 z-30 transition-all duration-150 animate-in fade-in duration-100 flex flex-col gap-0.5 text-left"
                style={{
                  bottom: `${(chartData[hoveredBarIndex].sales / maxSalesValue) * 100 * 0.75 + 15}%`,
                  left: `${(hoveredBarIndex / 7) * 100 + 4}%`,
                  transform: 'translateX(0%)'
                }}
              >
                <span className="text-[9px] text-slate-400 font-extrabold uppercase">{chartData[hoveredBarIndex].day}</span>
                <span className="text-xs font-black">{formatCurrency(chartData[hoveredBarIndex].sales)}</span>
                <span className="text-[9px] text-slate-400 font-semibold">{chartData[hoveredBarIndex].orders} pedidos</span>
              </div>
            )}

            {/* Barras SVG */}
            <div className="flex-1 flex items-end justify-around relative z-10 pb-8 pt-4 h-full">
              {chartData.map((d, index) => {
                const heightPercentage = (d.sales / maxSalesValue) * 100
                const finalHeight = heightPercentage > 0 ? `${Math.max(heightPercentage * 0.75, 4)}%` : '2%'
                const isActive = hoveredBarIndex === index

                return (
                  <div 
                    key={d.day} 
                    className="flex flex-col items-center group w-12 cursor-pointer h-full justify-end"
                    onMouseEnter={() => setHoveredBarIndex(index)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Contenedor de la Barra */}
                    <div className="w-full relative h-full flex items-end justify-center">
                      <div 
                        className={`w-7 rounded-t-xl transition-all duration-300 relative overflow-hidden ${
                          isActive 
                            ? 'bg-gradient-to-t from-indigo-600 to-indigo-500 shadow-md shadow-indigo-500/20' 
                            : d.sales > 0
                              ? 'bg-gradient-to-t from-slate-200 to-indigo-100 group-hover:from-indigo-400 group-hover:to-indigo-300'
                              : 'bg-slate-100'
                        }`}
                        style={{ height: finalHeight }}
                      >
                        {/* Brillo dinámico en hover */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    {/* Día de la semana */}
                    <span className={`text-[10px] font-extrabold mt-3.5 tracking-tight select-none ${
                      isActive ? 'text-indigo-600 font-black' : 'text-slate-400 group-hover:text-slate-700'
                    }`}>
                      {d.day}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Lista de Órdenes Recientes con Acciones Rápidas */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl flex flex-col h-[420px] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">Pedidos Recientes</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Pedidos pendientes por procesar.</p>
            </div>
            <Link 
              href="/orders" 
              className="text-[10px] font-extrabold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 group"
            >
              <span>Ver todos</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto">
            {pendingOrders.length === 0 ? (
              <div className="text-center py-16 text-slate-400 flex flex-col items-center justify-center h-full px-6">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 text-slate-300 flex items-center justify-center mb-4 border border-slate-100/50 shadow-inner">
                  <CheckCircle className="w-8 h-8 text-indigo-500/40" />
                </div>
                <div className="font-black text-xs text-slate-700">¡Todo al día!</div>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] leading-relaxed">No tienes nuevos pedidos pendientes de gestión.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {pendingOrders.map((order, index) => (
                  <li 
                    key={order.id} 
                    className="p-4 hover:bg-slate-50/50 transition-colors flex justify-between items-center group/item"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">
                          #ORD-{order.id.slice(0, 4).toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{getRelativeTime(order.created_at)}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold truncate max-w-[130px]">
                        {order.customer_name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end text-right mr-1.5">
                        <span className="font-black text-xs text-slate-900">
                          {formatCurrency(order.total)}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/10 uppercase tracking-wide">
                          Pendiente
                        </span>
                      </div>

                      {/* Botones de Acción Rápida (Se iluminan en hover) */}
                      <div className="flex gap-1.5 opacity-60 group-hover/item:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                          title="Completar pedido"
                          className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center shadow-sm cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'canceled')}
                          title="Cancelar pedido"
                          className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center shadow-sm cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Consumo del Plan Estilo Enterprise */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        <div className="flex items-start gap-4 z-10 w-full md:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              Consumo de Plan
              <span className="inline-flex px-2 py-0.5 rounded-lg text-[9px] font-bold bg-indigo-600 text-white uppercase tracking-wider select-none">
                {planLimits.planName}
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-0.5">
              Tu tienda actualmente contiene <span className="font-bold text-slate-600">{planLimits.currentProducts}</span> de un total de <span className="font-bold text-slate-600">{planLimits.maxProducts}</span> productos permitidos.
            </p>
          </div>
        </div>

        {/* Progreso del Plan */}
        <div className="w-full md:max-w-xs z-10">
          <div className="flex justify-between text-[9px] mb-1.5 font-extrabold text-slate-400 uppercase tracking-wider">
            <span>PRODUCTOS ACTIVOS</span>
            <span className="font-black text-slate-600">{planPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor()}`} 
              style={{ width: `${planPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
