import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CatalogViewClient from './CatalogViewClient'

interface CatalogPageProps {
  params: Promise<{ domain: string; catalogSlug: string }>
}

export default async function CatalogPage({ params }: CatalogPageProps) {
  const { domain, catalogSlug } = await params
  const supabase = await createClient()

  // 1. Obtener la tienda activa
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .or(`slug.eq.${domain},custom_domain.eq.${domain}`)
    .eq('is_active', true)
    .single()

  if (!store) {
    notFound()
  }

  // 2. Obtener el catálogo activo por su slug
  const { data: catalog } = await supabase
    .from('catalogs')
    .select('*')
    .eq('store_id', store.id)
    .eq('slug', catalogSlug)
    .eq('is_active', true)
    .single()

  if (!catalog) {
    notFound()
  }

  // 3. Obtener los IDs de productos asociados a este catálogo
  const { data: catalogRelations } = await supabase
    .from('catalog_products')
    .select('product_id')
    .eq('catalog_id', catalog.id)

  const productIds = (catalogRelations || []).map((r) => r.product_id)

  // 4. Obtener los productos que pertenecen al catálogo
  let products: any[] = []
  if (productIds.length > 0) {
    const { data: fetchedProducts } = await supabase
      .from('products')
      .select(`
        *,
        product_options (
          *,
          product_option_values (
            *
          )
        )
      `)
      .eq('store_id', store.id)
      .eq('is_available', true)
      .in('id', productIds)
      .order('position', { ascending: true })
    products = fetchedProducts || []
  }

  // 5. Obtener las categorías de la tienda (para clasificar los productos del catálogo)
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)
    .order('position', { ascending: true })

  // Filtrar categorías: solo conservar aquellas que tengan al menos un producto en este catálogo
  const activeCategoryIds = new Set(products.map((p) => p.category_id).filter(Boolean))
  const filteredCategories = (categories || []).filter((cat) => activeCategoryIds.has(cat.id))

  // 6. Obtener Reglas de envío activas
  const { data: shippingRules } = await supabase
    .from('shipping_rules')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)

  return (
    <CatalogViewClient
      store={store}
      catalog={catalog}
      categories={filteredCategories}
      products={products}
      shippingRules={shippingRules || []}
    />
  )
}
