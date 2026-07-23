'use client'

import React, { useState, useOptimistic } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import ConfirmModal from '@/components/ui/ConfirmModal'

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
  slug: string
  description: string | null
  price: number
  images: string[]
  is_available: boolean
  position: number
}

interface Catalog {
  id: string
  name: string
}

interface CatalogRelation {
  catalog_id: string
  product_id: string
}

interface ProductsClientProps {
  store: {
    id: string
    name: string
    currency_code?: string
  }
  initialCategories: Category[]
  initialProducts: Product[]
  catalogs: Catalog[]
  initialRelations: CatalogRelation[]
}

export default function ProductsClient({ store, initialCategories, initialProducts, catalogs, initialRelations }: ProductsClientProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products')
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [relations, setRelations] = useState<CatalogRelation[]>(initialRelations)

  const [viewMode, setViewMode] = useState<'grid' | 'pos'>('grid')

  const [optimisticProducts, setOptimisticProducts] = useOptimistic(
    products,
    (state, update: { id: string; is_available: boolean }) =>
      state.map((p) => (p.id === update.id ? { ...p, is_available: update.is_available } : p))
  )

  // Duplicar producto velozmente
  const handleDuplicateProduct = async (productToDup: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    const duplicatedTitle = `${productToDup.title} (Copia)`
    const generatedSlug = `${productToDup.slug}-copia-${Date.now().toString().slice(-4)}`
    const maxPosition = products.reduce((max, prod) => prod.position > max ? prod.position : max, 0)

    const { data, error } = await supabase
      .from('products')
      .insert({
        store_id: store.id,
        title: duplicatedTitle,
        slug: generatedSlug,
        description: productToDup.description,
        price: productToDup.price,
        category_id: productToDup.category_id,
        images: productToDup.images,
        is_available: productToDup.is_available,
        position: maxPosition + 1,
      })
      .select()
      .single()

    if (!error && data) {
      setProducts((prev) => [...prev, data])
      // Copiar relaciones de catálogos
      const associatedCats = relations
        .filter((r) => r.product_id === productToDup.id)
        .map((r) => r.catalog_id)

      if (associatedCats.length > 0) {
        const insertData = associatedCats.map((cid) => ({
          catalog_id: cid,
          product_id: data.id,
        }))
        await supabase.from('catalog_products').insert(insertData)
        setRelations((prev) => [...prev, ...insertData])
      }
    }
  }

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
  const [prodImageUrls, setProdImageUrls] = useState<string[]>([])
  const [inputImageUrl, setInputImageUrl] = useState('')
  const [prodAvailable, setProdAvailable] = useState(true)
  const [prodCatalogIds, setProdCatalogIds] = useState<string[]>([])
  const [loadingProd, setLoadingProd] = useState(false)
  const [uploadingProdImg, setUploadingProdImg] = useState(false)

  const supabase = createClient()

  // Bloquear el scroll de la página de fondo cuando el modal de producto está abierto
  React.useEffect(() => {
    if (isProductModalOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [isProductModalOpen])

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

      setProdImageUrls((prev) => [...prev, data.url])
    } catch (err: any) {
      alert(err.message || 'Error al subir la imagen del producto.')
    } finally {
      setUploadingProdImg(false)
    }
  }

  // Añadir URL de imagen de manera manual al array
  const handleAddManualImageUrl = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (inputImageUrl.trim()) {
      setProdImageUrls((prev) => [...prev, inputImageUrl.trim()])
      setInputImageUrl('')
    }
  }

  // Eliminar imagen del array de imágenes
  const handleRemoveProductImage = (indexToRemove: number) => {
    setProdImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove))
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
    const tempId = `temp-${Date.now()}`
    const tempCategory: Category = {
      id: tempId,
      name: newCatName.trim(),
      slug,
      position: maxPosition + 1,
      is_active: true
    }

    // ⚡ 1. Respuesta Optimista Instantánea (0 ms)
    setCategories((prev) => [...prev, tempCategory])
    setNewCatName('')

    const { data, error } = await supabase
      .from('categories')
      .insert({
        store_id: store.id,
        name: tempCategory.name,
        slug: tempCategory.slug,
        position: tempCategory.position,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      // ⏪ 2. Rollback automático si falla la petición por red
      setCategories((prev) => prev.filter((c) => c.id !== tempId))
      alert('Error de conexión al guardar la categoría. Se ha revertido el cambio.')
    } else if (data) {
      // Reemplazar ID temporal con ID fidedigno de BD
      setCategories((prev) => prev.map((c) => c.id === tempId ? data : c))
    }
    setLoadingCat(false)
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
      setProdImageUrls(product.images || [])
      setInputImageUrl('')
      setProdAvailable(product.is_available)
      
      // Obtener relaciones de catálogos del producto
      const associatedCats = relations
        .filter((r) => r.product_id === product.id)
        .map((r) => r.catalog_id)
      setProdCatalogIds(associatedCats)
    } else {
      setProdTitle('')
      setProdDesc('')
      setProdPrice('')
      setProdCatId(categories[0]?.id || '')
      setProdImageUrls([])
      setInputImageUrl('')
      setProdAvailable(true)
      setProdCatalogIds([])
    }
    setIsProductModalOpen(true)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prodTitle.trim() || !prodPrice) return

    setLoadingProd(true)
    const imagesArray = prodImageUrls.filter(url => url.trim() !== '')

    // Generar un slug limpio
    const generatedSlug = prodTitle.trim().toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    let savedProduct: Product | null = null

    if (selectedProduct) {
      const { data, error } = await supabase
        .from('products')
        .update({
          title: prodTitle.trim(),
          slug: generatedSlug,
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
        savedProduct = data
        setProducts((prev) => prev.map((p) => p.id === selectedProduct.id ? data : p))
      }
    } else {
      const maxPosition = products.reduce((max, prod) => prod.position > max ? prod.position : max, 0)
      
      const { data, error } = await supabase
        .from('products')
        .insert({
          store_id: store.id,
          title: prodTitle.trim(),
          slug: generatedSlug,
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
        savedProduct = data
        setProducts((prev) => [...prev, data])
      }
    }

    // Actualizar relaciones de catálogos en BD
    if (savedProduct) {
      const productId = savedProduct.id
      
      // 1. Limpiar relaciones anteriores
      await supabase
        .from('catalog_products')
        .delete()
        .eq('product_id', productId)

      // 2. Insertar las nuevas
      if (prodCatalogIds.length > 0) {
        const insertData = prodCatalogIds.map((cid) => ({
          catalog_id: cid,
          product_id: productId,
        }))
        await supabase
          .from('catalog_products')
          .insert(insertData)
      }

      // 3. Actualizar relaciones locales
      setRelations((prev) => {
        const filtered = prev.filter((r) => r.product_id !== productId)
        const added = prodCatalogIds.map((cid) => ({
          catalog_id: cid,
          product_id: productId,
        }))
        return [...filtered, ...added]
      })

      setIsProductModalOpen(false)
    }

    setLoadingProd(false)
  }

  const handleToggleProductAvailable = async (prodId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus
    setOptimisticProducts({ id: prodId, is_available: nextStatus })

    const { error } = await supabase
      .from('products')
      .update({ is_available: nextStatus })
      .eq('id', prodId)

    if (!error) {
      setProducts((prev) => prev.map((p) => p.id === prodId ? { ...p, is_available: nextStatus } : p))
    }
  }

  // Estados ConfirmModal de Eliminación (Productos y Categorías)
  const [deleteProdId, setDeleteProdId] = useState<string | null>(null)
  const [loadingDeleteProd, setLoadingDeleteProd] = useState(false)

  const [deleteCatId, setDeleteCatId] = useState<string | null>(null)
  const [loadingDeleteCat, setLoadingDeleteCat] = useState(false)

  // Ejecutar Eliminar Producto
  const handleConfirmDeleteProduct = async () => {
    if (!deleteProdId) return
    setLoadingDeleteProd(true)

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', deleteProdId)

    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteProdId))
    }
    setLoadingDeleteProd(false)
    setDeleteProdId(null)
  }

  // Ejecutar Eliminar Categoría
  const handleConfirmDeleteCategory = async () => {
    if (!deleteCatId) return
    setLoadingDeleteCat(true)

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', deleteCatId)

    if (!error) {
      setCategories((prev) => prev.filter((cat) => cat.id !== deleteCatId))
    }
    setLoadingDeleteCat(false)
    setDeleteCatId(null)
  }

  const formatCurrency = (amount: number) => {
    const currency = store.currency_code || 'PEN'
    if (currency === 'PEN') {
      return `S/ ${amount.toFixed(2)}`
    }
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  return (
    <div className="space-y-6 font-body-base text-on-surface">
      {/* Cabecera Adaptada a Móviles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Catálogo de Productos</h1>
          <p className="text-xs md:text-sm text-on-surface-variant">Gestiona tu inventario, precios y disponibilidad.</p>
        </div>
        
        {/* Barra de herramientas adaptable */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-border-subtle">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'products' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Productos
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'categories' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Categorías
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-border-subtle">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold ${
                viewMode === 'grid' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Vista en cuadrícula"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('pos')}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold ${
                viewMode === 'pos' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Vista rápida lista POS"
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
          </div>

          <button
            onClick={() => handleOpenProductModal(null)}
            className="flex items-center justify-center gap-1.5 bg-admin-deep-blue text-on-primary px-4 py-2 rounded-xl font-bold text-xs hover:opacity-90 transition-all shadow-xs flex-1 md:flex-none"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Añadir Producto</span>
          </button>
        </div>
      </div>

      {/* PESTAÑA: PRODUCTOS (Diseño Grid o Lista POS) */}
      {activeTab === 'products' && (
        <>
          {optimisticProducts.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border border-dashed border-border-subtle rounded-lg bg-white">
              <span className="material-symbols-outlined text-[40px] text-slate-200 mx-auto mb-2 block">inventory_2</span>
              <div className="font-bold text-sm text-slate-700">No hay productos en tu catálogo</div>
              <p className="text-xs text-slate-500 mt-1">Usa el botón superior para añadir el primer producto.</p>
            </div>
          ) : viewMode === 'pos' ? (
            /* VISTA LISTA POS ESTILO KYTE */
            <div className="bg-white border border-border-subtle rounded-lg overflow-hidden shadow-sm divide-y divide-slate-100">
              {optimisticProducts.map((product) => {
                const categoryName = categories.find((c) => c.id === product.category_id)?.name || 'Sin categoría'
                return (
                  <div
                    key={product.id}
                    onClick={() => handleOpenProductModal(product)}
                    className={`p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                      !product.is_available ? 'bg-slate-50/60 opacity-75' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {product.images[0] ? (
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-slate-300 text-[20px]">image</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-primary truncate">{product.title}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{categoryName} • SKU: {product.id.slice(0, 5).toUpperCase()}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="font-bold text-xs text-slate-900">{formatCurrency(product.price)}</span>
                      
                      {/* Botón de Duplicado Rápido */}
                      <button
                        onClick={(e) => handleDuplicateProduct(product, e)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Duplicar producto"
                      >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                      </button>

                      {/* Toggle de Disponibilidad */}
                      <div 
                        className="flex items-center gap-1.5 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleProductAvailable(product.id, product.is_available)
                        }}
                      >
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          product.is_available ? 'text-emerald-600' : 'text-slate-400'
                        }`}>
                          {product.is_available ? 'En Stock' : 'Agotado'}
                        </span>
                        <div className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                          product.is_available ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                        }`}>
                          <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* VISTA GRID DE FOTOS */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {optimisticProducts.map((product) => {
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
                      
                      {/* Botón interactivo de estado rápido */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleProductAvailable(product.id, product.is_available)
                        }}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white transition-colors backdrop-blur-sm px-2.5 py-1 rounded border border-border-subtle flex items-center gap-1.5 z-10 cursor-pointer shadow-sm"
                        title={product.is_available ? "Ocultar del catálogo" : "Mostrar en catálogo"}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          product.is_available ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}></span>
                        <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">
                          {product.is_available ? 'Activo' : 'Oculto'}
                        </span>
                      </button>
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

      {/* Modal / Dialog de Producto (Crear / Editar animado) */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop oscuro con fade-in */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60" 
              onClick={() => setIsProductModalOpen(false)} 
            />
            {/* Contenedor del Modal con resorte (spring) y desplazamiento */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative bg-white rounded-xl shadow-xl border border-border-subtle max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden z-10"
            >
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-border-subtle bg-slate-50 flex-shrink-0">
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

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs font-semibold overflow-y-auto flex-1">
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

              <div className="space-y-2">
                <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider">
                  Fotos del Producto
                </label>

                {prodImageUrls.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2.5">
                    {prodImageUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center group shadow-sm">
                        <img 
                          src={url} 
                          alt={`Foto ${index + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveProductImage(index)}
                            className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow"
                            title="Eliminar esta foto"
                          >
                            <span className="material-symbols-outlined text-[16px] block">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Botón de añadir más fotos (en la grilla) */}
                    <label className={`relative aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-admin-deep-blue bg-slate-50/50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${uploadingProdImg ? 'opacity-50 pointer-events-none' : ''}`}>
                      {uploadingProdImg ? (
                        <>
                          <span className="animate-spin material-symbols-outlined text-slate-400 text-[18px]">progress_activity</span>
                          <span className="text-slate-400 text-[9px] font-bold text-center">Subiendo...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-slate-400 text-[20px]">add</span>
                          <span className="text-slate-500 font-bold text-[9px] text-center">Subir más</span>
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
                  </div>
                ) : (
                  /* Tarjeta grande si está vacío */
                  <label className={`w-full aspect-video rounded-xl border-2 border-dashed border-slate-300 hover:border-admin-deep-blue bg-slate-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${uploadingProdImg ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploadingProdImg ? (
                      <>
                        <span className="animate-spin material-symbols-outlined text-slate-400 text-[24px]">progress_activity</span>
                        <span className="text-slate-500 font-bold text-[11px]">Subiendo imagen...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-slate-400 text-[26px]">image</span>
                        <span className="text-slate-600 font-bold text-[11px]">Subir fotos del producto</span>
                        <span className="text-[10px] text-slate-400 font-medium">Formatos soportados: PNG, JPG, WEBP (Soporta múltiples)</span>
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

                {/* Input de respaldo para agregar URL manual */}
                <div className="pt-1 flex gap-2">
                  <input
                    type="text"
                    value={inputImageUrl}
                    onChange={(e) => setInputImageUrl(e.target.value)}
                    placeholder="O pega una URL de imagen..."
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-admin-deep-blue text-[10px] bg-slate-50 font-mono font-medium text-slate-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (inputImageUrl.trim()) {
                          setProdImageUrls((prev) => [...prev, inputImageUrl.trim()]);
                          setInputImageUrl('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddManualImageUrl}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md text-[10px] font-bold text-slate-700 transition-colors"
                  >
                    Agregar URL
                  </button>
                </div>
              </div>

              {/* Asignación a Catálogos */}
              {catalogs.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider">
                    Aparece en los siguientes Catálogos:
                  </label>
                  <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-2.5 space-y-2 max-h-[110px] overflow-y-auto">
                    {catalogs.map((cat) => {
                      const isChecked = prodCatalogIds.includes(cat.id)
                      return (
                        <div key={cat.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`prod_cat_${cat.id}`}
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setProdCatalogIds((prev) => [...prev, cat.id])
                              } else {
                                setProdCatalogIds((prev) => prev.filter((id) => id !== cat.id))
                              }
                            }}
                            className="rounded border-slate-300 text-slate-900 focus:ring-admin-deep-blue cursor-pointer"
                          />
                          <label htmlFor={`prod_cat_${cat.id}`} className="text-[11px] text-slate-700 font-bold cursor-pointer select-none">
                            {cat.name}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

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
                      setIsProductModalOpen(false)
                      setDeleteProdId(selectedProduct.id)
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM MODAL PRODUCTO */}
      <ConfirmModal
        isOpen={Boolean(deleteProdId)}
        title="¿Eliminar producto permanentemente?"
        description="Esta acción eliminará el producto del catálogo de tu tienda. No se podrá recuperar."
        confirmText="Sí, Eliminar Producto"
        cancelText="Cancelar"
        variant="danger"
        isLoading={loadingDeleteProd}
        onConfirm={handleConfirmDeleteProduct}
        onClose={() => setDeleteProdId(null)}
      />

      {/* CONFIRM MODAL CATEGORÍA */}
      <ConfirmModal
        isOpen={Boolean(deleteCatId)}
        title="¿Eliminar categoría?"
        description="Esta acción eliminará la categoría. Los productos asignados a ella pasarán a no tener categoría."
        confirmText="Sí, Eliminar Categoría"
        cancelText="Cancelar"
        variant="danger"
        isLoading={loadingDeleteCat}
        onConfirm={handleConfirmDeleteCategory}
        onClose={() => setDeleteCatId(null)}
      />
    </div>
  )
}
