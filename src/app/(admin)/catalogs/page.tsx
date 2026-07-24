import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getAdminStoreOrRedirect } from '@/lib/supabase/storeHelper'
import CatalogsClient from './CatalogsClient'

export const metadata: Metadata = {
  title: 'Mis Catálogos',
}

export default async function CatalogsPage() {
  const { store } = await getAdminStoreOrRedirect()
  const supabase = await createClient()

  // 1. Obtener Catálogos
  const { data: catalogs } = await supabase
    .from('catalogs')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  // 2. Obtener todos los Productos de la tienda para asignación
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, status')
    .eq('store_id', store.id)
    .order('position', { ascending: true })

  // 3. Obtener las relaciones catalog_products para los catálogos de esta tienda
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
