'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  shipping_price: number
  subtotal: number
  total: number
  status: string
  created_at: string
}

interface OrderItem {
  id: string
  product_title: string
  price: number
  quantity: number
  selected_options: any[]
}

interface OrdersClientProps {
  store: {
    id: string
    name: string
    slug: string
    currency_code?: string
  }
  initialOrders: Order[]
}

export default function OrdersClient({ store, initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  
  // Detalle del pedido seleccionado
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([])
  const [loadingItems, setLoadingItems] = useState<boolean>(false)

  const supabase = createClient()

  // Reactividad en tiempo real de nuevos pedidos
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-orders-list-${store.id}`)
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
          setOrders((prev) => [newOrder, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${store.id}`,
        },
        (payload) => {
          const updatedOrder = payload.new as Order
          setOrders((prev) => prev.map((o) => o.id === updatedOrder.id ? updatedOrder : o))
          setSelectedOrder((current) => current && current.id === updatedOrder.id ? updatedOrder : current)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [store.id, supabase])

  // Cargar ítems al seleccionar un pedido
  useEffect(() => {
    if (!selectedOrder) return

    const fetchOrderItems = async () => {
      setLoadingItems(true)
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', selectedOrder.id)

      if (!error) {
        setSelectedOrderItems(data || [])
      }
      setLoadingItems(false)
    }

    fetchOrderItems()
  }, [selectedOrder, supabase])

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: 'completed' | 'canceled') => {
    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', orderId)

    if (!error) {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: nextStatus } : o))
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

  // Filtrado y búsqueda
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  // Mensaje estructurado de WhatsApp
  const generateWhatsAppLink = (order: Order, items: OrderItem[]) => {
    let itemsText = ''
    items.forEach((item) => {
      const optionsLabel = item.selected_options.length > 0 
        ? ` (${item.selected_options.map(o => o.value).join(', ')})`
        : ''
      itemsText += `• ${item.quantity}x ${item.product_title}${optionsLabel} - ${formatCurrency(item.price * item.quantity)}\n`
    })

    const message = `*DETALLES DEL PEDIDO #${order.id.slice(0, 8)}*\n\n` +
      `👤 *Cliente:* ${order.customer_name}\n` +
      `📞 *WhatsApp:* ${order.customer_phone}\n\n` +
      `📦 *Productos:*\n${itemsText}\n` +
      `💵 *Subtotal:* ${formatCurrency(order.subtotal)}\n` +
      `🚚 *Envío:* ${formatCurrency(order.shipping_price)}\n` +
      `💰 *Total:* ${formatCurrency(order.total)}\n\n` +
      `Coordinemos el despacho y el método de pago correspondiente. ¡Muchas gracias!`

    return `https://api.whatsapp.com/send?phone=${order.customer_phone.replace('+', '')}&text=${encodeURIComponent(message)}`
  }

  // Obtener iniciales
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  }

  return (
    <div className="space-y-6 font-body-base text-on-surface">
      {/* Cabecera (Diseño de Stitch) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface">Gestión de Pedidos</h2>
          <p className="text-sm text-on-surface-variant mt-1">Administra, filtra y revisa el estado de todos los pedidos entrantes.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-border-subtle rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Controles: Buscar y Filtros Rápidos (Diseño de Stitch) */}
      <div className="bg-surface border border-border-subtle rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {/* Todos */}
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all ${
              filterStatus === 'all'
                ? 'bg-slate-900 border-transparent text-white shadow-sm'
                : 'border-border-subtle bg-surface-container-low text-on-surface hover:bg-surface-variant'
            }`}
          >
            Todos
          </button>
          
          {/* Pendientes */}
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-2 ${
              filterStatus === 'pending'
                ? 'bg-status-pending border-transparent text-white shadow-sm'
                : 'border-status-pending/20 bg-status-pending/5 text-status-pending hover:bg-status-pending/10'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filterStatus === 'pending' ? 'bg-white' : 'bg-status-pending'}`}></span>
            <span>Pendiente</span>
          </button>

          {/* Completados */}
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-2 ${
              filterStatus === 'completed'
                ? 'bg-status-completed border-transparent text-white shadow-sm'
                : 'border-status-completed/20 bg-status-completed/5 text-status-completed hover:bg-status-completed/10'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filterStatus === 'completed' ? 'bg-white' : 'bg-status-completed'}`}></span>
            <span>Completado</span>
          </button>

          {/* Cancelados */}
          <button
            onClick={() => setFilterStatus('canceled')}
            className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-2 ${
              filterStatus === 'canceled'
                ? 'bg-status-canceled border-transparent text-white shadow-sm'
                : 'border-status-canceled/20 bg-status-canceled/5 text-status-canceled hover:bg-status-canceled/10'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filterStatus === 'canceled' ? 'bg-white' : 'bg-status-canceled'}`}></span>
            <span>Cancelado</span>
          </button>
        </div>

        {/* Buscador */}
        <div className="relative w-full md:max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar pedidos, clientes..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-xs text-on-surface focus:outline-none focus:border-admin-deep-blue focus:ring-1 focus:ring-admin-deep-blue transition-colors"
          />
        </div>
      </div>

      {/* Tabla de Pedidos (Diseño de Stitch) */}
      <div className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <span className="material-symbols-outlined text-[40px] text-slate-200 mx-auto mb-2 block">shopping_cart</span>
            <div className="font-bold text-sm text-slate-700">No se encontraron pedidos</div>
            <p className="text-xs text-slate-500 mt-1">Intenta ajustando los filtros o el término de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-border-subtle text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3 px-6 w-[130px]">ID Pedido</th>
                  <th className="py-3 px-6">Cliente</th>
                  <th className="py-3 px-6 w-[150px]">Fecha</th>
                  <th className="py-3 px-6 text-right w-[120px]">Total</th>
                  <th className="py-3 px-6 w-[150px]">Estado</th>
                  <th className="py-3 px-6 text-center w-[100px]">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-border-subtle text-slate-800">
                {filteredOrders.map((order, index) => (
                  <tr 
                    key={order.id} 
                    className={`hover:bg-surface transition-colors ${
                      index % 2 === 1 ? 'bg-surface/30' : 'bg-white'
                    }`}
                  >
                    <td className="py-4 px-6 font-bold font-mono text-[11px] text-slate-500">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant font-bold text-[10px]">
                          {getInitials(order.customer_name)}
                        </div>
                        <div>
                          <p className="text-on-surface font-semibold text-sm">{order.customer_name}</p>
                          <p className="text-on-surface-variant text-[10px]">{order.customer_phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">
                      {new Date(order.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className={`py-4 px-6 font-bold text-right text-sm ${
                      order.status === 'canceled' ? 'text-on-surface-variant line-through' : 'text-primary'
                    }`}>
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold text-[10px] uppercase border ${
                        order.status === 'completed'
                          ? 'bg-status-completed/10 text-status-completed border-status-completed/20'
                          : order.status === 'canceled'
                          ? 'bg-status-canceled/10 text-status-canceled border-status-canceled/20'
                          : 'bg-status-pending/10 text-status-pending border-status-pending/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          order.status === 'completed' ? 'bg-status-completed' : order.status === 'canceled' ? 'bg-status-canceled' : 'bg-status-pending'
                        }`}></span>
                        {order.status === 'completed' ? 'Completado' : order.status === 'canceled' ? 'Cancelado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-surface-container rounded transition-colors flex items-center justify-center mx-auto"
                        title="Ver Detalle"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal / Dialog de Detalles de Pedido (Diseño de Stitch) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-xl shadow-xl border border-border-subtle max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            
            {/* Header del Modal */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-border-subtle bg-surface">
              <div>
                <h3 className="font-bold text-on-surface text-sm">Pedido #{selectedOrder.id.slice(0, 8).toUpperCase()}</h3>
                <p className="text-[10px] text-on-surface-variant">Recibido el {new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              
              {/* Información del Cliente */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Datos del Comprador</span>
                <div className="p-4 bg-surface border border-border-subtle rounded-lg space-y-2">
                  <div className="flex justify-between"><span className="text-on-surface-variant">Nombre:</span> <span className="font-semibold text-on-surface">{selectedOrder.customer_name}</span></div>
                  <div className="flex justify-between"><span className="text-on-surface-variant">WhatsApp:</span> <span className="font-semibold text-on-surface">{selectedOrder.customer_phone}</span></div>
                </div>
              </div>

              {/* Detalle de Artículos */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Artículos Seleccionados</span>
                {loadingItems ? (
                  <div className="text-center py-6 text-[10px] text-on-surface-variant">Cargando productos...</div>
                ) : (
                  <div className="border border-border-subtle rounded-lg overflow-hidden divide-y divide-border-subtle bg-white">
                    {selectedOrderItems.map((item) => (
                      <div key={item.id} className="p-3.5 flex justify-between items-center gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-on-surface">{item.product_title}</div>
                          {item.selected_options.length > 0 && (
                            <div className="text-[9px] text-on-surface-variant mt-0.5 font-medium">
                              Variantes: {item.selected_options.map(o => o.value).join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-on-surface">{item.quantity}x</div>
                          <div className="text-[10px] text-on-surface-variant">{formatCurrency(item.price)} c/u</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desglose Económico */}
              <div className="space-y-2 border-t border-border-subtle pt-4">
                <div className="flex justify-between text-on-surface-variant"><span>Subtotal:</span> <span>{formatCurrency(selectedOrder.subtotal)}</span></div>
                <div className="flex justify-between text-on-surface-variant"><span>Envío:</span> <span>{formatCurrency(selectedOrder.shipping_price)}</span></div>
                <div className="flex justify-between font-bold text-on-surface text-sm border-t border-dashed border-border-subtle pt-2">
                  <span>Monto Total:</span> 
                  <span className={selectedOrder.status === 'canceled' ? 'line-through text-on-surface-variant' : ''}>
                    {formatCurrency(selectedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Estado Actual */}
              <div className="flex items-center justify-between border-t border-border-subtle pt-4">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Estado Logístico:</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold text-[10px] uppercase border ${
                  selectedOrder.status === 'completed'
                    ? 'bg-status-completed/10 text-status-completed border-status-completed/20'
                    : selectedOrder.status === 'canceled'
                    ? 'bg-status-canceled/10 text-status-canceled border-status-canceled/20'
                    : 'bg-status-pending/10 text-status-pending border-status-pending/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    selectedOrder.status === 'completed' ? 'bg-status-completed' : selectedOrder.status === 'canceled' ? 'bg-status-canceled' : 'bg-status-pending'
                  }`}></span>
                  {selectedOrder.status === 'completed' ? 'Completado' : selectedOrder.status === 'canceled' ? 'Cancelado' : 'Pendiente'}
                </span>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="px-6 py-4 bg-surface border-t border-border-subtle flex items-center justify-between gap-3">
              <a
                href={generateWhatsAppLink(selectedOrder, selectedOrderItems)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                <span>Enviar ticket a WhatsApp</span>
              </a>

              {selectedOrder.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'completed')}
                    className="p-2 border border-status-completed/20 text-status-completed hover:bg-status-completed/10 rounded-lg flex items-center justify-center h-10 w-10 transition-colors"
                    title="Marcar como Completado"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'canceled')}
                    className="p-2 border border-status-canceled/20 text-status-canceled hover:bg-status-canceled/10 rounded-lg flex items-center justify-center h-10 w-10 transition-colors"
                    title="Cancelar Pedido"
                  >
                    <span className="material-symbols-outlined">cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
