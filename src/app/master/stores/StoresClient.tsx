'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Store, 
  Search, 
  Lock, 
  Unlock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  ChevronDown, 
  ExternalLink,
  AlertTriangle,
  X,
  Crown,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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

interface StoresClientProps {
  initialStores: StoreType[]
}

export default function StoresClient({ initialStores }: StoresClientProps) {
  const supabase = createClient()

  const [stores, setStores] = useState<StoreType[]>(initialStores)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'premium'>('all')
  const [updatingStoreId, setUpdatingStoreId] = useState<string | null>(null)

  // Modal de motivo obligatorio
  const [reasonModal, setReasonModal] = useState<{
    open: boolean
    storeId: string
    storeName: string
    action: 'suspend' | 'activate' | 'change_plan'
    currentPlan?: string
  } | null>(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')

  // Suspender / Activar tienda CON motivo
  const handleToggleStoreStatus = (store: StoreType) => {
    setReason('')
    setReasonError('')
    setReasonModal({
      open: true,
      storeId: store.id,
      storeName: store.name,
      action: store.is_active ? 'suspend' : 'activate',
    })
  }

  // Cambiar plan CON motivo
  const handleChangeStorePlan = (store: StoreType) => {
    setReason('')
    setReasonError('')
    setReasonModal({
      open: true,
      storeId: store.id,
      storeName: store.name,
      action: 'change_plan',
      currentPlan: store.plan_id,
    })
  }

  // Confirmar acción con motivo obligatorio
  const confirmAction = async () => {
    if (!reasonModal) return
    if (reason.trim().length < 5) {
      setReasonError('El motivo debe tener al menos 5 caracteres.')
      return
    }

    setUpdatingStoreId(reasonModal.storeId)
    setReasonError('')

    try {
      if (reasonModal.action === 'suspend' || reasonModal.action === 'activate') {
        const newStatus = reasonModal.action === 'activate'
        const { error } = await supabase
          .from('stores')
          .update({ is_active: newStatus })
          .eq('id', reasonModal.storeId)

        if (error) throw error

        setStores(prev => prev.map(s => s.id === reasonModal.storeId ? { ...s, is_active: newStatus } : s))

        // Registrar en bitácora
        await supabase.from('platform_audit_logs').insert({
          action: newStatus ? 'activate_store' : 'suspend_store',
          target_id: reasonModal.storeId,
          target_name: reasonModal.storeName,
          reason: reason.trim(),
        })

      } else if (reasonModal.action === 'change_plan') {
        const newPlan = reasonModal.currentPlan === 'free' ? 'premium' : 'free'
        const newExpiration = newPlan === 'premium'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : null

        const { error } = await supabase
          .from('stores')
          .update({ plan_id: newPlan, plan_expires_at: newExpiration })
          .eq('id', reasonModal.storeId)

        if (error) throw error

        setStores(prev => prev.map(s => s.id === reasonModal.storeId ? {
          ...s,
          plan_id: newPlan,
          plan_expires_at: newExpiration,
        } : s))

        // Registrar en bitácora
        await supabase.from('platform_audit_logs').insert({
          action: 'change_plan',
          target_id: reasonModal.storeId,
          target_name: reasonModal.storeName,
          reason: reason.trim(),
        })
      }

      setReasonModal(null)
      setReason('')
    } catch (err: any) {
      setReasonError(err.message || 'Error al ejecutar la acción.')
    } finally {
      setUpdatingStoreId(null)
    }
  }

  // Filtrado
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

  const activeCount = stores.filter(s => s.is_active).length
  const premiumCount = stores.filter(s => s.plan_id === 'premium').length

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
          <Store className="w-6 h-6 text-indigo-400" />
          <span>Gestión de Tiendas</span>
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Administra el estado, plan y acceso de todas las tiendas registradas en la plataforma.
        </p>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Total</div>
          <div className="text-2xl font-black text-white mt-1">{stores.length}</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Activas</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{activeCount}</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Suspendidas</div>
          <div className="text-2xl font-black text-red-400 mt-1">{stores.length - activeCount}</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Premium</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">{premiumCount}</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 mr-2" />
          <input
            type="text"
            placeholder="Buscar por nombre, slug o propietario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-xs w-full text-white placeholder-slate-600 font-medium"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-[11px] text-slate-300 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="inactive">Suspendidas</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-[11px] text-slate-300 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Todos los planes</option>
            <option value="free">Gratuito</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>

      {/* Tabla de Tiendas */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px] font-bold">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[9px]">
                <th className="py-3.5 px-5 font-black">Tienda</th>
                <th className="py-3.5 px-5 font-black">Slug / Dominio</th>
                <th className="py-3.5 px-5 font-black">WhatsApp</th>
                <th className="py-3.5 px-5 font-black">Plan</th>
                <th className="py-3.5 px-5 font-black">Estado</th>
                <th className="py-3.5 px-5 font-black">Registro</th>
                <th className="py-3.5 px-5 font-black text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs font-medium">
                    No se encontraron tiendas con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-800/20 transition-all">
                    <td className="py-3.5 px-5">
                      <div className="font-extrabold text-white">{store.name}</div>
                      {store.owner_name && (
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">{store.owner_name}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-mono text-[10px] text-slate-400">/{store.slug}</div>
                      {store.custom_domain && (
                        <div className="text-[9px] text-indigo-400 font-medium mt-0.5 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          {store.custom_domain}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-slate-400 font-mono text-[10px]">
                      {store.whatsapp_phone || '—'}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-black inline-flex items-center gap-1 ${
                        store.plan_id === 'premium'
                          ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {store.plan_id === 'premium' && <Crown className="w-3 h-3" />}
                        {store.plan_id}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold ${store.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${store.is_active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {store.is_active ? 'Activa' : 'Suspendida'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-medium text-[10px]">
                      {new Date(store.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={updatingStoreId === store.id}
                          onClick={() => handleToggleStoreStatus(store)}
                          className={`p-2 rounded-lg text-[10px] font-bold transition-all ${
                            store.is_active
                              ? 'bg-red-950/30 text-red-400 hover:bg-red-950/50 border border-red-900/30'
                              : 'bg-emerald-950/30 text-emerald-400 hover:bg-emerald-950/50 border border-emerald-900/30'
                          }`}
                          title={store.is_active ? 'Suspender tienda' : 'Activar tienda'}
                        >
                          {updatingStoreId === store.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : store.is_active ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          disabled={updatingStoreId === store.id}
                          onClick={() => handleChangeStorePlan(store)}
                          className="p-2 rounded-lg bg-indigo-950/30 text-indigo-400 hover:bg-indigo-950/50 border border-indigo-900/30 transition-all"
                          title="Cambiar plan"
                        >
                          <Crown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Motivo Obligatorio */}
      {reasonModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-black text-white">
                  {reasonModal.action === 'suspend' && 'Suspender Tienda'}
                  {reasonModal.action === 'activate' && 'Reactivar Tienda'}
                  {reasonModal.action === 'change_plan' && 'Cambiar Plan'}
                </h3>
              </div>
              <button onClick={() => setReasonModal(null)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Estás a punto de{' '}
              {reasonModal.action === 'suspend' && <span className="text-red-400 font-bold">suspender</span>}
              {reasonModal.action === 'activate' && <span className="text-emerald-400 font-bold">reactivar</span>}
              {reasonModal.action === 'change_plan' && <span className="text-indigo-400 font-bold">cambiar el plan de</span>}
              {' '}la tienda <span className="font-black text-white">&quot;{reasonModal.storeName}&quot;</span>.
              {reasonModal.action === 'change_plan' && (
                <span> De <span className="font-bold">{reasonModal.currentPlan}</span> a <span className="font-bold text-indigo-400">{reasonModal.currentPlan === 'free' ? 'premium' : 'free'}</span>.</span>
              )}
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-300 font-bold">
                Motivo de la acción <span className="text-red-400">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => { setReason(e.target.value); setReasonError('') }}
                placeholder="Ej: Solicitud del cliente por renovación de plan..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                rows={3}
              />
              {reasonError && (
                <p className="text-[10px] text-red-400 font-bold">{reasonError}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                onClick={() => setReasonModal(null)}
                variant="ghost"
                className="text-slate-400 hover:text-white text-xs font-bold h-9 px-4"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmAction}
                disabled={updatingStoreId !== null}
                className={`text-xs font-bold h-9 px-5 rounded-xl ${
                  reasonModal.action === 'suspend'
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : reasonModal.action === 'activate'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {updatingStoreId ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  'Confirmar'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
