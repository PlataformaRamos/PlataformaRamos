import React from 'react'
import { createClient } from '@/lib/supabase/server'
import StoresClient from './StoresClient'

export const dynamic = 'force-dynamic'

export default async function MasterStoresPage() {
  const supabase = await createClient()

  const { data: stores } = await supabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false })

  return <StoresClient initialStores={stores || []} />
}
