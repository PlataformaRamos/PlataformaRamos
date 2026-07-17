'use client'

import React, { useState } from 'react'
import { 
  ShoppingBag, 
  Users, 
  Store, 
  TrendingUp, 
  CheckCircle, 
  TrendingDown, 
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react'
import Link from 'next/link'

interface StoreType {
  id: string
  name: string
  slug: string
  plan_id: string
  is_active: boolean
  created_at: string
}

interface ProfileType {
  id: string
  full_name: string | null
  role: string
  created_at: string
}

interface OrderType {
  id: string
  total_amount: number
  status: string
  created_at: string
}

interface DashboardClientProps {
  initialStores: StoreType[]
  initialProfiles: ProfileType[]
  initialOrders: OrderType[]
}

export default function DashboardClient({ 
  initialStores, 
  initialProfiles,
  initialOrders 
}: DashboardClientProps) {
  const [stores] = useState<StoreType[]>(initialStores)
  const [profiles] = useState<ProfileType[]>(initialProfiles)
  const [orders] = useState<OrderType[]>(initialOrders)

  // Ventas confirmadas
  const totalSales = orders
    .filter(o => o.status === 'completed' || o.status === 'confirmed' || o.status === 'delivered')
    .reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0)

  const activeStoresCount = stores.filter(s => s.is_active).length
  const premiumStoresCount = stores.filter(s => s.plan_id === 'premium').length

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
          <TrendingUp className="w-6 h-6 text-indigo-400" />
          <span>Dashboard de Métricas</span>
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">Monitorea el crecimiento, ingresos estimados y uso general de la plataforma.</p>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2 relative overflow-hidden group hover:border-slate-700 transition-all shadow-sm">
          <div className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Store className="w-4.5 h-4.5" />
          </div>
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Tiendas Registradas</div>
          <div className="text-3xl font-black text-white">{stores.length}</div>
          <div className="text-[9px] text-indigo-400 font-bold">Total histórico</div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2 relative overflow-hidden group hover:border-slate-700 transition-all shadow-sm">
          <div className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-4.5 h-4.5" />
          </div>
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Tiendas Activas</div>
          <div className="text-3xl font-black text-white">{activeStoresCount}</div>
          <div className="text-[9px] text-emerald-400 font-bold">
            {stores.length > 0 ? Math.round((activeStoresCount / stores.length) * 100) : 0}% del total general
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2 relative overflow-hidden group hover:border-slate-700 transition-all shadow-sm">
          <div className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-yellow-500/10 text-yellow-450 flex items-center justify-center">
            <Users className="w-4.5 h-4.5" />
          </div>
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Usuarios Registrados</div>
          <div className="text-3xl font-black text-white">{profiles.length}</div>
          <div className="text-[9px] text-yellow-500 font-bold">Cuentas creadas</div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2 relative overflow-hidden group hover:border-slate-700 transition-all shadow-sm">
          <div className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
            <ShoppingBag className="w-4.5 h-4.5" />
          </div>
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Ventas WhatsApp</div>
          <div className="text-3xl font-black text-white">{formatPrice(totalSales)}</div>
          <div className="text-[9px] text-red-400 font-bold">Total pedidos cerrados</div>
        </div>
      </div>

      {/* Distribución y Estimado Mensual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <h3 className="text-xs font-black text-slate-350 uppercase tracking-wider">Distribución de Planes</h3>
          <div className="space-y-4 pt-2 text-xs font-bold">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-400">Premium (PEN 29.90/mes)</span>
                <span className="font-black text-indigo-400">{premiumStoresCount} ({stores.length > 0 ? Math.round((premiumStoresCount / stores.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full" style={{ width: `${stores.length > 0 ? (premiumStoresCount / stores.length) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-400">Gratuito (PEN 0/mes)</span>
                <span className="font-black text-slate-450">{stores.length - premiumStoresCount} ({stores.length > 0 ? Math.round(((stores.length - premiumStoresCount) / stores.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-700 h-full" style={{ width: `${stores.length > 0 ? ((stores.length - premiumStoresCount) / stores.length) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between">
          <h3 className="text-xs font-black text-slate-350 uppercase tracking-wider">Ingreso Mensual Estimado (MRR)</h3>
          <div className="py-2">
            <div className="text-4xl font-black text-emerald-400">{formatPrice(premiumStoresCount * 29.90)}</div>
            <p className="text-[11px] text-slate-400 font-medium mt-1.5 leading-relaxed">
              Calculado en base a las {premiumStoresCount} tiendas activas registradas en el Plan Premium.
            </p>
          </div>
          <div className="border-t border-slate-800/80 pt-4 flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Métricas estimadas sujetas a conciliación de pagos</span>
          </div>
        </div>
      </div>

      {/* Tabla Rápida de Tiendas Recientes */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">Últimas Tiendas Registradas</h3>
          <Link href="/master/stores" className="text-indigo-400 hover:text-indigo-300 text-[10px] font-black uppercase flex items-center gap-1">
            <span>Ver todas las tiendas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px] font-bold">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[9px]">
                <th className="py-3 px-4 font-black">Nombre</th>
                <th className="py-3 px-4 font-black">Enlace</th>
                <th className="py-3 px-4 font-black">Plan</th>
                <th className="py-3 px-4 font-black">Estado</th>
                <th className="py-3 px-4 font-black">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-350">
              {stores.slice(0, 5).map((st) => (
                <tr key={st.id} className="hover:bg-slate-800/20 transition-all">
                  <td className="py-3 px-4 font-extrabold text-white">{st.name}</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-500">/{st.slug}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-black ${
                      st.plan_id === 'premium' ? 'bg-indigo-650/20 text-indigo-400 border border-indigo-500/20' : 'bg-slate-850 text-slate-400'
                    }`}>
                      {st.plan_id}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 ${st.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <span>{st.is_active ? 'Activo' : 'Suspendido'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-medium">
                    {new Date(st.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
