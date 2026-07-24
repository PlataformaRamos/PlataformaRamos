import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getAdminStoreOrRedirect } from '@/lib/supabase/storeHelper'
import ProductsClient from './ProductsClient'

export const metadata: Metadata = {
  title: 'Catálogo de Productos',
}

export default async function ProductsPage() {
  const { store } = await getAdminStoreOrRedirect()
  const supabase = await createClient()

  // 1. Obtener Categorías (ordenadas por posición)
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', store.id)
    .order('position', { ascending: true })

  // 2. Obtener Productos (ordenados por posición)
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .order('position', { ascending: true })

  // 3. Obtener Catálogos de la tienda
  const { data: catalogs } = await supabase
    .from('catalogs')
    .select('id, name')
    .eq('store_id', store.id)

  // 4. Obtener relaciones catalog_products de los productos de la tienda
  const productIds = (products || []).map((p) => p.id)
  let catalogRelations: any[] = []
  if (productIds.length > 0) {
    const { data: relations } = await supabase
      .from('catalog_products')
      .select('*')
      .in('product_id', productIds)
    catalogRelations = relations || []
  }

  return (
    <ProductsClient 
      store={store} 
      initialCategories={categories || []}
      initialProducts={products || []}
      catalogs={catalogs || []}
      initialRelations={catalogRelations}
    />
  )
}
