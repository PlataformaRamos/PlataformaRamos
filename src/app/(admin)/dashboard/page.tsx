import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getAdminStoreOrRedirect } from '@/lib/supabase/storeHelper'
import DashboardClient from './DashboardClient'

export const metadata: Metadata = {
  title: 'Panel de Control',
}

export default async function DashboardPage() {
  const { store } = await getAdminStoreOrRedirect()
  const supabase = await createClient()

  // 1. Consultar métricas iniciales
  // Pedidos totales
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', store.id)

  // Acumulado de ventas completadas
  const { data: salesData } = await supabase
    .from('orders')
    .select('total')
    .eq('store_id', store.id)
    .eq('status', 'completed')

  const totalSales = (salesData || []).reduce((acc, order) => acc + Number(order.total), 0)

  // Pedidos urgentes (pendientes)
  const { data: pendingOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', store.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  // 2. Consultar contadores del plan actual
  const { count: currentProductsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', store.id)

  const { data: plan } = await supabase
    .from('plans')
    .select('*')
    .eq('id', store.plan_id)
    .maybeSingle()

  return (
    <DashboardClient 
      store={store}
      initialMetrics={{
        totalSales,
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || [],
      }}
      planLimits={{
        currentProducts: currentProductsCount || 0,
        maxProducts: plan?.max_products || 20,
        planName: plan?.name || 'Plan Gratuito',
      }}
    />
  )
}
