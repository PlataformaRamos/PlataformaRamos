import React from 'react'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import StoresClient from './StoresClient'

export const dynamic = 'force-dynamic'

export default async function MasterStoresPage() {
  // Crear cliente administrativo de Supabase (Bypass RLS)
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Obtener tiendas ordenadas
  const { data: stores } = await adminSupabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false })

  // Obtener usuarios de Supabase Auth para extraer sus correos de forma garantizada
  const { data: userData, error: authError } = await adminSupabase.auth.admin.listUsers()
  const users = userData?.users || []

  if (authError) {
    console.error('Error al cargar la lista de usuarios en MasterStoresPage:', authError)
  }

  // Cruzar las tiendas con el correo electrónico del propietario correspondiente
  const storesWithEmail = (stores || []).map((store) => {
    const owner = users.find((u) => u.id === store.owner_id)
    return {
      ...store,
      owner_email: owner ? owner.email || 'Sin email' : 'Sin email'
    }
  })

  return <StoresClient initialStores={storesWithEmail} />
}
