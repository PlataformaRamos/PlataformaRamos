import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getAdminStoreOrRedirect } from '@/lib/supabase/storeHelper'
import CustomersClient from './CustomersClient'

export const metadata: Metadata = {
  title: 'Directorio de Clientes',
}

export default async function CustomersPage() {
  const { store } = await getAdminStoreOrRedirect()
  const supabase = await createClient()

  // 1. Obtener listado inicial de clientes de la tienda
  const { data: rawCustomers } = await supabase
    .from('customers')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  // 2. Obtener listado de pedidos de la tienda para calcular métricas dinámicas de clientes
  const { data: rawOrders } = await supabase
    .from('orders')
    .select('id, customer_id, customer_phone, total, status, created_at')
    .eq('store_id', store.id)

  const orders = rawOrders || []
  
  // 3. Enriquecer los clientes con contadores de órdenes y total gastado
  const customers = (rawCustomers || []).map((cust) => {
    // Vincular pedidos por ID de cliente o por coincidencias en número de teléfono
    const custOrders = orders.filter(o => o.customer_id === cust.id || (o.customer_phone && o.customer_phone.trim() === cust.phone.trim()))
    const completedOrders = custOrders.filter(o => o.status === 'completed')
    const totalSpent = completedOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
    
    let lastOrderDate: string | null = null
    if (custOrders.length > 0) {
      const sorted = [...custOrders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      lastOrderDate = sorted[0].created_at
    }

    return {
      id: cust.id,
      name: cust.name,
      phone: cust.phone,
      email: cust.email,
      created_at: cust.created_at,
      orders_count: custOrders.length,
      total_spent: totalSpent,
      last_order_date: lastOrderDate
    }
  })

  return (
    <CustomersClient 
      store={store} 
      initialCustomers={customers} 
    />
  )
}
