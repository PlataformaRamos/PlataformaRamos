'use client'

import React, { useState, useEffect } from 'react'
import { useCart, CartItem } from '@/lib/store/useCart'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
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
  description: string | null
  price: number
  images: string[]
  category_id: string | null
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
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('pickup')
  const [selectedShippingRuleId, setSelectedShippingRuleId] = useState<string>('')
  
  // Carga de procesamiento
  const [processing, setProcessing] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const cart = useCart()
  const supabase = createClient()

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
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: store.currency_code || 'USD',
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

      // 4. Limpiar carro en Zustand y cookies
      cart.clearCart()

      // 5. Redireccionar al WhatsApp del vendedor con el ticket formateado
      let itemsText = ''
      orderItemsInsert.forEach((item) => {
        const optionsLabel = item.selected_options.length > 0 
          ? ` (${item.selected_options.map(o => o.valueName).join(', ')})`
          : ''
        itemsText += `• ${item.quantity}x ${item.product_title}${optionsLabel} - ${formatPrice(item.price * item.quantity)}\n`
      })

      const checkoutText = `*NUEVO PEDIDO #${order.id.slice(0, 8)}*\n\n` +
        `👤 *Cliente:* ${custName.trim()}\n` +
        `📞 *Teléfono:* ${formattedPhone}\n` +
        `🛵 *Entrega:* ${deliveryType === 'delivery' ? 'Domicilio' : 'Retiro local'}\n` +
        (deliveryType === 'delivery' ? `📍 *Dirección:* ${custAddress.trim()}\n\n` : '\n') +
        `📦 *Detalle:*\n${itemsText}\n` +
        `💵 *Subtotal:* ${formatPrice(cartSubtotal)}\n` +
        (deliveryType === 'delivery' ? `🚚 *Envío:* ${formatPrice(shippingCost)}\n` : '') +
        (store.collect_sales_tax ? `🏛️ *Impuesto:* ${formatPrice(taxCost)}\n` : '') +
        `💰 *Total:* ${formatPrice(cartTotal)}\n\n` +
        `Por favor, confirma recepción para finalizar. ¡Gracias!`

      const whatsappTarget = store.whatsapp_phone.replace('+', '')
      window.location.href = `https://api.whatsapp.com/send?phone=${whatsappTarget}&text=${encodeURIComponent(checkoutText)}`
      
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
    <div className="flex-1 flex flex-col min-h-screen">
      
      {/* 1. DISEÑO MÓVIL (VERSIÓN STITCH) */}
      <div className="md:hidden flex-1 flex flex-col min-h-screen pb-20">
        {/* HEADER TIENDA */}
        <header className="p-6 text-center space-y-3 bg-slate-50 border-b border-slate-100 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[var(--tenant-primary)] text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white">
            {store.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{store.name}</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Realiza tu orden rápido y envíala a nuestro WhatsApp.</p>
          </div>
        </header>

        {/* BUSCADOR & CATEGORÍAS */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md z-20 py-3 border-b border-slate-100 space-y-3 px-4">
          <div className="relative">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en el catálogo..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)] focus:border-transparent text-sm bg-slate-50/50"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategoryId === 'all'
                  ? 'bg-[var(--tenant-primary)] border-transparent text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategoryId === cat.id
                    ? 'bg-[var(--tenant-primary)] border-transparent text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* LISTADO DE PRODUCTOS MÓVIL */}
        <main className="p-4 flex-1">
          {sortedProducts.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-2" />
              <div className="font-bold text-sm text-slate-700">Sin productos disponibles</div>
              <p className="text-xs text-slate-500 mt-1">Vuelve a revisar la búsqueda o las categorías.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sortedProducts.map((prod) => (
                <div 
                  key={prod.id} 
                  onClick={() => handleProductClick(prod)}
                  className="flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 cursor-pointer transition-all shadow-sm group"
                >
                  {prod.images[0] ? (
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      className="w-20 h-20 rounded-lg object-cover border border-slate-50 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 flex-shrink-0">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="font-bold text-slate-900 group-hover:text-[var(--tenant-primary)] transition-colors text-sm truncate">
                      {prod.title}
                    </div>
                    {prod.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-snug">
                        {prod.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center pt-1">
                      <span className="font-extrabold text-slate-900 text-sm">{formatPrice(prod.price)}</span>
                      <button className="p-1 bg-slate-900 text-white rounded-full group-hover:bg-[var(--tenant-primary)] transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* 2. DISEÑO DE ESCRITORIO (VERSIÓN KYTE) */}
      <div className="hidden md:flex flex-col flex-1 min-h-screen bg-white">
        {/* Cabecera Superior */}
        <header className="sticky top-0 bg-white border-b border-slate-100 h-16 flex items-center px-8 justify-between z-30 shadow-sm">
          {/* Caja de Búsqueda */}
          <div className="relative w-80">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for items"
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-transparent text-xs bg-slate-50/50"
            />
          </div>

          {/* Nombre de la Tienda (Centro) */}
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-secondary text-[18px] uppercase">
              {store.name}
            </h1>
          </div>

          {/* Perfil y Carrito */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => {
                if (cart.items.length > 0) {
                  setIsCartOpen(true)
                  setIsCheckoutStep(false)
                }
              }}
              className="relative text-slate-700 hover:text-slate-900 flex items-center gap-1 text-xs font-bold"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>CARRITO ({cart.items.reduce((acc, i) => acc + i.quantity, 0)})</span>
              {cart.items.length > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-secondary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cart.items.length}
                </span>
              )}
            </button>

            <span className="text-slate-200">|</span>

            <div className="flex items-center gap-2 text-slate-600 hover:text-slate-900 cursor-pointer">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-700">LOGIN OR CREATE ACCOUNT</span>
              <span className="material-symbols-outlined text-[20px] text-slate-500">account_circle</span>
            </div>
          </div>
        </header>

        {/* Cuerpo Principal */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-[280px_1fr] px-8 py-8 gap-8">
          {/* Sidebar */}
          <aside className="space-y-6 flex flex-col border-r border-slate-100 pr-8">
            {/* Categorías */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Categories</h3>
              <ul className="space-y-1.5">
                <li>
                  <button 
                    onClick={() => setSelectedCategoryId('all')}
                    className={`w-full flex items-center justify-between text-left text-xs py-1 transition-colors ${
                      selectedCategoryId === 'all' 
                        ? 'font-bold text-slate-900' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <span>All</span>
                    {selectedCategoryId === 'all' && <span className="text-xs">✓</span>}
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button 
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`w-full flex items-center justify-between text-left text-xs py-1 transition-colors ${
                        selectedCategoryId === cat.id 
                          ? 'font-bold text-slate-900' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {selectedCategoryId === cat.id && <span className="text-xs">✓</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ordenamiento (Sort by) */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Sort by</h3>
              <ul className="space-y-1.5">
                {[
                  { id: 'categories', label: 'Categories' },
                  { id: 'lowest', label: 'Lowest price' },
                  { id: 'highest', label: 'Highest price' },
                  { id: 'az', label: 'A-Z' },
                  { id: 'za', label: 'Z-A' }
                ].map((option) => (
                  <li key={option.id}>
                    <button 
                      onClick={() => setSortBy(option.id as any)}
                      className={`w-full flex items-center justify-between text-left text-xs py-1 transition-colors ${
                        sortBy === option.id 
                          ? 'font-bold text-slate-900' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <span>{option.label}</span>
                      {sortBy === option.id && <span className="text-xs">✓</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Layout */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Layout</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setViewLayout('instaview')}
                  className={`flex-1 py-2 px-3 border rounded-md flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                    viewLayout === 'instaview' 
                      ? 'border-slate-800 bg-slate-950 text-white' 
                      : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Instaview</span>
                </button>

                <button 
                  onClick={() => setViewLayout('list')}
                  className={`flex-1 py-2 px-3 border rounded-md flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                    viewLayout === 'list' 
                      ? 'border-slate-800 bg-slate-950 text-white' 
                      : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
              </div>
            </div>

            {/* Contacto */}
            <div className="pt-6 border-t border-slate-100 space-y-3.5 text-xs text-slate-600 mt-auto">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <a href={`https://wa.me/${store.whatsapp_phone.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {store.whatsapp_phone}
                </a>
              </div>

              {store.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <a href={`mailto:${store.contact_email}`} className="hover:underline truncate">
                    {store.contact_email}
                  </a>
                </div>
              )}

              {store.instagram_handle && (
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-pink-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  <a href={`https://instagram.com/${store.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {store.instagram_handle.startsWith('@') ? store.instagram_handle : `@${store.instagram_handle}`}
                  </a>
                </div>
              )}

              {store.address_details && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{store.address_details}</span>
                </div>
              )}
            </div>
          </aside>

          {/* Área de Productos */}
          <main className="flex flex-col min-h-[400px]">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">
                {selectedCategoryId === 'all' ? 'All' : categories.find(c => c.id === selectedCategoryId)?.name || 'Catálogo'}
              </h2>
              <span className="text-xs text-slate-400 font-bold uppercase">
                {sortedProducts.length} {sortedProducts.length === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="flex-1 flex flex-col md:flex-row items-center justify-center py-12 gap-8 text-center md:text-left max-w-xl mx-auto">
                <div className="flex-shrink-0">
                  <svg className="w-40 h-40 text-slate-300" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="30" y="110" width="60" height="60" rx="4" stroke="currentColor" strokeWidth="2.5" fill="white" />
                    <line x1="30" y1="125" x2="90" y2="125" stroke="currentColor" strokeWidth="2.5" />
                    <rect x="50" y="138" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                    <rect x="100" y="110" width="60" height="60" rx="4" stroke="currentColor" strokeWidth="2.5" fill="white" />
                    <line x1="100" y1="125" x2="160" y2="125" stroke="currentColor" strokeWidth="2.5" />
                    <rect x="120" y="138" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                    <rect x="65" y="45" width="60" height="60" rx="4" stroke="currentColor" strokeWidth="2.5" fill="white" />
                    <line x1="65" y1="60" x2="125" y2="60" stroke="currentColor" strokeWidth="2.5" />
                    <rect x="85" y="73" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M123 42L150 90" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M128 45L153 88" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="60" cy="30" r="1.5" fill="currentColor" />
                    <circle cx="50" cy="40" r="2.5" fill="currentColor" />
                    <circle cx="160" cy="50" r="2" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">Ooops...</h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    We were unable to find an item with that name . Please try again.
                  </p>
                </div>
              </div>
            ) : viewLayout === 'instaview' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((prod) => (
                  <div 
                    key={prod.id}
                    onClick={() => handleProductClick(prod)}
                    className="border border-slate-100 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {prod.images[0] ? (
                        <div className="w-full aspect-square relative bg-slate-50 overflow-hidden border-b border-slate-50">
                          <img 
                            src={prod.images[0]} 
                            alt={prod.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-square bg-slate-50 border-b border-slate-100 flex items-center justify-center text-slate-300">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}

                      <div className="p-4 space-y-1.5">
                        <h4 className="font-bold text-slate-900 group-hover:text-secondary transition-colors text-xs truncate">
                          {prod.title}
                        </h4>
                        {prod.description && (
                          <p className="text-[10px] text-slate-500 line-clamp-2 leading-normal">
                            {prod.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex justify-between items-center">
                      <span className="font-extrabold text-slate-900 text-xs">{formatPrice(prod.price)}</span>
                      <button className="px-3 py-1 bg-slate-950 group-hover:bg-secondary text-white rounded text-[10px] font-bold uppercase transition-colors">
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedProducts.map((prod) => (
                  <div 
                    key={prod.id}
                    onClick={() => handleProductClick(prod)}
                    className="border border-slate-100 rounded-xl bg-white p-4 hover:shadow-md cursor-pointer transition-all flex items-center gap-4 justify-between group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {prod.images[0] ? (
                        <img 
                          src={prod.images[0]} 
                          alt={prod.title} 
                          className="w-14 h-14 rounded-lg object-cover border border-slate-50 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 flex-shrink-0">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                      )}

                      <div className="space-y-1 min-w-0">
                        <h4 className="font-bold text-slate-900 group-hover:text-secondary transition-colors text-xs truncate">
                          {prod.title}
                        </h4>
                        {prod.description && (
                          <p className="text-[10px] text-slate-500 line-clamp-1 leading-normal">
                            {prod.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="font-extrabold text-slate-900 text-xs">{formatPrice(prod.price)}</span>
                      <button className="px-3 py-1 bg-slate-950 group-hover:bg-secondary text-white rounded text-[10px] font-bold uppercase transition-colors">
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Pie de Página */}
        <footer className="mt-auto py-8 bg-slate-50 border-t border-slate-100 flex flex-col items-center justify-center gap-2 px-8 text-center text-[10px] text-slate-400">
          <p className="max-w-3xl leading-relaxed">
            Security tip: Avoid scams. Do not pay for items in advance if you do not know the seller. All items and offers listed are the responsibility of <span className="font-bold text-slate-600">{store.name}</span>
          </p>
          <p className="font-bold mt-2">
            Developed by <span className="text-secondary">Plataforma Ramos</span>
          </p>
        </footer>
      </div>

      {/* 4. BARRA FLOTANTE CARRITO */}
      {cart.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-xl z-30 max-w-md mx-auto">
          <Button
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

      {/* 5. MODAL DE VARIANTES */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 md:p-4 bg-black/60">
          <div className="fixed inset-0 bg-transparent" onClick={() => setSelectedProduct(null)} />
          <div className="relative bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
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
            <div className="p-5 overflow-y-auto flex-1 space-y-6">
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
          <div className="fixed inset-0 bg-transparent" onClick={() => setIsCartOpen(false)} />
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
                    setIsCartOpen(false)
                  }
                }} 
                className="p-1 rounded-full text-slate-400 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                              value={selectedShippingRuleId}
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
