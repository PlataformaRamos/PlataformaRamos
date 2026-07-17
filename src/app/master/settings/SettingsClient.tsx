'use client'

import React, { useState } from 'react'
import {
  ShieldCheck,
  Search,
  FileText,
  Clock,
  Lock,
  Unlock,
  CreditCard,
  UserCog,
  AlertTriangle,
  Filter
} from 'lucide-react'

interface AuditLog {
  id: string
  admin_id: string | null
  action: string
  target_id: string
  target_name: string | null
  reason: string
  created_at: string
}

interface SettingsClientProps {
  initialLogs: AuditLog[]
}

const ACTION_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  suspend_store: { label: 'Tienda Suspendida', icon: <Lock className="w-3.5 h-3.5" />, color: 'text-red-400 bg-red-950/30 border-red-900/30' },
  activate_store: { label: 'Tienda Activada', icon: <Unlock className="w-3.5 h-3.5" />, color: 'text-emerald-400 bg-emerald-950/30 border-emerald-900/30' },
  change_plan: { label: 'Plan Cambiado', icon: <CreditCard className="w-3.5 h-3.5" />, color: 'text-indigo-400 bg-indigo-950/30 border-indigo-900/30' },
  update_role: { label: 'Rol Actualizado', icon: <UserCog className="w-3.5 h-3.5" />, color: 'text-amber-400 bg-amber-950/30 border-amber-900/30' },
  register_payment: { label: 'Pago Registrado', icon: <CreditCard className="w-3.5 h-3.5" />, color: 'text-emerald-400 bg-emerald-950/30 border-emerald-900/30' },
}

export default function SettingsClient({ initialLogs }: SettingsClientProps) {
  const [logs] = useState<AuditLog[]>(initialLogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')

  const filteredLogs = logs.filter(log => {
    const matchesSearch = (log.target_name && log.target_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = actionFilter === 'all' || log.action === actionFilter
    return matchesSearch && matchesAction
  })

  const getActionDisplay = (action: string) => {
    return ACTION_LABELS[action] || {
      label: action,
      icon: <FileText className="w-3.5 h-3.5" />,
      color: 'text-slate-400 bg-slate-800 border-slate-700'
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
          <span>Auditoría y Ajustes</span>
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Bitácora de todas las acciones administrativas realizadas en la plataforma. Cada registro incluye el motivo obligatorio.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Total Acciones</div>
          <div className="text-2xl font-black text-white mt-1">{logs.length}</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Suspensiones</div>
          <div className="text-2xl font-black text-red-400 mt-1">{logs.filter(l => l.action === 'suspend_store').length}</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Cambios de Plan</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">{logs.filter(l => l.action === 'change_plan' || l.action === 'register_payment').length}</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Cambios de Rol</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{logs.filter(l => l.action === 'update_role').length}</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 mr-2" />
          <input
            type="text"
            placeholder="Buscar por nombre, acción o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-xs w-full text-white placeholder-slate-600 font-medium"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-[11px] text-slate-300 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">Todas las acciones</option>
          <option value="suspend_store">Suspensiones</option>
          <option value="activate_store">Activaciones</option>
          <option value="change_plan">Cambios de Plan</option>
          <option value="update_role">Cambios de Rol</option>
          <option value="register_payment">Pagos Registrados</option>
        </select>
      </div>

      {/* Timeline / Lista de Auditoría */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">
              {logs.length === 0
                ? 'La bitácora está vacía. Las acciones administrativas aparecerán aquí.'
                : 'No se encontraron registros con los filtros aplicados.'}
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const display = getActionDisplay(log.action)
            return (
              <div key={log.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 hover:border-slate-700 transition-all">
                {/* Icono y acción */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 ${display.color}`}>
                  {display.icon}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${display.color.split(' ')[0]}`}>
                      {display.label}
                    </span>
                    <span className="text-[10px] text-slate-600">•</span>
                    <span className="text-[10px] text-white font-extrabold">{log.target_name || log.target_id.slice(0, 8)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{log.reason}</p>
                </div>

                {/* Fecha */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(log.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}{' '}
                    {new Date(log.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
