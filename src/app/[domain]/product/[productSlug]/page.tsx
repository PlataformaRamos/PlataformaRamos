import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductDetailClient from './ProductDetailClient'

import type { Metadata } from 'next'

interface ProductPageProps {
  params: Promise<{
    domain: string
    productSlug: string
  }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { domain, productSlug } = await params
  const supabase = await createClient()
  const { data: store } = await supabase
    .from('stores')
    .select('id, name')
    .or(`slug.eq.${domain},custom_domain.eq.${domain}`)
    .single()

  if (!store) return { title: { absolute: 'Producto No Encontrado' } }

  const { data: product } = await supabase
    .from('products')
    .select('title, description, price')
    .eq('store_id', store.id)
    .eq('slug', productSlug)
    .single()

  if (!product) return { title: { absolute: 'Producto No Encontrado' } }

  return {
    title: {
      absolute: `${product.title} | ${store.name}`
    },
    description: product.description || `${product.title} disponible en ${store.name}`
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { domain, productSlug } = await params
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

  // 2. Obtener el producto específico por slug con sus opciones y variantes
  const { data: product } = await supabase
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
    .eq('slug', productSlug)
    .eq('store_id', store.id)
    .eq('is_available', true)
    .single()

  if (!product) {
    notFound()
  }

  // 3. Obtener categorías
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)

  // 4. Obtener reglas de envío
  const { data: shippingRules } = await supabase
    .from('shipping_rules')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)

  return (
    <ProductDetailClient
      store={store}
      product={product as any}
      categories={categories || []}
      shippingRules={shippingRules || []}
    />
  )
}
