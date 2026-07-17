'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  CreditCard,
  Plus,
  X,
  RefreshCw,
  Search,
  Calendar,
  DollarSign,
  Receipt,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaymentType {
  id: string
  store_id: string
  amount: number
  payment_method: string
  payment_date: string
  expires_at: string | null
  registered_by: string | null
  notes: string | null
  created_at: string
}

interface StoreRef {
  id: string
  name: string
  slug: string
  plan_id: string
  plan_expires_at: string | null
}

interface PaymentsClientProps {
  initialPayments: PaymentType[]
  initialStores: StoreRef[]
}

const PAYMENT_METHODS = [
  { value: 'yape', label: 'Yape' },
  { value: 'plin', label: 'Plin' },
  { value: 'transfer', label: 'Transferencia bancaria' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'other', label: 'Otro' },
]

export default function PaymentsClient({ initialPayments, initialStores }: PaymentsClientProps) {
  const supabase = createClient()

  const [payments, setPayments] = useState<PaymentType[]>(initialPayments)
  const [stores] = useState<StoreRef[]>(initialStores)
  const [searchTerm, setSearchTerm] = useState('')

  // Modal de registrar pago
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    store_id: '',
    amount: '29.90',
    payment_method: 'yape',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId)
    return store ? store.name : storeId.slice(0, 8) + '...'
  }

  const handleRegisterPayment = async () => {
    if (!formData.store_id) {
      setFormError('Selecciona una tienda.')
      return
    }
    if (Number(formData.amount) <= 0) {
      setFormError('El monto debe ser mayor a 0.')
      return
    }

    setSaving(true)
    setFormError('')
    setSuccessMsg('')

    try {
      // Calcular nueva fecha de expiración (+30 días desde hoy)
      const newExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

      // 1. Registrar el pago
      const { data: newPayment, error: insertError } = await supabase
        .from('subscription_payments')
        .insert({
          store_id: formData.store_id,
          amount: Number(formData.amount),
          payment_method: formData.payment_method,
          expires_at: newExpiration,
          notes: formData.notes.trim() || null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // 2. Actualizar plan de la tienda a Premium + nueva fecha de expiración
      const { error: updateError } = await supabase
        .from('stores')
        .update({
          plan_id: 'premium',
          plan_expires_at: newExpiration,
        })
        .eq('id', formData.store_id)

      if (updateError) throw updateError

      // 3. Registrar en bitácora
      await supabase.from('platform_audit_logs').insert({
        action: 'register_payment',
        target_id: formData.store_id,
        target_name: getStoreName(formData.store_id),
        reason: `Pago registrado: S/ ${formData.amount} vía ${formData.payment_method}. ${formData.notes || ''}`.trim(),
      })

      setPayments(prev => [newPayment, ...prev])
      setSuccessMsg('Pago registrado exitosamente. La tienda fue actualizada a Premium.')

      // Limpiar formulario
      setTimeout(() => {
        setShowModal(false)
        setSuccessMsg('')
        setFormData({ store_id: '', amount: '29.90', payment_method: 'yape', notes: '' })
      }, 2000)

    } catch (err: any) {
      setFormError(err.message || 'Error al registrar el pago.')
    } finally {
      setSaving(false)
    }
  }

  const filteredPayments = payments.filter(p => {
    const storeName = getStoreName(p.store_id).toLowerCase()
    return storeName.includes(searchTerm.toLowerCase()) ||
      p.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const totalCollected = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0)

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-indigo-400" />
            <span>Pagos y Suscripciones</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Registra y consulta los pagos manuales de suscripción Premium de cada tienda.
          </p>
        </div>
        <Button
          onClick={() => { setShowModal(true); setFormError(''); setSuccessMsg('') }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold h-10 px-5 rounded-xl flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Pago</span>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Pagos Registrados</div>
          <div className="text-2xl font-black text-white mt-1">{payments.length}</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Total Recaudado</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{formatPrice(totalCollected)}</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Ticket Promedio</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">
            {payments.length > 0 ? formatPrice(totalCollected / payments.length) : 'S/ 0.00'}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 w-full md:w-80">
        <Search className="w-4 h-4 text-slate-500 mr-2" />
        <input
          type="text"
          placeholder="Buscar por tienda o método de pago..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none focus:outline-none text-xs w-full text-white placeholder-slate-600 font-medium"
        />
      </div>

      {/* Tabla de Pagos */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px] font-bold">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[9px]">
                <th className="py-3.5 px-5 font-black">Tienda</th>
                <th className="py-3.5 px-5 font-black">Monto</th>
                <th className="py-3.5 px-5 font-black">Método</th>
                <th className="py-3.5 px-5 font-black">Fecha del Pago</th>
                <th className="py-3.5 px-5 font-black">Vence</th>
                <th className="py-3.5 px-5 font-black">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs font-medium">
                    {payments.length === 0
                      ? 'Aún no se han registrado pagos. Presiona "Registrar Pago" para agregar el primero.'
                      : 'No se encontraron pagos con los filtros aplicados.'}
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-800/20 transition-all">
                    <td className="py-3.5 px-5 font-extrabold text-white">{getStoreName(payment.store_id)}</td>
                    <td className="py-3.5 px-5 text-emerald-400 font-black">{formatPrice(Number(payment.amount))}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-black bg-slate-800 text-slate-300">
                        {PAYMENT_METHODS.find(m => m.value === payment.payment_method)?.label || payment.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-400 font-medium text-[10px]">
                      {new Date(payment.payment_date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-5 text-slate-400 font-medium text-[10px]">
                      {payment.expires_at
                        ? new Date(payment.expires_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: '2-digit' })
                        : '—'}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-medium text-[10px] max-w-[200px] truncate">
                      {payment.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Registrar Pago */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-indigo-400">
                <Receipt className="w-5 h-5" />
                <h3 className="text-sm font-black text-white">Registrar Pago de Suscripción</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300 font-bold">
                  Tienda <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.store_id}
                  onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Seleccionar tienda...</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (/{s.slug})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-300 font-bold">
                    Monto (S/) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-300 font-bold">
                    Método de pago <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300 font-bold">Notas (opcional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ej: Pago por Yape confirmado con captura..."
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  rows={2}
                />
              </div>
            </div>

            {formError && (
              <p className="text-[10px] text-red-400 font-bold">{formError}</p>
            )}
            {successMsg && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                onClick={() => setShowModal(false)}
                variant="ghost"
                className="text-slate-400 hover:text-white text-xs font-bold h-9 px-4"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRegisterPayment}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold h-9 px-5 rounded-xl"
              >
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Registrar Pago'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
