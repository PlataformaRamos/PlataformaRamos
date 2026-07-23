'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Plus, Edit2, Trash2, Globe, Check, AlertCircle, Sparkles, X, Share2, BookOpen } from 'lucide-react'
import ConfirmModal from '@/components/ui/ConfirmModal'

interface Catalog {
  id: string
  store_id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  is_default: boolean
  created_at: string
}

interface Product {
  id: string
  name: string
  price: number
  status: string
}

interface CatalogRelation {
  catalog_id: string
  product_id: string
}

interface CatalogsClientProps {
  store: {
    id: string
    name: string
    slug: string
  }
  initialCatalogs: Catalog[]
  products: Product[]
  initialRelations: CatalogRelation[]
}

export default function CatalogsClient({ store, initialCatalogs, products, initialRelations }: CatalogsClientProps) {
  const [catalogs, setCatalogs] = useState<Catalog[]>(initialCatalogs)
  const [relations, setRelations] = useState<CatalogRelation[]>(initialRelations)
  
  // Modal de Crear/Editar Catálogo
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null)
  
  // Campos del formulario
  const [catName, setCatName] = useState('')
  const [catSlug, setCatSlug] = useState('')
  const [catDesc, setCatDesc] = useState('')
  const [catActive, setCatActive] = useState(true)
  const [catDefault, setCatDefault] = useState(false)
  const [selectedProdIds, setSelectedProdIds] = useState<string[]>([])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'

  // Bloquear el scroll de la página de fondo cuando el modal de catálogo está abierto
  React.useEffect(() => {
    if (isModalOpen) {
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
  }, [isModalOpen])

  // Generar slug automáticamente al cambiar el nombre
  const handleNameChange = (nameVal: string) => {
    setCatName(nameVal)
    if (!selectedCatalog) {
      const generatedSlug = nameVal
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
        .trim()
        .replace(/\s+/g, '-') // Cambiar espacios por guión
        .replace(/-+/g, '-') // Evitar múltiples guiones
      setCatSlug(generatedSlug)
    }
  }

  // Abrir modal para crear
  const handleOpenCreateModal = () => {
    setSelectedCatalog(null)
    setCatName('')
    setCatSlug('')
    setCatDesc('')
    setCatActive(true)
    setCatDefault(false)
    setSelectedProdIds([])
    setError(null)
    setIsModalOpen(true)
  }

  // Abrir modal para editar
  const handleOpenEditModal = (catalog: Catalog) => {
    setSelectedCatalog(catalog)
    setCatName(catalog.name)
    setCatSlug(catalog.slug)
    setCatDesc(catalog.description || '')
    setCatActive(catalog.is_active)
    setCatDefault(catalog.is_default)
    
    // Obtener los productos asociados a este catálogo
    const prodIds = relations
      .filter((r) => r.catalog_id === catalog.id)
      .map((r) => r.product_id)
    setSelectedProdIds(prodIds)
    
    setError(null)
    setIsModalOpen(true)
  }

  // Alternar selección de producto
  const handleToggleProduct = (productId: string) => {
    setSelectedProdIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  // Guardar catálogo en base de datos
  const handleSaveCatalog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName.trim() || !catSlug.trim()) {
      setError('El nombre y el enlace del catálogo son obligatorios.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let catalogId = selectedCatalog?.id

      if (selectedCatalog) {
        // Actualizar catálogo existente
        const { data, error: updateError } = await supabase
          .from('catalogs')
          .update({
            name: catName.trim(),
            slug: catSlug.trim(),
            description: catDesc.trim() || null,
            is_active: catActive,
            is_default: catDefault,
          })
          .eq('id', selectedCatalog.id)
          .select()
          .single()

        if (updateError) throw new Error(updateError.message)
        
        setCatalogs((prev) =>
          prev.map((c) => (c.id === selectedCatalog.id ? data : c))
        )
      } else {
        // Crear nuevo catálogo
        const { data, error: insertError } = await supabase
          .from('catalogs')
          .insert({
            store_id: store.id,
            name: catName.trim(),
            slug: catSlug.trim(),
            description: catDesc.trim() || null,
            is_active: catActive,
            is_default: catDefault,
          })
          .select()
          .single()

        if (insertError) throw new Error(insertError.message)
        
        catalogId = data.id
        setCatalogs((prev) => [data, ...prev])
      }

      // Si es marcado como default, quitar default a los demás catálogos
      if (catDefault && catalogId) {
        await supabase
          .from('catalogs')
          .update({ is_default: false })
          .eq('store_id', store.id)
          .neq('id', catalogId)
        
        setCatalogs((prev) =>
          prev.map((c) => (c.id !== catalogId ? { ...c, is_default: false } : { ...c, is_default: true }))
        )
      }

      // Actualizar relaciones muchos a muchos de productos en Supabase
      if (catalogId) {
        // 1. Borrar todas las relaciones anteriores del catálogo
        await supabase
          .from('catalog_products')
          .delete()
          .eq('catalog_id', catalogId)

        // 2. Insertar las nuevas relaciones
        if (selectedProdIds.length > 0) {
          const insertData = selectedProdIds.map((pid) => ({
            catalog_id: catalogId!,
            product_id: pid,
          }))

          const { error: relError } = await supabase
            .from('catalog_products')
            .insert(insertData)

          if (relError) throw new Error(relError.message)
        }

        // Actualizar el estado local de relaciones
        setRelations((prev) => {
          const filtered = prev.filter((r) => r.catalog_id !== catalogId)
          const added = selectedProdIds.map((pid) => ({
            catalog_id: catalogId!,
            product_id: pid,
          }))
          return [...filtered, ...added]
        })
      }

      setIsModalOpen(false)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error al guardar el catálogo. Asegúrate de que el enlace no esté repetido.')
    } finally {
      setLoading(false)
    }
  }

  // Estado ConfirmModal Eliminación Catálogo
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null)
  const [loadingDeleteCat, setLoadingDeleteCat] = useState(false)

  const triggerDeleteCatalog = (catalogId: string) => {
    setDeleteCatId(catalogId)
  }

  const handleConfirmDeleteCatalog = async () => {
    if (!deleteCatId) return
    setLoadingDeleteCat(true)

    try {
      const { error: deleteError } = await supabase
        .from('catalogs')
        .delete()
        .eq('id', deleteCatId)

      if (deleteError) throw new Error(deleteError.message)

      setCatalogs((prev) => prev.filter((c) => c.id !== deleteCatId))
      setRelations((prev) => prev.filter((r) => r.catalog_id !== deleteCatId))
    } catch (err: any) {
      console.error(err.message || 'Error al eliminar el catálogo.')
    } finally {
      setLoadingDeleteCat(false)
      setDeleteCatId(null)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Cabecera de Sección */}
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-3xl p-6.5 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Mis Catálogos</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-normal max-w-lg">
            Crea colecciones o catálogos independientes en tu tienda. Cada catálogo tiene una URL única que puedes compartir en redes para dirigir a tus clientes a grupos de productos específicos.
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs h-10 transition-all flex items-center gap-1.5 active:scale-95 shadow-md shadow-blue-600/10"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Catálogo</span>
        </Button>
      </div>

      {/* Grid de Catálogos */}
      {catalogs.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded-[32px] p-12 text-center flex flex-col items-center justify-center">
          <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-base font-bold text-slate-800">No tienes catálogos configurados</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">
            Crea tu primer catálogo de productos (ej: "Temporada de Invierno") para tener enlaces únicos y compartirlos.
          </p>
          <Button
            onClick={handleOpenCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs h-10 transition-all"
          >
            Crear mi primer Catálogo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogs.map((catalog) => {
            const catalogUrl = `https://${store.slug}.${rootDomain}/c/${catalog.slug}`
            const associatedProductsCount = relations.filter(r => r.catalog_id === catalog.id).length
            
            return (
              <div 
                key={catalog.id} 
                className={`bg-white border p-6.5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[220px] relative ${
                  catalog.is_default 
                    ? 'border-blue-500/80 bg-blue-50/5/20' 
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Badges superiores */}
                <div className="absolute top-4 right-4 flex gap-1.5">
                  {catalog.is_default && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-black rounded-md uppercase tracking-wider">
                      Predeterminado
                    </span>
                  )}
                  <span className={`px-2 py-0.5 text-[8px] font-black rounded-md uppercase tracking-wider ${
                    catalog.is_active 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {catalog.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="space-y-3.5 pr-20">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {catalog.name}
                    </h3>
                    <p className="text-[10px] font-mono text-blue-600 font-bold mt-0.5 truncate">
                      /c/{catalog.slug}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                    {catalog.description || 'Sin descripción.'}
                  </p>
                </div>

                <div className="pt-5 border-t border-slate-100 flex flex-col gap-3 mt-4">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span>{associatedProductsCount} productos</span>
                    <a 
                      href={catalogUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Copiar Enlace</span>
                    </a>
                  </div>
                  
                  <div className="flex gap-2 justify-end pt-1">
                    <Button
                      onClick={() => handleOpenEditModal(catalog)}
                      variant="outline"
                      className="h-8 text-[10px] font-bold border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1 px-3.5 rounded-lg"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </Button>
                    <Button
                      onClick={() => triggerDeleteCatalog(catalog.id)}
                      variant="ghost"
                      className="h-8 text-[10px] font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center gap-1 px-3.5 rounded-lg"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                      <span>Eliminar</span>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Crear / Editar Catálogo (Framer Motion Drawer) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Formulario Lateral */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10"
            >
              
              {/* Header Modal */}
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    {selectedCatalog ? 'Editar Catálogo' : 'Crear Catálogo Nuevo'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                    {selectedCatalog ? 'Actualiza los datos del catálogo' : 'Define un nuevo catálogo'}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSaveCatalog} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-semibold leading-normal">
                {error && (
                  <div className="p-3.5 bg-red-50 border border-red-200/50 rounded-xl text-red-600 font-semibold flex gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Nombre */}
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold">Nombre del Catálogo</label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium text-slate-800 transition-all text-xs"
                    placeholder="Ej. Colección de Verano"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold">Enlace del Catálogo (Slug)</label>
                  <div className="flex items-center">
                    <span className="bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl px-3 py-2.5 text-slate-400 text-xs font-medium">
                      /c/
                    </span>
                    <input
                      type="text"
                      value={catSlug}
                      onChange={(e) => setCatSlug(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium text-slate-800 transition-all text-xs"
                      placeholder="coleccion-verano"
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold">Descripción (Opcional)</label>
                  <textarea
                    rows={2}
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium text-slate-800 transition-all text-xs"
                    placeholder="Breve descripción del catálogo..."
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Catálogo Activo</div>
                      <div className="text-[10px] text-slate-400 font-medium">Visible para los clientes en la web</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={catActive}
                      onChange={(e) => setCatActive(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Catálogo por Defecto</div>
                      <div className="text-[10px] text-slate-400 font-medium">Se muestra al entrar a la tienda principal</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={catDefault}
                      onChange={(e) => setCatDefault(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Selección de Productos */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-700 font-bold">Asignar Productos ({selectedProdIds.length} seleccionados)</label>
                  </div>

                  {products.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      No hay productos registrados en tu tienda aún.
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {products.map((prod) => {
                        const isChecked = selectedProdIds.includes(prod.id)
                        return (
                          <div
                            key={prod.id}
                            onClick={() => handleToggleProduct(prod.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                              isChecked
                                ? 'bg-blue-50/60 border-blue-200'
                                : 'bg-white border-slate-100 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <div className="flex-grow min-w-0">
                              <div className="font-bold text-slate-800 text-[11px] truncate">{prod.name}</div>
                              <div className="text-[9.5px] text-slate-400 font-medium">S/ {prod.price.toFixed(2)}</div>
                            </div>
                            <span className={`px-2 py-0.5 text-[7px] font-black rounded-md uppercase tracking-wider ${
                              prod.status === 'active' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {prod.status === 'active' ? 'Disponible' : 'Sin Stock'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Botones de acción del Modal */}
                <div className="pt-4 border-t border-slate-100 flex gap-3 sticky bottom-0 bg-white pb-2">
                  <Button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={loading}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all h-11"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all h-11 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4.5 h-4.5 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <span>Guardar Cambios</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM MODAL ELIMINAR CATÁLOGO */}
      <ConfirmModal
        isOpen={Boolean(deleteCatId)}
        title="¿Eliminar catálogo permanentemente?"
        description="Esta acción eliminará el catálogo y deshabilitará su enlace público. Los productos asociados se conservarán en tu tienda."
        confirmText="Sí, Eliminar Catálogo"
        cancelText="Cancelar"
        variant="danger"
        isLoading={loadingDeleteCat}
        onConfirm={handleConfirmDeleteCatalog}
        onClose={() => setDeleteCatId(null)}
      />
    </div>
  )
}
