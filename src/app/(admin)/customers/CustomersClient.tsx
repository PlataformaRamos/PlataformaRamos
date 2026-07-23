'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ConfirmModal from '@/components/ui/ConfirmModal'

interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  orders_count: number
  total_spent: number
  last_order_date: string | null
  created_at: string
}

interface CustomersClientProps {
  store: {
    id: string
    name: string
    currency_code?: string
  }
  initialCustomers: Customer[]
}

export default function CustomersClient({ store, initialCustomers }: CustomersClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSegment, setFilterSegment] = useState<'all' | 'frequent' | 'new' | 'inactive'>('all')

  // Estados Modal Crear/Editar Cliente
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [custName, setCustName] = useState('')
  const [custPhone, setCustPhone] = useState('')
  const [custEmail, setCustEmail] = useState('')
  const [loadingSave, setLoadingSave] = useState(false)

  const supabase = createClient()

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

  // Abrir Modal de Crear / Editar
  const handleOpenCustomerModal = (customer: Customer | null) => {
    setSelectedCustomer(customer)
    if (customer) {
      setCustName(customer.name)
      setCustPhone(customer.phone)
      setCustEmail(customer.email || '')
    } else {
      setCustName('')
      setCustPhone('+51')
      setCustEmail('')
    }
    setIsCustomerModalOpen(true)
  }

  // Guardar Cliente (Crear / Editar)
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!custName.trim() || !custPhone.trim()) return

    setLoadingSave(true)
    const cleanPhone = custPhone.startsWith('+') ? custPhone : `+${custPhone.trim()}`

    if (selectedCustomer) {
      // Editar
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: custName.trim(),
          phone: cleanPhone,
          email: custEmail.trim() || null,
        })
        .eq('id', selectedCustomer.id)
        .select()
        .single()

      if (!error && data) {
        setCustomers((prev) => prev.map((c) => c.id === selectedCustomer.id ? { ...c, ...data } : c))
        setIsCustomerModalOpen(false)
      }
    } else {
      // Crear
      const { data, error } = await supabase
        .from('customers')
        .insert({
          store_id: store.id,
          name: custName.trim(),
          phone: cleanPhone,
          email: custEmail.trim() || null,
          orders_count: 0,
          total_spent: 0
        })
        .select()
        .single()

      if (!error && data) {
        setCustomers((prev) => [data, ...prev])
        setIsCustomerModalOpen(false)
      }
    }

    setLoadingSave(false)
  }

  // Estado ConfirmModal de Eliminación de Cliente
  const [deleteCustId, setDeleteCustId] = useState<string | null>(null)
  const [loadingDelete, setLoadingDelete] = useState(false)

  // Disparar Modal de Confirmación
  const triggerDeleteCustomer = (customerId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteCustId(customerId)
  }

  // Ejecutar Eliminar Cliente
  const handleConfirmDeleteCustomer = async () => {
    if (!deleteCustId) return
    setLoadingDelete(true)

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', deleteCustId)

    if (!error) {
      setCustomers((prev) => prev.filter((c) => c.id !== deleteCustId))
    }
    setLoadingDelete(false)
    setDeleteCustId(null)
  }

  // Segmentación y filtros
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch = 
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.phone.includes(searchQuery)

    if (!matchesSearch) return false

    if (filterSegment === 'frequent') {
      return cust.orders_count >= 5
    }
    if (filterSegment === 'new') {
      const diffTime = Math.abs(Date.now() - new Date(cust.created_at).getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7
    }
    if (filterSegment === 'inactive') {
      return cust.orders_count === 0
    }

    return true
  })

  // KPIs
  const totalCustomers = customers.length
  const frequentCustomers = customers.filter(c => c.orders_count >= 5).length
  const recurrentPercentage = totalCustomers > 0 
    ? Math.round((frequentCustomers / totalCustomers) * 100) 
    : 0

  const totalSpentAll = customers.reduce((sum, c) => sum + c.total_spent, 0)
  const ticketAverage = totalCustomers > 0 ? totalSpentAll / totalCustomers : 0

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  }

  return (
    <div className="space-y-8 font-body-base text-on-surface">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Gestión de Clientes</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Administra la base de datos de tus compradores, revisa su historial de pedidos y fidelidad.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleOpenCustomerModal(null)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Añadir Cliente</span>
          </button>
        </div>
      </div>

      {/* KPIs Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 flex flex-col gap-2 shadow-sm">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Clientes</span>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-slate-900">{totalCustomers}</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 flex flex-col gap-2 shadow-sm">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Clientes Recurrentes</span>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-emerald-600">{frequentCustomers}</span>
            <span className="text-xs font-bold text-emerald-600 mb-1">({recurrentPercentage}%)</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 flex flex-col gap-2 shadow-sm">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Ticket Promedio por Cliente</span>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-slate-900">{formatCurrency(ticketAverage)}</span>
          </div>
        </div>
      </div>

      {/* Controles de Búsqueda y Segmentación */}
      <div className="bg-white border border-border-subtle rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4 items-center shadow-sm">
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o teléfono..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'frequent', label: 'Recurrentes (5+)' },
            { id: 'new', label: 'Nuevos (7 días)' },
            { id: 'inactive', label: 'Sin Compras' },
          ].map((seg) => (
            <button
              key={seg.id}
              onClick={() => setFilterSegment(seg.id as any)}
              className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all whitespace-nowrap ${
                filterSegment === seg.id 
                  ? 'bg-slate-900 text-white border-transparent shadow-xs' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {seg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <span className="material-symbols-outlined text-[40px] text-slate-200 mx-auto mb-2 block">group</span>
            <div className="font-bold text-sm text-slate-700">No se encontraron clientes</div>
            <p className="text-xs text-slate-500 mt-1">Usa el botón superior para agregar un cliente a tu tienda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-border-subtle text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4 w-[180px]">WhatsApp</th>
                  <th className="px-6 py-4 text-right w-[110px]">Pedidos</th>
                  <th className="px-6 py-4 text-right w-[140px]">Total Gastado</th>
                  <th className="px-6 py-4 w-[160px]">Última Compra</th>
                  <th className="px-6 py-4 text-center w-[140px]">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-border-subtle text-slate-800">
                {filteredCustomers.map((cust) => {
                  const whatsappLink = `https://api.whatsapp.com/send?phone=${cust.phone.replace('+', '')}`
                  return (
                    <tr 
                      key={cust.id} 
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => handleOpenCustomerModal(cust)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xs">
                            {getInitials(cust.name)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{cust.name}</p>
                            <p className="text-slate-400 text-[10px]">{cust.email || 'Sin correo registrado'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{cust.phone}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">{cust.orders_count}</td>
                      <td className="px-6 py-4 text-right font-bold text-blue-600 text-sm">{formatCurrency(cust.total_spent)}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {cust.last_order_date ? (
                          new Date(cust.last_order_date).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })
                        ) : (
                          <span className="text-slate-400">Sin compras</span>
                        )}
                      </td>
                      
                      {/* Acciones */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <a 
                            href={whatsappLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Enviar WhatsApp"
                          >
                            <span className="material-symbols-outlined text-[18px]">chat</span>
                          </a>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenCustomerModal(cust)
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar cliente"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button 
                            onClick={(e) => triggerDeleteCustomer(cust.id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar cliente"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR CLIENTE */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="fixed inset-0 bg-transparent" onClick={() => setIsCustomerModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {selectedCustomer ? 'Editar Ficha de Cliente' : 'Añadir Nuevo Cliente'}
              </h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="block text-slate-700">Nombre Completo</label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700">Teléfono (WhatsApp E.164)</label>
                <input
                  type="text"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="+51987654321"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700">Correo Electrónico (Opcional)</label>
                <input
                  type="email"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="cliente@ejemplo.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs disabled:opacity-50"
                >
                  {loadingSave ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL ELIMINAR CLIENTE */}
      <ConfirmModal
        isOpen={Boolean(deleteCustId)}
        title="¿Eliminar cliente permanentemente?"
        description="Esta acción eliminará la ficha de datos del comprador de tu tienda. Los pedidos previos conservarán su historial."
        confirmText="Sí, Eliminar Cliente"
        cancelText="Cancelar"
        variant="danger"
        isLoading={loadingDelete}
        onConfirm={handleConfirmDeleteCustomer}
        onClose={() => setDeleteCustId(null)}
      />
    </div>
  )
}
