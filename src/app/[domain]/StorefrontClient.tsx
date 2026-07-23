'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Link } from 'next-view-transitions'
import { useCart } from '@/hooks/useCart'
import { useScrollLock } from '@/hooks/useScrollLock'
import { CartItem } from '@/contexts/CartContext'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { getOptimizedImageUrl } from '@/lib/cloudinary'
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  MessageSquare,
  MapPin,
  Clock,
  ChevronRight,
  X,
  CreditCard,
  Truck,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  LayoutGrid,
  List
} from 'lucide-react'

interface Value {
  id: string
  option_id: string
  value: string
  price_modifier: number
}

interface Option {
  id: string
  product_id: string
  name: string
  type: string
  is_required: boolean
  product_option_values: Value[]
}

interface Product {
  id: string
  title: string
  slug: string
  description: string | null
  price: number
  compare_at_price?: number | null
  images: string[]
  category_id: string | null
  is_active?: boolean
  stock_quantity?: number | null
  sku?: string | null
  product_options: Option[]
}

interface Category {
  id: string
  name: string
  slug: string
  is_active: boolean
}

interface ShippingRule {
  id: string
  name: string
  min_order_amount: number
  price: number
}

interface StorefrontClientProps {
  store: {
    id: string
    name: string
    slug: string
    whatsapp_phone: string
    currency_code: string
    theme_settings: any
    show_decimals: boolean
    collect_sales_tax: boolean
    sales_tax_rate: number
    payment_settings: any
    delivery_settings: any
    instagram_handle?: string | null
    contact_email?: string | null
    address_details?: string | null
    description?: string | null
    logo_url: string | null
  }
  categories: Category[]
  products: Product[]
  shippingRules: ShippingRule[]
}

