import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StorefrontClient from './StorefrontClient'
import StorefrontCatalogsClient from './StorefrontCatalogsClient'

interface TenantPageProps {
  params: Promise<{ domain: string }>
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { domain } = await params
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

  // 2. Obtener Catálogos activos de la tienda
  const { data: catalogs } = await supabase
    .from('catalogs')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)
    .order('is_default', { ascending: false })

  // Auto-redirección si solo hay un catálogo activo
  if (catalogs && catalogs.length === 1) {
    redirect(`/c/${catalogs[0].slug}`)
  }

  // 3. Obtener Categorías activas
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)
    .order('position', { ascending: true })

  // 4. Obtener Productos con sus Opciones y Valores de opciones
  const { data: products } = await supabase
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
    .order('position', { ascending: true })

  // 5. Obtener relaciones de catálogos para productos destacados
  const productIds = (products || []).map((p) => p.id)
  let catalogRelations: any[] = []
  if (productIds.length > 0) {
    const { data: relations } = await supabase
      .from('catalog_products')
      .select('*')
      .in('product_id', productIds)
    catalogRelations = relations || []
  }

  // 6. Obtener Reglas de envío activas
  const { data: shippingRules } = await supabase
    .from('shipping_rules')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)

  // Si hay múltiples catálogos activos, renderizar la pantalla menú
  if (catalogs && catalogs.length > 1) {
    return (
      <StorefrontCatalogsClient
        store={store}
        catalogs={catalogs}
        catalogRelations={catalogRelations}
        products={(products as any) || []}
      />
    )
  }

  return (
    <StorefrontClient 
      store={store}
      categories={categories || []}
      products={(products as any) || []}
      shippingRules={shippingRules || []}
    />
  )
}
