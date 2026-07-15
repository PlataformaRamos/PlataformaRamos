import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()

  // 1. Obtener sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Intentar obtener tienda del usuario (dueño)
  let { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  // 3. Si no existe como dueño, buscar si es colaborador con rol admin para editar ajustes
  let isCollaborator = false
  let collaboratorRole = ''
  
  if (!store) {
    const { data: member } = await supabase
      .from('store_members')
      .select('store_id, role')
      .eq('email', user.email)
      .eq('status', 'active')
      .single()

    if (member) {
      isCollaborator = true
      collaboratorRole = member.role
      const { data: colabStore } = await supabase
        .from('stores')
        .select('*')
        .eq('id', member.store_id)
        .single()
      store = colabStore
    }
  }

  // 4. Si es un usuario nuevo sin ninguna tienda asociada, creamos una por defecto de inmediato (onboarding automático)
  if (!store && !isCollaborator) {
    const defaultSlug = `tienda-${user.email?.split('@')[0].replace(/[^a-z0-9]/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
    
    // Crear cliente administrativo de Supabase para saltar RLS en el INSERT
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Insertar tienda por defecto
    const { data: newStore, error } = await adminSupabase
      .from('stores')
      .insert({
        owner_id: user.id,
        name: 'Mi Nueva Tienda',
        slug: defaultSlug,
        whatsapp_phone: '+15551234567', // Teléfono dummy inicial
        currency_code: 'USD',
        template_name: 'minimal',
        theme_settings: {
          primaryColor: '#0F172A',
          accentColor: '#10B981',
          textColor: '#1E293B',
          backgroundColor: '#FFFFFF'
        }
      })
      .select()
      .single()

    if (error) {
      console.error('Error insertando tienda automática de onboarding:', error)
    }

    if (!error && newStore) {
      store = newStore
    }
  }

  // 5. Si de todos modos no hay tienda (por un error de inserción), redirigir
  if (!store) {
    redirect('/dashboard')
  }

  // 6. Obtener los colaboradores de la tienda activa
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
