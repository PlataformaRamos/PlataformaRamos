import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CatalogsClient from './CatalogsClient'

export default async function CatalogsPage() {
  const supabase = await createClient()

  // 1. Obtener sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Obtener tienda (dueño o colaborador)
  let { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!store) {
    const { data: member } = await supabase
      .from('store_members')
      .select('store_id')
      .eq('email', user.email)
      .eq('status', 'active')
      .single()

    if (member) {
      const { data: colabStore } = await supabase
        .from('stores')
        .select('*')
        .eq('id', member.store_id)
        .single()
      store = colabStore
    }
  }

  if (!store) {
    redirect('/dashboard')
  }

  // 3. Obtener Catálogos
  const { data: catalogs } = await supabase
    .from('catalogs')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  // 4. Obtener todos los Productos de la tienda para asignación
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, status')
    .eq('store_id', store.id)
    .order('position', { ascending: true })

  // 5. Obtener las relaciones catalog_products para los catálogos de esta tienda
  const catalogIds = (catalogs || []).map(c => c.id)
  let catalogRelations: any[] = []
  if (catalogIds.length > 0) {
    const { data: relations } = await supabase
      .from('catalog_products')
      .select('*')
      .in('catalog_id', catalogIds)
    catalogRelations = relations || []
  }

  return (
    <CatalogsClient 
      store={store} 
      initialCatalogs={catalogs || []}
      products={products || []}
      initialRelations={catalogRelations}
    />
  )
}
