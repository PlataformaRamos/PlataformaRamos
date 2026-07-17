import React from 'react'
import { createClient } from '@/lib/supabase/server'
import PaymentsClient from './PaymentsClient'

export const dynamic = 'force-dynamic'

export default async function MasterPaymentsPage() {
  const supabase = await createClient()

  // Historial de pagos de suscripción
  const { data: payments } = await supabase
    .from('subscription_payments')
    .select('*')
    .order('created_at', { ascending: false })

  // Tiendas para el selector al registrar un pago
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name, slug, plan_id, plan_expires_at')
    .order('name')

  return <PaymentsClient initialPayments={payments || []} initialStores={stores || []} />
}
