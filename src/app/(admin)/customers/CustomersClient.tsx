'use client'

import React, { useState } from 'react'

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
  const [customers] = useState<Customer[]>(initialCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSegment, setFilterSegment] = useState<'all' | 'frequent' | 'new' | 'inactive'>('all')

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
      // Creados en los últimos 7 días
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
      {/* Cabecera (Diseño de Stitch) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Gestión de Clientes</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Administra la base de datos de tus compradores, revisa su historial de pedidos y fidelidad.
          </p>
        </div>
        <button className="bg-admin-deep-blue text-on-primary px-5 py-2.5 rounded text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Exportar Clientes</span>
        </button>
      </div>

      {/* KPIs Bento Grid (Diseño de Stitch) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1 */}
        <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-6 flex flex-col gap-2 shadow-sm">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Clientes</span>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-primary">{totalCustomers}</span>
            <span className="text-status-completed text-xs font-bold flex items-center mb-1">
              <span className="material-symbols-outlined text-[16px] mr-0.5">trending_up</span> +12%
            </span>
          </div>
        </div>
        
        {/* KPI 2 */}
        <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-6 flex flex-col gap-2 shadow-sm">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Clientes Recurrentes</span>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-primary">{recurrentPercentage}%</span>
            <span className="text-status-completed text-xs font-bold flex items-center mb-1">
              <span className="material-symbols-outlined text-[16px] mr-0.5">trending_up</span> +3%
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-6 flex flex-col gap-2 shadow-sm">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Ticket Promedio</span>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-primary">{formatCurrency(ticketAverage)}</span>
            <span className="text-on-surface-variant text-xs mb-1 font-bold">{store.currency_code || 'PEN'}</span>
          </div>
        </div>
      </div>

      {/* Controles de Búsqueda y Segmentación (Diseño de Stitch) */}
      <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o teléfono..."
            className="w-full pl-10 pr-4 py-2 border border-border-subtle rounded bg-slate-50 focus:outline-none focus:border-admin-deep-blue focus:ring-1 focus:ring-admin-deep-blue text-xs transition-all"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'frequent', label: 'Frecuentes' },
            { id: 'new', label: 'Nuevos' },
            { id: 'inactive', label: 'Inactivos' },
          ].map((seg) => {
            const active = filterSegment === seg.id
            return (
              <button
                key={seg.id}
                onClick={() => setFilterSegment(seg.id as any)}
                className={`px-4 py-1.5 rounded-full border text-[10px] uppercase font-bold tracking-wider transition-colors whitespace-nowrap ${
                  active 
                    ? 'bg-admin-deep-blue text-on-primary border-transparent' 
                    : 'border-border-subtle text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {seg.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tabla de Clientes (Diseño de Stitch con Acciones Flotantes en Hover) */}
      <div className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <span className="material-symbols-outlined text-[40px] text-slate-200 mx-auto mb-2 block">group</span>
            <div className="font-bold text-sm text-slate-700">No se encontraron clientes</div>
            <p className="text-xs text-slate-500 mt-1">Intenta con otro filtro o consulta.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-border-subtle text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4 w-[180px]">WhatsApp</th>
                  <th className="px-6 py-4 text-right w-[110px]">Pedidos</th>
                  <th className="px-6 py-4 text-right w-[140px]">Total Gastado</th>
                  <th className="px-6 py-4 w-[160px]">Última Compra</th>
                  <th className="px-6 py-4 text-center w-[120px]">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-border-subtle text-slate-800">
                {filteredCustomers.map((cust) => {
                  const whatsappLink = `https://api.whatsapp.com/send?phone=${cust.phone.replace('+', '')}`
                  return (
                    <tr 
                      key={cust.id} 
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary-container/10 text-secondary flex items-center justify-center font-bold text-[10px]">
                            {getInitials(cust.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{cust.name}</p>
                            <p className="text-on-surface-variant text-[10px]">{cust.email || 'Sin correo registrado'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-medium">{cust.phone}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">{cust.orders_count}</td>
                      <td className="px-6 py-4 text-right font-bold text-primary text-sm">{formatCurrency(cust.total_spent)}</td>
                      <td className="px-6 py-4 text-on-surface-variant">
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
                      
                      {/* Acciones flotantes por hover (Diseño de Stitch) */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a 
                            href={whatsappLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 text-on-surface-variant hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="Enviar WhatsApp"
                          >
                            <span className="material-symbols-outlined text-[18px] block">chat</span>
                          </a>
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
    </div>
  )
}
