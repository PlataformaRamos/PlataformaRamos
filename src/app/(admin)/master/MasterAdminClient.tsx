'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  ShoppingBag, 
  Users, 
  Store, 
  Search, 
  Lock, 
  Unlock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Calendar, 
  RefreshCw, 
  ArrowLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react'
import Link from 'next/link'

interface StoreType {
  id: string
  owner_id: string
  name: string
  slug: string
  custom_domain: string | null
  whatsapp_phone: string
  plan_id: string
  plan_expires_at: string | null
  is_active: boolean
  owner_name: string | null
  created_at: string
}

interface ProfileType {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: string
  created_at: string
}

interface OrderType {
  id: string
  total_amount: number
  status: string
  created_at: string
}

interface MasterAdminClientProps {
  initialStores: StoreType[]
  initialProfiles: ProfileType[]
  initialOrders: OrderType[]
}

export default function MasterAdminClient({ 
  initialStores, 
  initialProfiles,
  initialOrders 
}: MasterAdminClientProps) {
  const supabase = createClient()
  
  const [stores, setStores] = useState<StoreType[]>(initialStores)
  const [profiles, setProfiles] = useState<ProfileType[]>(initialProfiles)
  const [orders] = useState<OrderType[]>(initialOrders)
  
  const [activeTab, setActiveTab] = useState<'kpis' | 'stores' | 'users'>('kpis')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'premium'>('all')
  
  const [updatingStoreId, setUpdatingStoreId] = useState<string | null>(null)
  
  // Cambiar estado activo/inactivo de la tienda de forma inline
  const handleToggleStoreStatus = async (storeId: string, currentStatus: boolean) => {
    setUpdatingStoreId(storeId)
    const newStatus = !currentStatus
    
    try {
      const { error } = await supabase
        .from('stores')
        .update({ is_active: newStatus })
        .eq('id', storeId)
        
      if (error) throw error
      
      setStores(prev => prev.map(s => s.id === storeId ? { ...s, is_active: newStatus } : s))
    } catch (err: any) {
      alert(`Error al actualizar estado de la tienda: ${err.message}`)
    } finally {
      setUpdatingStoreId(null)
    }
  }

  // Cambiar plan de la tienda de forma inline
  const handleChangeStorePlan = async (storeId: string, currentPlan: string) => {
    setUpdatingStoreId(storeId)
    const newPlan = currentPlan === 'free' ? 'premium' : 'free'
    
    // Extender expiración si es premium (ej: 1 año)
    const newExpiration = newPlan === 'premium' 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : null
      
    try {
      const { error } = await supabase
        .from('stores')
        .update({ 
          plan_id: newPlan,
          plan_expires_at: newExpiration
        })
        .eq('id', storeId)
        
      if (error) throw error
      
      setStores(prev => prev.map(s => s.id === storeId ? { 
        ...s, 
        plan_id: newPlan,
        plan_expires_at: newExpiration
      } : s))
    } catch (err: any) {
      alert(`Error al cambiar el plan de la tienda: ${err.message}`)
    } finally {
      setUpdatingStoreId(null)
    }
  }

  // Filtrado de tiendas
  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (store.slug && store.slug.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (store.owner_name && store.owner_name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && store.is_active) || 
                          (statusFilter === 'inactive' && !store.is_active)
                          
    const matchesPlan = planFilter === 'all' || store.plan_id === planFilter
    
    return matchesSearch && matchesStatus && matchesPlan
  })

  // Filtrado de usuarios
  const filteredProfiles = profiles.filter(profile => {
    return (profile.full_name && profile.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
           profile.role.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Estadísticas globales
  const totalSales = orders
    .filter(o => o.status === 'completed' || o.status === 'confirmed')
    .reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0)
    
  const activeStoresCount = stores.filter(s => s.is_active).length
  const premiumStoresCount = stores.filter(s => s.plan_id === 'premium').length

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="flex-1 p-6 md:p-10 bg-slate-950 min-h-screen text-slate-100 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/dashboard"
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Dashboard</span>
            </Link>
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            <span>Panel Master Administrador</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Monitorea tiendas, usuarios, planes y métricas de toda la plataforma.</p>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 self-start md:self-center font-bold text-xs">
          <button
            onClick={() => setActiveTab('kpis')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'kpis' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Métricas</span>
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'stores' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Tiendas ({stores.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios ({profiles.length})</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* VISTA DE METRICAS (KPIs) */}
        {activeTab === 'kpis' && (
          <div className="space-y-8 animate-in fade-in-50 duration-200">
            {/* Grid de KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="p-6 bg-slate-900 border border-slate-800/80 rounded-3xl space-y-2 relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">Tiendas Registradas</div>
                <div className="text-3xl font-black text-white">{stores.length}</div>
                <div className="text-[10px] text-indigo-400 font-bold">Total histórico</div>
              </div>

              <div className="p-6 bg-slate-900 border border-slate-800/80 rounded-3xl space-y-2 relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">Tiendas Activas</div>
                <div className="text-3xl font-black text-white">{activeStoresCount}</div>
                <div className="text-[10px] text-emerald-400 font-bold">{Math.round((activeStoresCount / (stores.length || 1)) * 100)}% de conversión</div>
              </div>

              <div className="p-6 bg-slate-900 border border-slate-800/80 rounded-3xl space-y-2 relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">Total Usuarios</div>
                <div className="text-3xl font-black text-white">{profiles.length}</div>
                <div className="text-[10px] text-yellow-400 font-bold">Cuentas creadas</div>
              </div>

              <div className="p-6 bg-slate-900 border border-slate-800/80 rounded-3xl space-y-2 relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">Ventas Confirmadas</div>
                <div className="text-3xl font-black text-white">{formatPrice(totalSales)}</div>
                <div className="text-[10px] text-red-400 font-bold">A través de pedidos WhatsApp</div>
              </div>

            </div>

            {/* Módulo de conversión / distribución de planes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider">Distribución de Planes</h3>
                <div className="space-y-4 pt-2 text-xs font-semibold">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span>Premium ($9.90/mes)</span>
                      <span className="font-black text-indigo-400">{premiumStoresCount} ({Math.round((premiumStoresCount / (stores.length || 1)) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full" style={{ width: `${(premiumStoresCount / (stores.length || 1)) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span>Gratuito ($0/mes)</span>
                      <span className="font-black text-slate-400">{stores.length - premiumStoresCount} ({Math.round(((stores.length - premiumStoresCount) / (stores.length || 1)) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-slate-600 h-full" style={{ width: `${((stores.length - premiumStoresCount) / (stores.length || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider">Ingreso Estimado Mensual (MRR)</h3>
                <div className="pt-2">
                  <div className="text-4xl font-black text-emerald-400">{formatPrice(premiumStoresCount * 9.90)}</div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium mt-1">Calculado en base a {premiumStoresCount} tiendas activas en el Plan Premium.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISTA DE TIENDAS */}
        {activeTab === 'stores' && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* Controles de Filtro */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900 p-4 border border-slate-800 rounded-2xl text-xs font-bold">
              {/* Buscador */}
              <div className="relative w-full md:max-w-xs">
                <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar tienda, slug o dueño..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-950 font-medium text-slate-200"
                />
              </div>

              {/* Filtros Dropdowns */}
              <div className="flex gap-3 w-full md:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="active">Activas</option>
                  <option value="inactive">Inactivas</option>
                </select>

                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300"
                >
                  <option value="all">Todos los Planes</option>
                  <option value="free">Gratuito</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>

            {/* Tabla de Tiendas */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl text-xs font-bold">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                      <th className="p-4.5 pl-6">Tienda</th>
                      <th className="p-4.5">Dueño</th>
                      <th className="p-4.5">Plan</th>
                      <th className="p-4.5">Expiración</th>
                      <th className="p-4.5">Estado</th>
                      <th className="p-4.5 pr-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                    {filteredStores.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-500">
                          No se encontraron tiendas con los filtros actuales.
                        </td>
                      </tr>
                    ) : (
                      filteredStores.map(store => (
                        <tr key={store.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4.5 pl-6">
                            <div className="font-bold text-white text-sm">{store.name}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">slug: {store.slug}</div>
                            {store.custom_domain && (
                              <div className="text-[9px] text-indigo-400 mt-0.5 font-bold">dom: {store.custom_domain}</div>
                            )}
                          </td>
                          <td className="p-4.5">
                            <div>{store.owner_name || 'Sin nombre'}</div>
                            <div className="text-[10px] text-slate-500 font-medium mt-0.5">{store.whatsapp_phone}</div>
                          </td>
                          <td className="p-4.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              store.plan_id === 'premium' ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-700/30' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {store.plan_id}
                            </span>
                          </td>
                          <td className="p-4.5">
                            {store.plan_expires_at ? (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                <span>{new Date(store.plan_expires_at).toLocaleDateString()}</span>
                              </span>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          <td className="p-4.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              store.is_active ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                            }`}>
                              {store.is_active ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                          <td className="p-4.5 pr-6 text-right space-x-2">
                            {/* Cambiar plan inline */}
                            <button
                              disabled={updatingStoreId !== null}
                              onClick={() => handleChangeStorePlan(store.id, store.plan_id)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-300 transition-colors"
                            >
                              Cambiar Plan
                            </button>
                            
                            {/* Cambiar estado inline */}
                            <button
                              disabled={updatingStoreId !== null}
                              onClick={() => handleToggleStoreStatus(store.id, store.is_active)}
                              className={`p-1.5 rounded-lg inline-flex items-center justify-center transition-colors ${
                                store.is_active 
                                  ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400' 
                                  : 'bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400'
                              }`}
                              title={store.is_active ? 'Desactivar Tienda' : 'Activar Tienda'}
                            >
                              {store.is_active ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VISTA DE USUARIOS */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* Buscador de usuarios */}
            <div className="flex bg-slate-900 p-4 border border-slate-800 rounded-2xl text-xs font-bold">
              <div className="relative w-full md:max-w-xs">
                <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar usuario por nombre o rol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-950 font-medium text-slate-200"
                />
              </div>
            </div>

            {/* Tabla de Usuarios */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl text-xs font-bold">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                      <th className="p-4.5 pl-6">Usuario</th>
                      <th className="p-4.5">Rol</th>
                      <th className="p-4.5">Registro</th>
                      <th className="p-4.5 pr-6 text-right">Tiendas del Usuario</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                    {filteredProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-slate-500">
                          No se encontraron usuarios registrados.
                        </td>
                      </tr>
                    ) : (
                      filteredProfiles.map(profile => {
                        const userStoresCount = stores.filter(s => s.owner_id === profile.id).length
                        return (
                          <tr key={profile.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-4.5 pl-6 flex items-center gap-3">
                              {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full border border-slate-800" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white uppercase">
                                  {profile.full_name?.charAt(0) || 'U'}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-white text-sm">{profile.full_name || 'Vendedor'}</div>
                                <div className="text-[10px] text-slate-500 font-medium mt-0.5">ID: {profile.id}</div>
                              </div>
                            </td>
                            <td className="p-4.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                profile.role === 'super_admin' ? 'bg-red-950 text-red-400 border border-red-800/30' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {profile.role}
                              </span>
                            </td>
                            <td className="p-4.5">
                              <span>{new Date(profile.created_at).toLocaleDateString()}</span>
                            </td>
                            <td className="p-4.5 pr-6 text-right">
                              <span className="font-extrabold text-sm text-white bg-slate-800 px-3 py-1 rounded-full">
                                {userStoresCount} {userStoresCount === 1 ? 'tienda' : 'tiendas'}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
