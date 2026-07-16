import React from 'react'
import { createClient } from '@/lib/supabase/server'
import MasterAdminClient from './MasterAdminClient'

export const dynamic = 'force-dynamic'

export default async function MasterPage() {
  const supabase = await createClient()

  // 1. Obtener todas las tiendas
  const { data: stores } = await supabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false })

  // 2. Obtener todos los perfiles de usuario
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // 3. Obtener todos los pedidos para estadísticas
  const { data: orders } = await supabase
    .from('orders')
    .select('id, total_amount, status, created_at')

  return (
    <MasterAdminClient 
      initialStores={stores || []} 
      initialProfiles={profiles || []}
      initialOrders={orders || []}
    />
  )
}
