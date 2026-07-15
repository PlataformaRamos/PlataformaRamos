'use client'

import React, { useState } from 'react'
import { Link } from 'next-view-transitions'
import { useCart } from '@/lib/store/useCart'
import { Button } from '@/components/ui/button'
import { getOptimizedImageUrl } from '@/lib/cloudinary'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Check, 
  Image as ImageIcon 
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

interface ProductDetailClientProps {
  store: {
    id: string
    name: string
    slug: string
    whatsapp_phone: string
    currency_code: string
    theme_settings: any
    show_decimals: boolean
  }
  product: Product
  categories: Category[]
  shippingRules: any[]
}

export default function ProductDetailClient({ store, product, categories }: ProductDetailClientProps) {
  const cart = useCart()
  
  // Opciones seleccionadas
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { valueId: string; valueName: string; priceModifier: number }>>({})
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)

  // Formateador de precios de la tienda
  const formatPrice = (amount: number) => {
    const formatted = new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: store.currency_code || 'USD',
      minimumFractionDigits: store.show_decimals ? 2 : 0,
      maximumFractionDigits: store.show_decimals ? 2 : 0,
    }).format(amount)
    return formatted
  }

  // Calcular precio total dinámico del producto con variantes
  const modifiersTotal = Object.values(selectedOptions).reduce((acc, opt) => acc + opt.priceModifier, 0)
  const basePrice = Number(product.price)
  const singleItemPrice = basePrice + modifiersTotal
  const totalPrice = singleItemPrice * quantity

  // Guardar opción seleccionada
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

  // Añadir al carrito global
  const handleAddToCart = () => {
    // Validar opciones obligatorias
    const missingRequired = product.product_options?.filter(
      (opt) => opt.is_required && !selectedOptions[opt.id]
    ) || []

    if (missingRequired.length > 0) {
      alert(`Por favor selecciona las opciones obligatorias: ${missingRequired.map(o => o.name).join(', ')}`)
      return
    }

    const optionsList = product.product_options?.map((opt) => {
      const selected = selectedOptions[opt.id]
      if (!selected) return null
      return {
        optionId: opt.id,
        optionName: opt.name,
        valueId: selected.valueId,
        valueName: selected.valueName,
        priceModifier: selected.priceModifier
      }
    }).filter(Boolean) as any[] || []

    cart.addItem({
      productId: product.id,
      title: product.title,
      price: basePrice,
      image: product.images[0] || null,
      selectedOptions: optionsList,
      quantity
    })

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const categoryName = categories.find((c) => c.id === product.category_id)?.name || 'Sin Categoría'
  const primaryColor = store.theme_settings?.primary_color || '#000000'

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Cabecera / Barra de Navegación */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3.5 flex justify-between items-center">
        <Link 
          href={`/${store.slug}`}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>
        <h1 className="font-extrabold text-sm text-slate-800 tracking-tight">{store.name}</h1>
        <Link
          href={`/${store.slug}?cart=open`}
          className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-all"
        >
          <ShoppingBag className="w-4.5 h-4.5" />
          {cart.items.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[8px] font-black leading-none animate-bounce">
              {cart.items.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </Link>
      </header>

      {/* Grid del Contenedor de Detalle */}
      <main className="max-w-4xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden">
          
          {/* Columna Izquierda: Imágenes */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
              {product.images && product.images[activeImageIndex] ? (
                <motion.img 
                  key={activeImageIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  src={getOptimizedImageUrl(product.images[activeImageIndex], { width: 600 })} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                  <ImageIcon className="w-16 h-16" />
                  <span className="text-[10px] uppercase font-black tracking-wider mt-2">Sin Imagen</span>
                </div>
              )}
            </div>

            {/* Galería de miniaturas */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 bg-slate-50 transition-all ${
                      idx === activeImageIndex ? 'border-slate-800 scale-95 shadow-sm' : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img src={getOptimizedImageUrl(img, { width: 100, height: 100 })} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Columna Derecha: Detalles, Variantes y Compra */}
          <div className="flex flex-col h-full space-y-5">
            <div>
              <span className="text-[9px] font-black uppercase bg-slate-100 border border-slate-200/50 text-slate-500 py-0.5 px-2 rounded-full tracking-wider inline-block mb-2">
                {categoryName}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">
                {product.title}
              </h2>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{formatPrice(singleItemPrice)}</span>
                {product.product_options && product.product_options.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Precio según variante
                  </span>
                )}
              </div>
            </div>

            {/* Descripción del producto */}
            {product.description && (
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1.5">Descripción</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>
            )}

            {/* Opciones y Variantes */}
            {product.product_options && product.product_options.length > 0 && (
              <div className="space-y-4 pt-3 border-t border-slate-100">
                {product.product_options.map((opt) => (
                  <div key={opt.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <span>{opt.name}</span>
                        {opt.is_required && (
                          <span className="text-[9px] bg-red-50 text-red-500 border border-red-100 font-black px-1.5 py-0.5 rounded-md uppercase">
                            Obligatorio
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {opt.product_option_values?.map((val) => {
                        const isSelected = selectedOptions[opt.id]?.valueId === val.id
                        return (
                          <button
                            key={val.id}
                            type="button"
                            onClick={() => handleSelectOption(opt.id, opt.name, val)}
                            style={{ 
                              borderColor: isSelected ? primaryColor : undefined,
                              backgroundColor: isSelected ? `${primaryColor}08` : undefined
                            }}
                            className={`px-3.5 py-2 border rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-3 shadow-sm ${
                              isSelected 
                                ? 'border-slate-800 text-slate-900 font-extrabold ring-1 ring-slate-800' 
                                : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300'
                            }`}
                          >
                            <span>{val.value}</span>
                            {Number(val.price_modifier) > 0 && (
                              <span className="text-[10px] text-slate-400 font-bold">
                                +{formatPrice(Number(val.price_modifier))}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Controles de Compra (Escritorio - oculto en móvil) */}
            <div className="pt-5 border-t border-slate-100 space-y-4 mt-auto hidden md:block">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Cantidad</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-sm">
                  <button
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="p-2 hover:bg-slate-50 text-slate-500 transition-colors rounded-l-xl"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-xs font-black text-slate-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-slate-50 text-slate-500 transition-colors rounded-r-xl"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Botón Añadir al Carrito con Animación */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  style={{ backgroundColor: addedToCart ? '#10b981' : primaryColor }}
                  className="flex-1 text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-md hover:opacity-95 transition-all text-sm cursor-pointer"
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-4.5 h-4.5" />
                      <span>¡Añadido al Carrito!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4.5 h-4.5" />
                      <span>Añadir al Carrito ({formatPrice(totalPrice)})</span>
                    </>
                  )}
                </button>
              </div>

              {/* Botón directo de Checkout */}
              <Link
                href={`/${store.slug}?cart=open`}
                className="block text-center border border-slate-200 hover:border-slate-300 text-slate-700 font-extrabold py-3 rounded-2xl text-xs transition-all shadow-sm bg-white"
              >
                Ver Carrito y Pagar
              </Link>
            </div>

          </div>
        </div>
      </main>

      {/* Barra de Compra Flotante Fija para Celulares (Estilo Shopify/Kyte) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-40 flex md:hidden items-center justify-between gap-4 max-w-md mx-auto rounded-t-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total</span>
          <span className="text-base font-black text-slate-900 leading-none mt-0.5">{formatPrice(totalPrice)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Selector de cantidad compacto */}
          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 shadow-sm">
            <button
              onClick={() => quantity > 1 && setQuantity(quantity - 1)}
              className="p-2 text-slate-500 rounded-l-xl"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-xs font-black text-slate-800">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-slate-500 rounded-r-xl"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Botón interactivo */}
          <button
            onClick={handleAddToCart}
            style={{ backgroundColor: addedToCart ? '#10b981' : primaryColor }}
            className="text-white font-extrabold px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md text-xs cursor-pointer min-w-[130px] transition-all"
          >
            {addedToCart ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Agregado!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Añadir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