export default function StorefrontClient({ store, categories, products, shippingRules }: StorefrontClientProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // Estados para ordenamiento y visualización de Kyte Storefront en Escritorio
  const [sortBy, setSortBy] = useState<'categories' | 'lowest' | 'highest' | 'az' | 'za'>('categories')
  const [viewLayout, setViewLayout] = useState<'instaview' | 'list'>('instaview')
  
  // Estado para el modal de variantes
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { valueId: string; valueName: string; priceModifier: number }>>({})
  
  // Vista del Carrito/Checkout
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutStep, setIsCheckoutStep] = useState(false)

  // Datos Checkout
  const [custName, setCustName] = useState('')
  const [custPhone, setCustPhone] = useState('')
  const [custAddress, setCustAddress] = useState('')
  
  // Carga de procesamiento
  const [processing, setProcessing] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  // Detección de host para enlaces limpios (evitar duplicar slug en subdominios)
  const [isSubdomain, setIsSubdomain] = useState(false)

  // Bloquear scroll del cuerpo cuando el carrito o modal de detalle de producto está abierto
  useScrollLock(isCartOpen || !!selectedProduct)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname
      const isBase = host === 'rutaslima.app' || host === 'www.rutaslima.app' || host === 'localhost'
      setIsSubdomain(!isBase)
    }
  }, [])

  const getProductLink = (productSlug: string) => {
    return isSubdomain ? `/product/${productSlug}` : `/${store.slug}/product/${productSlug}`
  }

  const cart = useCart()
  const { deliveryType, setDeliveryType, selectedShippingRuleId, setSelectedShippingRuleId } = cart
  const supabase = createClient()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Helper profesional: limpia ?cart=open de la URL sin recargar la página
  const cleanCartParam = useCallback(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('cart=open')) {
      const url = new URL(window.location.href)
      url.searchParams.delete('cart')
      // Si no quedan params, usar solo el pathname
      const cleanUrl = url.searchParams.toString()
        ? `${pathname}?${url.searchParams.toString()}`
        : pathname
      router.replace(cleanUrl, { scroll: false })
    }
  }, [pathname, router])

  // Función centralizada para cerrar el carrito
  const closeCart = useCallback(() => {
    setIsCartOpen(false)
    setIsCheckoutStep(false)
    cleanCartParam()
  }, [cleanCartParam])

  useEffect(() => {
    if (searchParams && searchParams.get('cart') === 'open') {
      setIsCartOpen(true)
      // Limpiar inmediatamente el param de la URL tras leerlo
      cleanCartParam()
    }
  }, [searchParams, cleanCartParam])

  // Sincronizar el primer método de envío si hay reglas
  useEffect(() => {
    if (shippingRules.length > 0) {
      setSelectedShippingRuleId(shippingRules[0].id)
    }
  }, [shippingRules])

  // Inicializar tipo de entrega según ajustes
  useEffect(() => {
    if (store.delivery_settings?.allow_pickup) {
      setDeliveryType('pickup')
    } else if (store.delivery_settings?.allow_delivery) {
      setDeliveryType('delivery')
    }
  }, [store])

  // Filtrado de productos
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategoryId === 'all' || prod.category_id === selectedCategoryId
    const matchesSearch = prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // Ordenar productos según el filtro de Stitch/Kyte
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'lowest') return Number(a.price) - Number(b.price)
    if (sortBy === 'highest') return Number(b.price) - Number(a.price)
    if (sortBy === 'az') return a.title.localeCompare(b.title)
    if (sortBy === 'za') return b.title.localeCompare(a.title)
    // 'categories' mantiene el ordenamiento natural de base de datos
    return 0
  })

  // Abrir modal de variantes o añadir directo si no tiene
  const handleProductClick = (prod: Product) => {
    if (prod.product_options && prod.product_options.length > 0) {
      setSelectedProduct(prod)
      setSelectedOptions({}) // Resetear selecciones
    } else {
      // Agregar directo al carrito
      cart.addItem({
        productId: prod.id,
        title: prod.title,
        price: Number(prod.price),
        image: prod.images[0] || null,
        selectedOptions: [],
        quantity: 1
      })
    }
  }

  // Guardar opción seleccionada en el modal de variantes
  const handleSelectOption = (optionId: string, optionName: string, value: Value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: {
        valueId: value.id,
        valueName: value.value,
        priceModifier: Number(value.price_modifier)
      }
    }))
  }

  // Confirmar y añadir al carrito desde el modal de variantes
  const handleAddWithVariants = () => {
    if (!selectedProduct) return

    // Validar requeridos
    const missingRequired = selectedProduct.product_options.some(
      (opt) => opt.is_required && !selectedOptions[opt.id]
    )

    if (missingRequired) {
      alert('Por favor selecciona las opciones obligatorias.')
      return
    }

    const optionsList = selectedProduct.product_options
      .filter((opt) => selectedOptions[opt.id])
      .map((opt) => ({
        optionId: opt.id,
        optionName: opt.name,
        valueId: selectedOptions[opt.id].valueId,
        valueName: selectedOptions[opt.id].valueName,
        priceModifier: selectedOptions[opt.id].priceModifier
      }))

    cart.addItem({
      productId: selectedProduct.id,
      title: selectedProduct.title,
      price: Number(selectedProduct.price),
      image: selectedProduct.images[0] || null,
      selectedOptions: optionsList,
      quantity: 1
    })

    setSelectedProduct(null)
  }

  // Precios formateados
  const formatPrice = (amount: number) => {
    const currency = store.currency_code || 'PEN'
    if (currency === 'PEN') {
      return `S/ ${amount.toFixed(2)}`
    }
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  // Cálculos Checkout
  const cartSubtotal = cart.getCartTotal()
  
  const currentShippingRule = shippingRules.find((r) => r.id === selectedShippingRuleId)
  const shippingCost = deliveryType === 'delivery' && currentShippingRule ? Number(currentShippingRule.price) : 0
  
  const taxCost = store.collect_sales_tax 
    ? (cartSubtotal * Number(store.sales_tax_rate) / 100)
    : 0

  const cartTotal = cartSubtotal + shippingCost + taxCost

  // Enviar pedido y WhatsApp
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!custName.trim() || !custPhone.trim()) return
    if (deliveryType === 'delivery' && !custAddress.trim()) {
      alert('Por favor indica tu dirección de entrega.')
      return
    }

    setProcessing(true)
    setCheckoutError(null)

    // Formatear teléfono para WhatsApp E.164 (asegurar prefijo +)
    let formattedPhone = custPhone.trim()
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone.replace(/\D/g, '')
    }

    try {
      // 1. Insertar/Actualizar Cliente en Supabase CRM
      const { data: customer, error: customerErr } = await supabase
        .from('customers')
        .upsert(
          {
            store_id: store.id,
            name: custName.trim(),
            phone: formattedPhone,
            address: deliveryType === 'delivery' ? custAddress.trim() : null
          },
          { onConflict: 'store_id,phone' }
        )
        .select()
        .single()

      if (customerErr) throw new Error(customerErr.message)

      // 2. Insertar Orden en Supabase
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          store_id: store.id,
          customer_id: customer.id,
          customer_name: custName.trim(),
          customer_phone: formattedPhone,
          shipping_rule_id: deliveryType === 'delivery' ? selectedShippingRuleId : null,
          shipping_price: shippingCost,
          subtotal: cartSubtotal,
          total: cartTotal,
          status: 'pending'
        })
        .select()
        .single()

      if (orderErr) throw new Error(orderErr.message)

      // 3. Insertar Artículos del pedido en order_items
      const orderItemsInsert = cart.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_title: item.title,
        price: item.price,
        quantity: item.quantity,
        selected_options: item.selectedOptions
      }))

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(orderItemsInsert)

      if (itemsErr) throw new Error(itemsErr.message)

      // 4. Invocar el formateador dinámico del contexto con la validación anti-tampering integrada
      const { url } = await cart.generateWhatsAppMessage(store, shippingRules, {
        name: custName.trim(),
        phone: formattedPhone,
        address: deliveryType === 'delivery' ? custAddress.trim() : undefined
      })

      // 5. Redireccionar al WhatsApp del vendedor con el ticket formateado
      window.location.href = url
      
    } catch (err: any) {
      setCheckoutError(err.message || 'Error al procesar el pedido. Intente nuevamente.')
      setProcessing(false)
    }
  }

  // Calcular precio en vivo del modal de variantes
  const getLiveModalPrice = () => {
    if (!selectedProduct) return 0
    const modifiersTotal = Object.values(selectedOptions).reduce((acc, opt) => acc + opt.priceModifier, 0)
    return Number(selectedProduct.price) + modifiersTotal
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ '--tenant-primary': store.theme_settings?.primaryColor || '#3B82F6' } as React.CSSProperties}>
      {/* BARRA PROMOCIONAL SUPERIOR (TOP ANNOUNCEMENT BAR) */}
      <div className="bg-[var(--tenant-primary)] text-white text-[11px] font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 overflow-hidden shadow-xs">
        <span>{store.theme_settings?.promoText || '🎉 ¡Bienvenido a nuestra tienda! Haz tus pedidos en línea y recíbelos por WhatsApp.'}</span>
      </div>

      {/* 1. DISEÑO MÓVIL PREMIUM */}
      <div className="md:hidden flex-1 flex flex-col w-full bg-white min-h-screen relative pb-24">
        
        {/* HEADER COMPACTO MÓVIL — Glassmorphism sticky */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100/80 shadow-sm">
          <div className="flex items-center justify-between px-4 h-14">
            {/* Logo + Nombre (Cliqueable) */}
            <Link href="/" className="flex items-center gap-2.5 min-w-0 hover:opacity-90 active:scale-95 transition-all">
              <div className="w-9 h-9 rounded-full bg-[var(--tenant-primary)] overflow-hidden shadow-sm border-2 border-white flex items-center justify-center flex-shrink-0">
                {store.logo_url ? (
                  <img src={getOptimizedImageUrl(store.logo_url, { width: 80, height: 80 })} alt={store.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-black text-sm">{store.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight truncate">{store.name}</h1>
            </Link>

            {/* Acciones: Búsqueda + Carrito */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setSearchQuery(searchQuery ? '' : ' ')}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                id="btn-carrito-header-mobile"
                data-testid="carrito-header-mobile"
                onClick={() => {
                  if (cart.items.length > 0) {
                    setIsCartOpen(true)
                    setIsCheckoutStep(false)
                  }
                }}
                className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {cart.items.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[var(--tenant-primary)] text-white rounded-full flex items-center justify-center text-[10px] font-black animate-in zoom-in duration-200">
                    {cart.items.reduce((acc, i) => acc + i.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Buscador expandible */}
          {searchQuery !== '' && (
            <div className="px-4 pb-3 animate-in slide-in-from-top duration-200">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery === ' ' ? '' : searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value || ' ')}
                  placeholder="Buscar productos..."
                  className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)] focus:border-transparent text-sm bg-slate-50/80"
                />
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </header>

        {/* BANNER HERO PROMO MÓVIL */}
        <div className="p-3 pb-1">
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white p-4 shadow-md border border-slate-800 flex flex-col justify-between min-h-[140px]">
            {store.theme_settings?.bannerUrl ? (
              <>
                <img
                  src={store.theme_settings.bannerUrl}
                  alt={store.name}
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-950/40 z-0" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 z-0" />
            )}

            <div className="relative z-10 flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden flex items-center justify-center font-black text-xs">
                  {store.logo_url ? (
                    <img src={getOptimizedImageUrl(store.logo_url, { width: 60, height: 60 })} alt={store.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{store.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-[11px] font-extrabold tracking-wide uppercase text-slate-300 truncate max-w-[150px]">{store.name}</span>
              </div>
              <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-2 py-0.5 text-[9px] font-bold text-emerald-300 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Abierto</span>
              </div>
            </div>

            <div className="relative z-10 space-y-1">
              <h2 className="text-sm font-black tracking-tight leading-tight text-white line-clamp-1">
                {store.theme_settings?.bannerTitle || store.name}
              </h2>
              <p className="text-[10px] text-slate-300 font-medium leading-snug line-clamp-2">
                {store.theme_settings?.bannerSubtitle || store.description || 'Explora nuestras mejores ofertas con envío rápido y atención directa.'}
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-1.5 pt-2 text-[9px] font-bold text-slate-300 border-t border-white/10 mt-2">
              <span className="bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-xs">⚡ Envíos Rápidos</span>
              <span className="bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-xs">📱 Pedidos por WhatsApp</span>
            </div>
          </div>
        </div>

        {/* CATEGORÍAS — Pills horizontales con gradient fade */}
        <div className="sticky top-14 bg-white/95 backdrop-blur-md z-20 border-b border-slate-100/60">
          <div className="relative">
            {/* Gradient fade en los bordes */}
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            
            <div className="flex gap-2 overflow-x-auto py-3 px-5 no-scrollbar">
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0 ${
                  selectedCategoryId === 'all'
                    ? 'bg-[var(--tenant-primary)] border-transparent text-white shadow-md scale-[1.02]'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                ✨ Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0 ${
                    selectedCategoryId === cat.id
                      ? 'bg-[var(--tenant-primary)] border-transparent text-white shadow-md scale-[1.02]'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* GRID DE PRODUCTOS MÓVIL — 2 Columnas estilo Shopify */}
        <main className="p-3 flex-1">
          {sortedProducts.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <div className="font-bold text-sm text-slate-700">Sin productos disponibles</div>
              <p className="text-xs text-slate-500 mt-1.5">Intenta otra búsqueda o categoría.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {sortedProducts.map((prod, index) => (
                <Link 
                  key={prod.id} 
                  href={getProductLink(prod.slug)}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Imagen cuadrada */}
                  <div className="relative aspect-square bg-slate-50 overflow-hidden">
                    {prod.images[0] ? (
                      <img
                        src={getOptimizedImageUrl(prod.images[0], { width: 300, height: 300 })}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                    {/* Botón + superpuesto */}
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleProductClick(prod)
                      }}
                      className="absolute bottom-2 right-2 w-8 h-8 bg-[var(--tenant-primary)] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Info del producto */}
                  <div className="p-3 flex flex-col gap-1 flex-1">
                    <h3 className="font-bold text-slate-800 text-[13px] leading-tight line-clamp-2 group-hover:text-[var(--tenant-primary)] transition-colors">
                      {prod.title}
                    </h3>
                    {prod.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 leading-snug">
                        {prod.description}
                      </p>
                    )}
                    <span className="font-black text-slate-900 text-sm mt-auto pt-1">
                      {formatPrice(prod.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

                  {/* 2. DISEÑO DE ESCRITORIO PREMIUM */}
      <div className="hidden md:flex flex-col flex-1 min-h-screen bg-slate-50/50">
        {/* Cabecera Superior con Backdrop Blur */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-16 flex items-center px-12 justify-between z-30 shadow-sm">
          {/* Logo + Nombre (Cliqueable) */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 active:scale-95 transition-all">
            {store.logo_url ? (
              <img
                src={getOptimizedImageUrl(store.logo_url, { width: 100, height: 100 })}
                alt={store.name}
                className="w-9 h-9 rounded-xl object-cover border border-slate-100 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-[var(--tenant-primary)] flex items-center justify-center text-white font-black text-sm shadow-sm flex-shrink-0">
                {store.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h1 className="text-lg font-black tracking-tight text-slate-800 uppercase">
              {store.name}
            </h1>
          </Link>

          {/* Caja de Búsqueda Centrada */}
          <div className="relative w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery === ' ' ? '' : searchQuery}
              onChange={(e) => setSearchQuery(e.target.value || ' ')}
              placeholder="Buscar productos en el catálogo..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)]/20 focus:border-[var(--tenant-primary)] text-sm bg-slate-50/50 hover:bg-slate-50 transition-colors"
            />
          </div>

          {/* Carrito de Compra */}
          <div className="flex items-center gap-4">
            <button
              id="btn-carrito-header-desktop"
              data-testid="carrito-header-desktop"
              onClick={() => {
                if (cart.items.length > 0) {
                  setIsCartOpen(true)
                  setIsCheckoutStep(false)
                }
              }}
              className="relative px-4 py-2 bg-[var(--tenant-primary)] text-white font-extrabold text-xs rounded-full shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Carrito ({cart.items.reduce((acc, i) => acc + i.quantity, 0)})</span>
            </button>
          </div>
        </header>

        {/* Anuncio Marquee Superior */}
        <div className="w-full h-9 bg-[var(--tenant-primary)] text-white flex items-center overflow-hidden relative z-10">
          <div className="flex w-max animate-[marquee_25s_linear_infinite] whitespace-nowrap gap-8">
            <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
              <span>⚡ ¡Haz tu pedido rápido y directo a nuestro WhatsApp!</span>
              <span>✦</span>
              <span>📦 Envíos a domicilio y retiro en tienda local</span>
              <span>✦</span>
              <span>💵 Pago fácil coordinado al instante</span>
              <span>✦</span>
              <span>💬 Soporte y atención al cliente garantizado</span>
            </div>
            {/* Copia duplicada para scroll infinito */}
            <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-wider" aria-hidden="true">
              <span>⚡ ¡Haz tu pedido rápido y directo a nuestro WhatsApp!</span>
              <span>✦</span>
              <span>📦 Envíos a domicilio y retiro en tienda local</span>
              <span>✦</span>
              <span>💵 Pago fácil coordinado al instante</span>
              <span>✦</span>
              <span>💬 Soporte y atención al cliente garantizado</span>
            </div>
          </div>
        </div>

        {/* Barra de Filtros e Inline Categorías (Reemplaza Sidebar) */}
        <div className="bg-white border-b border-slate-100 py-4 px-12">
          <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Categorías Inline */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategoryId === 'all'
                    ? 'bg-slate-900 border-transparent text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                ✨ Todos los productos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedCategoryId === cat.id
                      ? 'bg-slate-900 border-transparent text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Controles de Vista y Orden */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Selector de Orden */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)]/20"
                >
                  <option value="categories">Por Categoría</option>
                  <option value="lowest">Menor precio</option>
                  <option value="highest">Mayor precio</option>
                  <option value="az">Nombre A-Z</option>
                  <option value="za">Nombre Z-A</option>
                </select>
              </div>

              {/* Selector de Layout */}
              <div className="flex border border-slate-200 rounded-xl overflow-hidden p-0.5 bg-slate-50">
                <button 
                  onClick={() => setViewLayout('instaview')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewLayout === 'instaview' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Cuadrícula"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewLayout('list')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewLayout === 'list' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Lista"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido Principal con Sidebar Kyte en Escritorio */}
        <div className="flex-grow max-w-7xl w-full mx-auto px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* COLUMNA IZQUIERDA: SIDEBAR KYTE STYLE */}
            <aside className="hidden lg:flex lg:col-span-3 flex-col space-y-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs h-fit sticky top-24">
              
              {/* Categorías */}
              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-sm tracking-tight uppercase">Categorías</h3>
                <div className="space-y-1 text-xs font-bold text-slate-600">
                  <button
                    onClick={() => setSelectedCategoryId('all')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left ${
                      selectedCategoryId === 'all'
                        ? 'text-[var(--tenant-primary)] bg-blue-50/80 font-black'
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <CheckCircle className={`w-4 h-4 ${selectedCategoryId === 'all' ? 'text-[var(--tenant-primary)] opacity-100' : 'opacity-0'}`} />
                    <span>Todo</span>
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left ${
                        selectedCategoryId === cat.id
                          ? 'text-[var(--tenant-primary)] bg-blue-50/80 font-black'
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <CheckCircle className={`w-4 h-4 ${selectedCategoryId === cat.id ? 'text-[var(--tenant-primary)] opacity-100' : 'opacity-0'}`} />
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ordenar por */}
              <div className="space-y-3 pt-5 border-t border-slate-100">
                <h3 className="font-black text-slate-900 text-sm tracking-tight uppercase">Ordenar por</h3>
                <div className="space-y-1 text-xs font-bold text-slate-600">
                  {[
                    { id: 'categories', label: 'Categorías' },
                    { id: 'lowest', label: 'Menor precio' },
                    { id: 'highest', label: 'Mayor precio' },
                    { id: 'az', label: 'Nombre A-Z' },
                    { id: 'za', label: 'Nombre Z-A' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSortBy(item.id as any)}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all text-left ${
                        sortBy === item.id
                          ? 'text-[var(--tenant-primary)] font-black'
                          : 'hover:bg-slate-50 text-slate-500'
                      }`}
                    >
                      <CheckCircle className={`w-3.5 h-3.5 ${sortBy === item.id ? 'text-[var(--tenant-primary)] opacity-100' : 'opacity-0'}`} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modo de Exhibición */}
              <div className="space-y-3 pt-5 border-t border-slate-100">
                <h3 className="font-black text-slate-900 text-sm tracking-tight uppercase">Modo de exhibición</h3>
                <div className="space-y-1.5 text-xs font-bold text-slate-600">
                  <button
                    onClick={() => setViewLayout('instaview')}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all ${
                      viewLayout === 'instaview'
                        ? 'text-[var(--tenant-primary)] bg-blue-50/80 font-black border border-blue-200/50'
                        : 'hover:bg-slate-50 text-slate-500 border border-transparent'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>Instaview (Cuadrícula)</span>
                  </button>

                  <button
                    onClick={() => setViewLayout('list')}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all ${
                      viewLayout === 'list'
                        ? 'text-[var(--tenant-primary)] bg-blue-50/80 font-black border border-blue-200/50'
                        : 'hover:bg-slate-50 text-slate-500 border border-transparent'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span>Lista</span>
                  </button>
                </div>
              </div>

              {/* Información del Comercio */}
              <div className="space-y-3 pt-6 border-t border-slate-100 text-xs text-slate-600 font-medium">
                <h3 className="font-black text-slate-900 text-sm tracking-tight uppercase">Información del comercio</h3>
                
                {store.whatsapp_phone && (
                  <a href={`https://wa.me/${store.whatsapp_phone.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-emerald-600 transition-colors py-1">
                    <MessageSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="font-bold">{store.whatsapp_phone}</span>
                  </a>
                )}

                {store.contact_email && (
                  <div className="flex items-center gap-2.5 py-1">
                    <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{store.contact_email}</span>
                  </div>
                )}

                {store.instagram_handle && (
                  <div className="flex items-center gap-2.5 py-1">
                    <Phone className="w-4 h-4 text-pink-500 flex-shrink-0" />
                    <span>@{store.instagram_handle.replace('@', '')}</span>
                  </div>
                )}

                {store.address_details && (
                  <div className="flex items-start gap-2.5 py-1">
                    <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{store.address_details}</span>
                  </div>
                )}

                {store.description && (
                  <p className="text-[11px] text-slate-400 italic pt-2 leading-relaxed border-t border-slate-100">
                    "{store.description}"
                  </p>
                )}
              </div>
            </aside>

            {/* COLUMNA DERECHA: PRODUCTOS */}
            <main className="col-span-12 lg:col-span-9 flex flex-col min-h-[400px]">
              <div className="mb-6 flex justify-between items-center bg-white border border-slate-100 rounded-2xl px-6 py-4 shadow-xs">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>{selectedCategoryId === 'all' ? 'Todo los productos' : categories.find(c => c.id === selectedCategoryId)?.name || 'Catálogo'}</span>
                </h2>
                <span className="text-xs text-slate-500 font-bold uppercase bg-slate-100 px-3 py-1 rounded-full">
                  {sortedProducts.length} {sortedProducts.length === 1 ? 'artículo' : 'artículos'}
                </span>
              </div>

              {sortedProducts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto bg-white border border-slate-100 rounded-3xl">
                  <ShoppingBag className="w-16 h-16 text-slate-200 mb-4 animate-bounce" />
                  <h3 className="text-lg font-bold text-slate-800">No encontramos productos</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Prueba seleccionando otra categoría o modificando los términos de búsqueda.
                  </p>
                </div>
              ) : viewLayout === 'instaview' ? (
                /* Grid Kyte / Instaview de 3 a 4 columnas */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {sortedProducts.map((prod, index) => {
                    const categoryName = categories.find(c => c.id === prod.category_id)?.name
                    const isOutOfStock = prod.is_active === false || (prod.stock_quantity !== undefined && prod.stock_quantity !== null && prod.stock_quantity <= 0)
                    const hasDiscount = prod.compare_at_price && prod.compare_at_price > prod.price
                    const discountPercent = hasDiscount ? Math.round(((prod.compare_at_price! - prod.price) / prod.compare_at_price!) * 100) : 0

                    return (
                      <Link 
                        key={prod.id}
                        href={getProductLink(prod.slug)}
                        className="border border-slate-100 rounded-3xl bg-white overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        <div>
                          {/* Contenedor de Imagen con Badges e Icono Flotante + */}
                          <div className="w-full aspect-square relative bg-slate-50 overflow-hidden border-b border-slate-100">
                            {prod.images[0] ? (
                              <img 
                                src={getOptimizedImageUrl(prod.images[0], { width: 400, height: 400 })} 
                                alt={prod.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                                <ShoppingBag className="w-10 h-10" />
                              </div>
                            )}

                            {/* Badge Descuento e.g. 8% OFF */}
                            {hasDiscount && (
                              <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">
                                {discountPercent}% OFF
                              </span>
                            )}

                            {/* Badge Agotado */}
                            {isOutOfStock && (
                              <span className="absolute inset-x-0 bottom-0 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black py-1.5 text-center uppercase tracking-widest">
                                AGOTADO
                              </span>
                            )}

                            {/* Botón Circular Flotante + (Kyte Style) */}
                            {!isOutOfStock && (
                              <button 
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleProductClick(prod)
                                }}
                                className="absolute bottom-3 right-3 w-9 h-9 bg-[var(--tenant-primary)] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-10"
                                title="Agregar al Carrito"
                              >
                                <Plus className="w-5 h-5 stroke-[2.5]" />
                              </button>
                            )}
                          </div>

                          {/* Info del Producto */}
                          <div className="p-4 space-y-1.5">
                            <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400 font-bold">
                              {categoryName && (
                                <span className="text-slate-500 truncate">{categoryName}</span>
                              )}
                              <span className="ml-auto font-mono text-[10px] text-slate-400">COD: {prod.sku || prod.id.slice(0, 5)}</span>
                            </div>

                            <h4 className="font-extrabold text-slate-900 group-hover:text-[var(--tenant-primary)] transition-colors text-sm leading-snug line-clamp-2">
                              ⭐ {prod.title}
                            </h4>

                            {prod.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                {prod.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Precios y Acción */}
                        <div className="p-4 pt-0 flex justify-between items-baseline mt-auto">
                          <div className="flex items-baseline gap-2">
                            <span className="font-black text-slate-900 text-base">{formatPrice(prod.price)}</span>
                            {hasDiscount && (
                              <del className="text-slate-400 font-bold line-through text-xs">{formatPrice(prod.compare_at_price!)}</del>
                            )}
                          </div>

                          <button 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleProductClick(prod)
                            }}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-[var(--tenant-primary)] text-white rounded-xl text-[11px] font-extrabold uppercase transition-all shadow-xs"
                          >
                            Añadir
                          </button>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                /* Lista Kyte Style */
                <div className="space-y-4 w-full">
                  {sortedProducts.map((prod, index) => {
                    const categoryName = categories.find(c => c.id === prod.category_id)?.name
                    const isOutOfStock = prod.is_active === false || (prod.stock_quantity !== undefined && prod.stock_quantity !== null && prod.stock_quantity <= 0)
                    const hasDiscount = prod.compare_at_price && prod.compare_at_price > prod.price

                    return (
                      <Link 
                        key={prod.id}
                        href={getProductLink(prod.slug)}
                        className="border border-slate-100 rounded-2xl bg-white p-4 hover:shadow-lg transition-all duration-300 flex items-center gap-4 justify-between group"
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100">
                            {prod.images[0] ? (
                              <img 
                                src={getOptimizedImageUrl(prod.images[0], { width: 150, height: 150 })} 
                                alt={prod.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <ShoppingBag className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                              {categoryName && <span>{categoryName}</span>}
                              <span>COD: {prod.sku || prod.id.slice(0, 5)}</span>
                            </div>
                            <h4 className="font-bold text-slate-900 group-hover:text-[var(--tenant-primary)] transition-colors text-sm leading-tight line-clamp-1">
                              ⭐ {prod.title}
                            </h4>
                            {prod.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-1 leading-normal">
                                {prod.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <span className="font-black text-slate-900 text-sm block">{formatPrice(prod.price)}</span>
                            {hasDiscount && (
                              <del className="text-slate-400 font-bold line-through text-[10px]">{formatPrice(prod.compare_at_price!)}</del>
                            )}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleProductClick(prod)
                            }}
                            className="px-4 py-2 bg-slate-900 hover:bg-[var(--tenant-primary)] text-white rounded-xl text-[11px] font-extrabold uppercase transition-all shadow-xs"
                          >
                            Añadir
                          </button>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Pie de Página Profesional de 3 Columnas */}
        <footer className="bg-slate-900 text-slate-300 py-12 mt-auto border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Columna 1: Tienda */}
            <div className="space-y-4">
              <h3 className="text-white font-black uppercase tracking-wider text-sm">{store.name}</h3>
              <p className="text-xs leading-relaxed text-slate-400">
                Tu catálogo favorito en línea. Elige tus productos, personaliza tus variantes y envía tu orden directamente a nuestro WhatsApp.
              </p>
            </div>

            {/* Columna 2: Contacto Dinámico */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Contacto</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <a href={`https://wa.me/${store.whatsapp_phone.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    {store.whatsapp_phone}
                  </a>
                </li>
                {store.contact_email && (
                  <li className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <a href={`mailto:${store.contact_email}`} className="hover:text-white transition-colors">
                      {store.contact_email}
                    </a>
                  </li>
                )}
                {store.instagram_handle && (
                  <li className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                    <a href={`https://instagram.com/${store.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                      {store.instagram_handle}
                    </a>
                  </li>
                )}
                {store.address_details && (
                  <li className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-400 leading-snug">{store.address_details}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Columna 3: Información Legal */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Aviso Legal</h4>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Evita fraudes y estafas. No realices depósitos adelantados a vendedores que no conozcas. El vendedor es responsable exclusivo de los artículos publicados.
              </p>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                Desarrollado por <span className="text-[var(--tenant-primary)] font-bold">Plataforma Ramos</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Botón Flotante Global de WhatsApp con Animación de Pulso */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center justify-center">
        <span className="absolute inline-flex h-14 w-14 rounded-full bg-emerald-500 opacity-60 animate-ping"></span>
        <a 
          href={`https://api.whatsapp.com/send?phone=${store.whatsapp_phone.replace('+', '')}&text=Hola,%20quisiera%20hacer%20una%20consulta.`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative h-14 w-14 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
          title="Consúltanos por WhatsApp"
        >
          <svg viewBox="0 0 32 32" fill="currentColor" className="h-7 w-7">
            <path d="M19.11 17.22c-.27-.14-1.59-.78-1.84-.87-.25-.09-.43-.14-.61.14-.18.27-.7.86-.86 1.04-.16.18-.32.2-.59.07-.27-.14-1.15-.42-2.2-1.35-.81-.72-1.36-1.61-1.52-1.88-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27 0 1.34.98 2.64 1.11 2.82.14.18 1.93 2.95 4.69 4.13.66.28 1.17.45 1.57.58.66.21 1.26.18 1.73.11.53-.08 1.59-.65 1.82-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"></path>
            <path d="M16.03 2.67c-7.16 0-12.98 5.82-12.98 12.98 0 2.29.61 4.53 1.77 6.51L3 29.33l7.35-1.92c1.91 1.05 4.06 1.6 6.26 1.6h.01c7.16 0 12.98-5.82 12.98-12.98 0-3.47-1.35-6.73-3.8-9.18-2.45-2.45-5.71-3.8-9.18-3.8zm0 23.99h-.01c-1.95 0-3.86-.52-5.53-1.51l-.4-.24-4.36 1.14 1.16-4.25-.26-.43c-1.07-1.72-1.64-3.71-1.64-5.76 0-6.12 4.98-11.1 11.1-11.1 2.97 0 5.76 1.15 7.86 3.25 2.1 2.1 3.25 4.89 3.25 7.86 0 6.12-4.98 11.1-11.1 11.1z"></path>
          </svg>
        </a>
      </div>

      {/* 4. BARRA FLOTANTE CARRITO */}
      {cart.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-xl z-30 max-w-md mx-auto">
          <Button
            id="btn-ver-carrito-flotante"
            data-testid="ver-carrito-flotante"
            onClick={() => {
              setIsCartOpen(true)
              setIsCheckoutStep(false)
            }}
            className="w-full bg-[var(--tenant-primary)] hover:opacity-90 text-white font-bold py-3 rounded-xl flex items-center justify-between px-6 shadow-md"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full font-bold">
                {cart.items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>
            <span className="text-sm">Ver Carrito</span>
            <span className="text-sm font-black">{formatPrice(cartSubtotal)}</span>
          </Button>
        </div>
      )}

      {/* 5. MODAL / BOTTOM SHEET DE OPCIONES DE PRODUCTO */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="fixed inset-0 bg-transparent touch-none" onClick={() => setSelectedProduct(null)} onTouchMove={(e) => e.preventDefault()} />
          <div className="relative bg-white w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-2xl flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 shadow-2xl overflow-hidden z-10">
            {/* Tirador táctil visual para teléfonos */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2 sm:hidden flex-shrink-0" />
            
            {/* Cabecera */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{selectedProduct.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Selecciona tus preferencias</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Listado de Opciones */}
            <div className="p-5 overflow-y-auto overscroll-contain flex-1 space-y-6">
              {selectedProduct.product_options.map((opt) => (
                <div key={opt.id} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">{opt.name}</span>
                    {opt.is_required && (
                      <span className="text-[10px] bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full font-bold uppercase">
                        Obligatorio
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {opt.product_option_values.map((val) => {
                      const isSelected = selectedOptions[opt.id]?.valueId === val.id
                      return (
                        <div
                          key={val.id}
                          onClick={() => handleSelectOption(opt.id, opt.name, val)}
                          className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-[var(--tenant-primary)] bg-[var(--tenant-primary)]/5 font-bold' 
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <span className="text-sm text-slate-800">{val.value}</span>
                          <span className="text-xs text-slate-500 font-bold">
                            {Number(val.price_modifier) > 0 ? `+ ${formatPrice(val.price_modifier)}` : 'Gratis'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Producto</span>
                <span className="font-extrabold text-slate-900 text-lg">{formatPrice(getLiveModalPrice())}</span>
              </div>
              <Button
                onClick={handleAddWithVariants}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs gap-1.5 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Agregar al Carrito</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6. DRAWER DE CARRITO & CHECKOUT */}
      {isCartOpen && (
        <div className="fixed inset-0 z-40 flex justify-center bg-black/60">
          <div className="fixed inset-0 bg-transparent" onClick={closeCart} />
          <div className="relative bg-white w-full max-w-md h-full flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
            
            {/* Cabecera */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-black text-slate-900 text-base">
                {isCheckoutStep ? 'Datos de tu Pedido' : 'Tu Carrito'}
              </h3>
              <button 
                onClick={() => {
                  if (isCheckoutStep) {
                    setIsCheckoutStep(false)
                  } else {
                    closeCart()
                  }
                }} 
                className="p-1 rounded-full text-slate-400 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BARRA DE PROGRESO DE ENVÍO GRATIS */}
            {!isCheckoutStep && shippingRules.length > 0 && (
              (() => {
                const freeRule = shippingRules.find((r) => Number(r.price) === 0 || Number(r.min_order_amount) > 0)
                const minThreshold = freeRule ? Number(freeRule.min_order_amount) : 0
                if (minThreshold <= 0) return null

                const needed = Math.max(0, minThreshold - cartSubtotal)
                const progress = Math.min(100, Math.round((cartSubtotal / minThreshold) * 100))

                return (
                  <div className="bg-slate-900 text-white p-3.5 border-b border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Truck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {needed > 0 ? (
                        <span>Agrega <span className="text-emerald-400 font-extrabold">{formatPrice(needed)}</span> más para <span className="text-emerald-400 font-extrabold">ENVÍO GRATIS</span></span>
                      ) : (
                        <span className="text-emerald-400 font-extrabold">¡Felicidades! Tienes ENVÍO GRATIS</span>
                      )}
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )
              })()
            )}

            {/* CONTENIDO 1: RESUMEN DE ARTÍCULOS EN CARRITO */}
            {!isCheckoutStep && (
              <div className="flex-1 flex flex-col overflow-y-auto">
                {cart.items.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 text-center">
                    <ShoppingBag className="w-12 h-12 text-slate-200 mb-2" />
                    <span className="font-bold text-sm text-slate-700">Carrito Vacío</span>
                    <p className="text-xs text-slate-500 mt-1">Agrega productos del catálogo para continuar.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 divide-y divide-slate-100 overflow-y-auto px-5">
                      {cart.items.map((item) => (
                        <div key={item.id} className="py-4 flex justify-between items-center gap-4">
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-slate-900 text-sm block truncate">{item.title}</span>
                            {item.selectedOptions.length > 0 && (
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {item.selectedOptions.map(o => o.valueName).join(', ')}
                              </p>
                            )}
                            <span className="font-extrabold text-slate-800 text-xs block mt-1">
                              {formatPrice(item.singleItemPrice * item.quantity)}
                            </span>
                          </div>

                          {/* Sumar / Restar Unidades */}
                          <div className="flex items-center border border-slate-200 rounded-lg flex-shrink-0 bg-slate-50/50">
                            <button
                              onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-l-lg"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                            <button
                              onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-r-lg"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer del Carrito */}
                    <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-bold">Subtotal de Compra:</span>
                        <span className="font-black text-slate-900 text-base">{formatPrice(cartSubtotal)}</span>
                      </div>
                      <Button
                        id="btn-continuar-checkout"
                        data-testid="continuar-checkout"
                        onClick={() => setIsCheckoutStep(true)}
                        className="w-full bg-[var(--tenant-primary)] hover:opacity-90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1 shadow-md"
                      >
                        <span>Continuar al Checkout</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* CONTENIDO 2: FORMULARIO DE CHECKOUT */}
            {isCheckoutStep && (
              <form onSubmit={handleCheckoutSubmit} className="flex-1 flex flex-col overflow-y-auto">
                <div className="flex-1 p-5 overflow-y-auto space-y-5">
                  
                  {/* Datos de Contacto */}
                  <div className="space-y-3">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Tus Datos</span>
                    
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Tu Nombre Completo</label>
                      <input
                        id="input-customer-name"
                        data-testid="customer-name"
                        type="text"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="Ej. Martin Maldonado"
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)] text-sm bg-slate-50/50"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Tu Teléfono (WhatsApp)</label>
                      <input
                        id="input-customer-phone"
                        data-testid="customer-phone"
                        type="tel"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        placeholder="Ej. +59212345678"
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)] text-sm bg-slate-50/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Configuración de Entrega */}
                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Método de Entrega</span>
                    
                    <div className="flex gap-2">
                      {store.delivery_settings?.allow_pickup && (
                        <button
                          id="btn-delivery-pickup"
                          data-testid="delivery-pickup"
                          type="button"
                          onClick={() => setDeliveryType('pickup')}
                          className={`flex-1 p-3 border rounded-xl flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${
                            deliveryType === 'pickup'
                              ? 'border-[var(--tenant-primary)] bg-[var(--tenant-primary)]/5 text-slate-900 font-extrabold'
                              : 'border-slate-200 text-slate-500 bg-white'
                          }`}
                        >
                          <Clock className="w-5 h-5" />
                          <span>Retiro en Local</span>
                        </button>
                      )}

                      {store.delivery_settings?.allow_delivery && (
                        <button
                          id="btn-delivery-shipping"
                          data-testid="delivery-shipping"
                          type="button"
                          onClick={() => setDeliveryType('delivery')}
                          className={`flex-1 p-3 border rounded-xl flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${
                            deliveryType === 'delivery'
                              ? 'border-[var(--tenant-primary)] bg-[var(--tenant-primary)]/5 text-slate-900 font-extrabold'
                              : 'border-slate-200 text-slate-500 bg-white'
                          }`}
                        >
                          <Truck className="w-5 h-5" />
                          <span>Envío a Domicilio</span>
                        </button>
                      )}
                    </div>

                    {/* Dirección y Envío (Si es Delivery) */}
                    {deliveryType === 'delivery' && (
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">Dirección Completa de Entrega</label>
                          <input
                            id="input-customer-address"
                            data-testid="customer-address"
                            type="text"
                            value={custAddress}
                            onChange={(e) => setCustAddress(e.target.value)}
                            placeholder="Ej. Calle Falsa 123, Piso 1"
                            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)] text-sm bg-slate-50/50"
                            required
                          />
                        </div>

                        {shippingRules.length > 0 && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700">Zona / Tarifa de Envío</label>
                            <select
                              id="select-shipping-rule"
                              data-testid="shipping-rule"
                              value={selectedShippingRuleId || ''}
                              onChange={(e) => setSelectedShippingRuleId(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)] text-sm bg-white"
                            >
                              {shippingRules.map((rule) => (
                                <option key={rule.id} value={rule.id}>
                                  {rule.name} (+{formatPrice(rule.price)})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Método de Pago */}
                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Forma de Pago</span>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-slate-500" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Coordinar con el vendedor</div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Enviaremos tu pedido a WhatsApp y acordaremos el pago.</p>
                      </div>
                    </div>
                  </div>

                  {/* Errores */}
                  {checkoutError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{checkoutError}</span>
                    </div>
                  )}
                </div>

                {/* Resumen Total y Botón Compra */}
                <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-3.5">
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between"><span>Subtotal:</span> <span>{formatPrice(cartSubtotal)}</span></div>
                    {deliveryType === 'delivery' && (
                      <div className="flex justify-between"><span>Costo de Envío:</span> <span>{formatPrice(shippingCost)}</span></div>
                    )}
                    {store.collect_sales_tax && (
                      <div className="flex justify-between">
                        <span>Impuestos ({store.sales_tax_rate}%):</span> 
                        <span>{formatPrice(taxCost)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-slate-900 text-sm border-t border-dashed border-slate-200 pt-2">
                      <span>Total final:</span> 
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                  </div>

                  <Button
                    id="btn-confirmar-pedido"
                    data-testid="confirmar-pedido"
                    type="submit"
                    disabled={processing}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>{processing ? 'Procesando...' : 'Confirmar y Enviar a WhatsApp'}</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
