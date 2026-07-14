'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Category {
  id: string
  name: string
  slug: string
  position: number
  is_active: boolean
}

interface Product {
  id: string
  category_id: string | null
  title: string
  description: string | null
  price: number
  images: string[]
  is_available: boolean
  position: number
}

interface ProductsClientProps {
  store: {
    id: string
    name: string
  }
  initialCategories: Category[]
  initialProducts: Product[]
}

export default function ProductsClient({ store, initialCategories, initialProducts }: ProductsClientProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products')
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [products, setProducts] = useState<Product[]>(initialProducts)

  // Estados Categorías
  const [newCatName, setNewCatName] = useState('')
  const [loadingCat, setLoadingCat] = useState(false)

  // Estados Producto (Modal Crear/Editar)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // Campos del Formulario de Producto
  const [prodTitle, setProdTitle] = useState('')
  const [prodDesc, setProdDesc] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [prodCatId, setProdCatId] = useState('')
  const [prodImageUrl, setProdImageUrl] = useState('')
  const [prodAvailable, setProdAvailable] = useState(true)
  const [loadingProd, setLoadingProd] = useState(false)
  const [uploadingProdImg, setUploadingProdImg] = useState(false)

  const supabase = createClient()

  // Subir imagen del producto a R2
  const handleUploadProductImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingProdImg(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('path', `stores/${store.id}/products`)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al subir la imagen')
      }

      setProdImageUrl(data.url)
    } catch (err: any) {
      alert(err.message || 'Error al subir la imagen del producto.')
    } finally {
      setUploadingProdImg(false)
    }
  }

  // ----------------------------------------------------
  // GESTIÓN DE CATEGORÍAS
  // ----------------------------------------------------
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    setLoadingCat(true)
    const slug = newCatName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    const maxPosition = categories.reduce((max, cat) => cat.position > max ? cat.position : max, 0)

    const { data, error } = await supabase
      .from('categories')
      .insert({
        store_id: store.id,
        name: newCatName.trim(),
        slug,
        position: maxPosition + 1,
        is_active: true
      })
      .select()
      .single()

    if (!error && data) {
      setCategories((prev) => [...prev, data])
      setNewCatName('')
    }
    setLoadingCat(false)
  }

  const handleToggleCategoryActive = async (catId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !currentStatus })
      .eq('id', catId)

    if (!error) {
      setCategories((prev) => prev.map((cat) => cat.id === catId ? { ...cat, is_active: !currentStatus } : cat))
    }
  }

  const handleDeleteCategory = async (catId: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', catId)

    if (!error) {
      setCategories((prev) => prev.filter((cat) => cat.id !== catId))
    }
  }

  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === categories.length - 1) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const currentCat = categories[index]
    const swapCat = categories[targetIndex]

    const { error: err1 } = await supabase
      .from('categories')
      .update({ position: swapCat.position })
      .eq('id', currentCat.id)

    const { error: err2 } = await supabase
      .from('categories')
      .update({ position: currentCat.position })
      .eq('id', swapCat.id)

    if (!err1 && !err2) {
      setCategories((prev) => {
        const copy = [...prev]
        const tempPos = currentCat.position
        currentCat.position = swapCat.position
        swapCat.position = tempPos
        copy[index] = swapCat
        copy[targetIndex] = currentCat
        return copy
      })
    }
  }

  // ----------------------------------------------------
  // GESTIÓN DE PRODUCTOS
  // ----------------------------------------------------
  const handleOpenProductModal = (product: Product | null) => {
    setSelectedProduct(product)
    if (product) {
      setProdTitle(product.title)
      setProdDesc(product.description || '')
      setProdPrice(product.price.toString())
      setProdCatId(product.category_id || '')
      setProdImageUrl(product.images[0] || '')
      setProdAvailable(product.is_available)
    } else {
      setProdTitle('')
      setProdDesc('')
      setProdPrice('')
      setProdCatId(categories[0]?.id || '')
      setProdImageUrl('')
      setProdAvailable(true)
    }
    setIsProductModalOpen(true)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prodTitle.trim() || !prodPrice) return

    setLoadingProd(true)
    const imagesArray = prodImageUrl.trim() ? [prodImageUrl.trim()] : []

    if (selectedProduct) {
      const { data, error } = await supabase
        .from('products')
        .update({
          title: prodTitle.trim(),
          description: prodDesc.trim() || null,
          price: parseFloat(prodPrice),
          category_id: prodCatId || null,
          images: imagesArray,
          is_available: prodAvailable,
        })
        .eq('id', selectedProduct.id)
        .select()
        .single()

      if (!error && data) {
        setProducts((prev) => prev.map((p) => p.id === selectedProduct.id ? data : p))
        setIsProductModalOpen(false)
      }
    } else {
      const maxPosition = products.reduce((max, prod) => prod.position > max ? prod.position : max, 0)
      
      const { data, error } = await supabase
        .from('products')
        .insert({
          store_id: store.id,
          title: prodTitle.trim(),
          description: prodDesc.trim() || null,
          price: parseFloat(prodPrice),
          category_id: prodCatId || null,
          images: imagesArray,
          is_available: prodAvailable,
          position: maxPosition + 1,
        })
        .select()
        .single()

      if (!error && data) {
        setProducts((prev) => [...prev, data])
        setIsProductModalOpen(false)
      }
    }
    setLoadingProd(false)
  }

  const handleToggleProductAvailable = async (prodId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_available: !currentStatus })
      .eq('id', prodId)

    if (!error) {
      setProducts((prev) => prev.map((p) => p.id === prodId ? { ...p, is_available: !currentStatus } : p))
    }
  }

  const handleDeleteProduct = async (prodId: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', prodId)

    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== prodId))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-6 font-body-base text-on-surface">
      {/* Cabecera (Diseño de Stitch) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Catálogo de Productos</h1>
          <p className="text-sm text-on-surface-variant">Gestiona tu inventario, precios y disponibilidad.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-slate-100 p-1 rounded border border-border-subtle mr-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
                activeTab === 'products' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Productos
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
                activeTab === 'categories' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Categorías
            </button>
          </div>

          <button
            onClick={() => handleOpenProductModal(null)}
            className="flex items-center gap-2 bg-admin-deep-blue text-on-primary px-5 py-2 rounded font-bold text-xs hover:opacity-90 transition-opacity shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Añadir Producto</span>
          </button>
        </div>
      </div>

      {/* PESTAÑA: PRODUCTOS (Diseño Grid de Tarjetas de Stitch) */}
      {activeTab === 'products' && (
        <>
          {products.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border border-dashed border-border-subtle rounded-lg bg-white">
              <span className="material-symbols-outlined text-[40px] text-slate-200 mx-auto mb-2 block">inventory_2</span>
              <div className="font-bold text-sm text-slate-700">No hay productos en tu catálogo</div>
              <p className="text-xs text-slate-500 mt-1">Usa el botón superior para añadir el primer producto.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const categoryName = categories.find((c) => c.id === product.category_id)?.name || 'Sin categoría'
                return (
                  <div 
                    key={product.id}
                    className={`bg-surface-container-lowest border border-border-subtle rounded-lg overflow-hidden hover:border-outline-variant transition-colors group cursor-pointer flex flex-col h-full ${
                      !product.is_available ? 'opacity-75' : ''
                    }`}
                    onClick={() => handleOpenProductModal(product)}
                  >
                    {/* Imagen superior */}
                    <div className="relative h-48 w-full bg-surface-container flex-shrink-0 overflow-hidden">
                      {product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.title} 
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                            !product.is_available ? 'grayscale' : ''
                          }`}
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-container flex items-center justify-center text-slate-300">
                          <span className="material-symbols-outlined text-[40px]">image</span>
                        </div>
                      )}
                      
                      {/* Tag de estado */}
                      <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur-sm px-2.5 py-0.5 rounded border border-border-subtle flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          product.is_available ? 'bg-status-completed' : 'bg-surface-variant'
                        }`}></span>
                        <span className="text-[9px] font-bold text-on-surface uppercase tracking-wider">
                          {product.is_available ? 'Activo' : 'Oculto'}
                        </span>
                      </div>
                    </div>

                    {/* Detalles */}
                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                        <span>{categoryName}</span>
                        <span>SKU: {product.id.slice(0, 5).toUpperCase()}</span>
                      </div>
                      
                      <h3 className="font-semibold text-sm text-primary mb-2 line-clamp-2 min-h-[40px]">
                        {product.title}
                      </h3>

                      {product.description && (
                        <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed mb-4">
                          {product.description}
                        </p>
                      )}

                      {/* Pie con precio y toggle */}
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-border-subtle">
                        <span className={`text-base font-bold ${
                          product.is_available ? 'text-primary' : 'text-on-surface-variant line-through'
                        }`}>
                          {formatCurrency(product.price)}
                        </span>

                        {/* Toggle Switch */}
                        <div 
                          className="flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleProductAvailable(product.id, product.is_available)
                          }}
                        >
                          <span className={`text-[10px] font-bold uppercase ${
                            product.is_available ? 'text-emerald-500' : 'text-slate-400'
                          }`}>
                            {product.is_available ? 'On' : 'Off'}
                          </span>
                          <div className="relative inline-block w-8 h-4 align-middle select-none transition duration-200 ease-in">
                            <input 
                              type="checkbox"
                              checked={product.is_available}
                              readOnly
                              className={`absolute block w-4 h-4 rounded-full bg-white border border-slate-300 appearance-none cursor-pointer transition-transform duration-300 ${
                                product.is_available ? 'translate-x-4 border-emerald-400 bg-emerald-500' : 'translate-x-0'
                              }`}
                            />
                            <div className={`block overflow-hidden h-4 rounded-full bg-slate-200 cursor-pointer transition-colors duration-300 ${
                              product.is_available ? 'bg-emerald-100' : ''
                            }`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* PESTAÑA: CATEGORÍAS */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Creador de Categorías */}
          <div className="bg-white border border-border-subtle rounded-xl p-6 h-fit space-y-4 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Nueva Categoría</h3>
              <p className="text-xs text-on-surface-variant">Añade secciones para estructurar el catálogo.</p>
            </div>
            
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Nombre de Categoría
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ej. Hamburguesas, Bebidas"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-admin-deep-blue text-xs bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loadingCat}
                className="w-full flex justify-center items-center gap-2 bg-admin-deep-blue text-on-primary py-2.5 rounded font-bold text-xs hover:opacity-90"
              >
                <span className="material-symbols-outlined text-[16px]">folder_open</span>
                <span>{loadingCat ? 'Guardando...' : 'Crear Categoría'}</span>
              </button>
            </form>
          </div>

          {/* Listado y Reordenamiento */}
          <div className="lg:col-span-2 bg-white border border-border-subtle rounded-xl p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Posiciones del Catálogo</h3>
              <p className="text-xs text-on-surface-variant">Usa las flechas para ordenar la aparición visual de tus categorías.</p>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border border-dashed border-border-subtle rounded-lg">
                <span className="material-symbols-outlined text-[40px] text-slate-200 mb-2 block">tag</span>
                <div className="font-bold text-xs text-slate-700">No hay categorías</div>
                <p className="text-[10px] text-slate-500 mt-1">Registra la primera en el panel izquierdo.</p>
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {categories.map((cat, index) => {
                  const itemsCount = products.filter((p) => p.category_id === cat.id).length
                  return (
                    <div key={cat.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{cat.name}</span>
                          <span className="text-[9px] bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded font-bold text-slate-500 uppercase tracking-wide">
                            {itemsCount} {itemsCount === 1 ? 'producto' : 'productos'}
                          </span>
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-mono">Slug: /{cat.slug}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Botones de posición */}
                        <div className="flex items-center border border-border-subtle rounded bg-white">
                          <button
                            onClick={() => handleMoveCategory(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px] block">arrow_upward</span>
                          </button>
                          <span className="border-l border-border-subtle h-5" />
                          <button
                            onClick={() => handleMoveCategory(index, 'down')}
                            disabled={index === categories.length - 1}
                            className="p-1.5 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px] block">arrow_downward</span>
                          </button>
                        </div>

                        {/* Visibilidad */}
                        <button
                          onClick={() => handleToggleCategoryActive(cat.id, cat.is_active)}
                          className={`p-1.5 rounded border transition-colors ${
                            cat.is_active 
                              ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                              : 'text-slate-400 bg-slate-50 border-slate-200'
                          }`}
                          title={cat.is_active ? 'Visible' : 'Oculto'}
                        >
                          <span className="material-symbols-outlined text-[18px] block">
                            {cat.is_active ? 'visibility' : 'visibility_off'}
                          </span>
                        </button>

                        {/* Borrar */}
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded"
                          title="Eliminar Categoría"
                        >
                          <span className="material-symbols-outlined text-[18px] block">delete</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal / Dialog de Producto (Crear / Editar) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsProductModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl border border-border-subtle max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-border-subtle bg-slate-50">
              <h3 className="font-bold text-on-surface text-sm">
                {selectedProduct ? 'Editar Producto' : 'Crear Producto'}
              </h3>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-md text-on-surface-variant hover:bg-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] block">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  placeholder="Ej. Teclado Mecánico, Taza de Café"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-admin-deep-blue text-xs bg-white font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider">
                  Descripción
                </label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Detalles sobre el material, color, tamaño, etc."
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-admin-deep-blue text-xs bg-white font-medium"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="9.90"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-admin-deep-blue text-xs bg-white font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider">
                    Categoría
                  </label>
                  <select
                    value={prodCatId}
                    onChange={(e) => setProdCatId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-admin-deep-blue text-xs bg-white font-medium"
                  >
                    <option value="">Sin Categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider">
                  Foto del Producto
                </label>
                
                {prodImageUrl ? (
                  <div className="relative w-full aspect-video rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center group shadow-sm">
                    <img 
                      src={prodImageUrl} 
                      alt="Vista previa del producto" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="p-2 bg-white text-slate-800 rounded-full hover:bg-slate-100 transition-all cursor-pointer shadow">
                        <span className="material-symbols-outlined text-[18px] block">upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadProductImage}
                          className="hidden"
                          disabled={uploadingProdImg}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setProdImageUrl('')}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow"
                      >
                        <span className="material-symbols-outlined text-[18px] block">delete</span>
                      </button>
                    </div>
                    {uploadingProdImg && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold gap-2">
                        <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                        <span>Subiendo...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <label className={`w-full aspect-video rounded-xl border-2 border-dashed border-slate-300 hover:border-admin-deep-blue bg-slate-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${uploadingProdImg ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploadingProdImg ? (
                      <>
                        <span className="animate-spin material-symbols-outlined text-slate-400 text-[24px]">progress_activity</span>
                        <span className="text-slate-500 font-bold text-[11px]">Subiendo imagen...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-slate-400 text-[26px]">image</span>
                        <span className="text-slate-600 font-bold text-[11px]">Subir foto de producto</span>
                        <span className="text-[10px] text-slate-400 font-medium">Formatos soportados: PNG, JPG, WEBP</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadProductImage}
                      className="hidden"
                      disabled={uploadingProdImg}
                    />
                  </label>
                )}

                {/* Input de respaldo */}
                <div className="pt-2">
                  <input
                    type="text"
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    placeholder="O pega una URL de imagen directamente aquí..."
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-admin-deep-blue text-[10px] bg-slate-50 font-mono font-medium text-slate-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="prod_avail"
                  checked={prodAvailable}
                  onChange={(e) => setProdAvailable(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-admin-deep-blue"
                />
                <label htmlFor="prod_avail" className="text-xs text-slate-700 cursor-pointer font-bold select-none">
                  Producto disponible para la venta inmediata (Activo)
                </label>
              </div>

              {selectedProduct && (
                <div className="pt-2 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('¿Seguro que deseas eliminar este producto?')) {
                        handleDeleteProduct(selectedProduct.id)
                        setIsProductModalOpen(false)
                      }
                    }}
                    className="w-full py-2 bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 hover:text-red-600 rounded font-bold transition-all text-xs flex justify-center items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Eliminar este producto permanentemente</span>
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border-subtle">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 text-slate-700 text-xs font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loadingProd}
                  className="flex-1 bg-admin-deep-blue hover:opacity-90 text-white font-bold text-xs gap-1.5 h-10 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>{loadingProd ? 'Guardando...' : 'Guardar Producto'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
