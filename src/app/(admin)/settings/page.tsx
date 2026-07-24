import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getAdminStoreOrRedirect } from '@/lib/supabase/storeHelper'
import SettingsClient from './SettingsClient'

export const metadata: Metadata = {
  title: 'Ajustes de la Tienda',
}

export default async function SettingsPage() {
  const { store, user } = await getAdminStoreOrRedirect()
  const supabase = await createClient()

  // 1. Determinar si el usuario actual es colaborador y obtener su rol
  const isCollaborator = store.owner_id !== user.id
  let collaboratorRole = ''

  if (isCollaborator && user.email) {
    const { data: member } = await supabase
      .from('store_members')
      .select('role')
      .eq('store_id', store.id)
      .eq('email', user.email)
      .eq('status', 'active')
      .maybeSingle()

    if (member) {
      collaboratorRole = member.role
    }
  }

  // 2. Obtener los colaboradores registrados en la tienda activa
  const { data: members } = await supabase
    .from('store_members')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: true })

  return (
    <SettingsClient 
      store={store} 
      members={members || []}
      isCollaborator={isCollaborator}
      collaboratorRole={collaboratorRole}
    />
  )
}
