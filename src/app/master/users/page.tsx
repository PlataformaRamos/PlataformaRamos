import React from 'react'
import { createClient } from '@/lib/supabase/server'
import UsersClient from './UsersClient'

export const dynamic = 'force-dynamic'

export default async function MasterUsersPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Obtener tiendas con su owner_id para poder hacer la relación
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name, slug, owner_id')

  return <UsersClient initialProfiles={profiles || []} initialStores={stores || []} />
}
