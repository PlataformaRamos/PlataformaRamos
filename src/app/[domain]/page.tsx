import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StorefrontClient from './StorefrontClient'
import StorefrontCatalogsClient from './StorefrontCatalogsClient'
import StoreSuspendedScreen from './StoreSuspendedScreen'

interface TenantPageProps {
  params: Promise<{ domain: string }>
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { domain } = await params
  const supabase = await createClient()

  // 1. Buscar la tienda sin filtrar por is_active para distinguir suspensión vs. 404
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .or(`slug.eq.${domain},custom_domain.eq.${domain}`)
    .single()

  // Si no existe la tienda en absoluto → 404
  if (!store) {
    notFound()
  }

  // Si la tienda existe pero está suspendida → pantalla premium de suspensión
  if (!store.is_active) {
    return <StoreSuspendedScreen storeName={store.name} />
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
