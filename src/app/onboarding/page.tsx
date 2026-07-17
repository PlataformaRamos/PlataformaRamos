'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Logo from '@/components/marketing/Logo'
import { 
  Store, 
  Phone, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Loader2, 
  AlertCircle,
  MessageSquare,
  CheckCheck
} from 'lucide-react'

// Categorías del Paso 3
const CATEGORIES = [
  { id: 'comida', label: 'Comida y Restaurantes', emoji: '🍔', demoProduct: { name: 'Hamburguesa Suprema (Demo)', price: 15.00, desc: 'Deliciosa hamburguesa con doble carne, queso derretido, tocino crujiente y papas artesanales.', emoji: '🍔' } },
  { id: 'ropa', label: 'Ropa y Moda', emoji: '👗', demoProduct: { name: 'Polera Oversize Algodón (Demo)', price: 69.90, desc: 'Polera de algodón reactivo con corte oversize ideal para toda temporada.', emoji: '👗' } },
  { id: 'minimarket', label: 'Minimarket y Abarrotes', emoji: '🛒', demoProduct: { name: 'Pack de Snacks & Bebidas (Demo)', price: 12.50, desc: 'Pack especial de snacks seleccionados para disfrutar en cualquier momento.', emoji: '🛒' } },
  { id: 'reposteria', label: 'Repostería y Pastelería', emoji: '🍰', demoProduct: { name: 'Torta Tres Leches Familiar (Demo)', price: 45.00, desc: 'Torta húmeda tres leches con decoración premium de chantilly y canela.', emoji: '🍰' } },
  { id: 'tecnologia', label: 'Tecnología y Gadgets', emoji: '🔌', demoProduct: { name: 'Audífonos Inalámbricos (Demo)', price: 89.00, desc: 'Audífonos inalámbricos de alta definición con cancelación de ruido pasiva.', emoji: '🔌' } },
  { id: 'belleza', label: 'Belleza y Cuidado Personal', emoji: '💄', demoProduct: { name: 'Kit de Cuidado Facial (Demo)', price: 34.90, desc: 'Kit básico con suero de ácido hialurónico y crema hidratante natural.', emoji: '💄' } },
  { id: 'regalos', label: 'Regalos y Detalles', emoji: '🎁', demoProduct: { name: 'Caja de Rosas & Chocolates (Demo)', price: 55.00, desc: 'Arreglo floral premium con rosas rojas seleccionadas y chocolates finos.', emoji: '🎁' } },
  { id: 'otros', label: 'Otros Rubros', emoji: '📦', demoProduct: { name: 'Artículo de Muestra (Demo)', price: 10.00, desc: 'Este es un producto de demostración. Puedes editarlo o borrarlo desde tu panel.', emoji: '📦' } },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  // Estados del asistente
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  // Paso 1: Nombre y Slug
  const [storeName, setStoreName] = useState('')
  const [storeSlug, setStoreSlug] = useState('')
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)

  // Paso 2: WhatsApp
  const [whatsappPhone, setWhatsappPhone] = useState('')

  // Paso 3: Categoría
  const [selectedCategory, setSelectedCategory] = useState('')

  // 1. Obtener usuario al cargar la página
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUserId(user.id)
        setUserEmail(user.email || null)
        
        // Verificar si ya tiene una tienda configurada de forma segura
        const { data: existingStore } = await supabase
          .from('stores')
          .select('id, slug, whatsapp_phone, category')
          .eq('owner_id', user.id)
          .single()

        if (existingStore && existingStore.slug && existingStore.whatsapp_phone && existingStore.category) {
          router.push('/dashboard')
        }
      }
    }
    checkUser()
  }, [router, supabase])

  // 2. Autogenerar y validar slug en tiempo real al escribir el nombre
  useEffect(() => {
    if (!storeName.trim()) {
      setStoreSlug('')
      setSlugAvailable(null)
      return
    }

    // Formatear el slug: minúsculas, remover acentos, cambiar espacios y caracteres raros por guión
    const generatedSlug = storeName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .trim()
      .replace(/\s+/g, '-') // Cambiar espacios por guión
      .replace(/-+/g, '-') // Evitar múltiples guiones seguidos

    setStoreSlug(generatedSlug)

    // Consultar disponibilidad asíncrona con un pequeño debounce
    const timer = setTimeout(async () => {
      if (!generatedSlug) return
      setSlugChecking(true)
      try {
        const { data } = await supabase
          .from('stores')
          .select('id')
          .eq('slug', generatedSlug)
          .maybeSingle()

        setSlugAvailable(data === null)
      } catch (err) {
        console.error('Error al comprobar disponibilidad del enlace:', err)
      } finally {
        setSlugChecking(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [storeName, supabase])

  const handleNextStep = () => {
    if (step === 1 && (!storeSlug || !slugAvailable)) return
    if (step === 2 && whatsappPhone.replace(/\D/g, '').length < 9) return
    setStep((prev) => prev + 1)
  }

  const handlePrevStep = () => {
    setStep((prev) => prev - 1)
  }

  const handleComplete = async () => {
    if (!userId || !selectedCategory) return
    setLoading(true)
    setGlobalError(null)

    try {
      const cleanPhone = whatsappPhone.replace(/\D/g, '')
      const finalPhone = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`

      // 1. Crear tienda
      const { data: newStore, error: storeError } = await supabase
        .from('stores')
        .insert({
          name: storeName.trim(),
          slug: storeSlug,
          whatsapp_phone: finalPhone,
          category: selectedCategory,
          owner_id: userId,
        })
        .select()
        .single()

      if (storeError) {
        throw new Error(storeError.message || 'Error al guardar los datos de tu tienda.')
      }

      // 2. Insertar producto demo adaptado a la categoría elegida
      const categoryData = CATEGORIES.find(c => c.id === selectedCategory)
      const demoProd = categoryData?.demoProduct || {
        name: 'Artículo de Muestra (Demo)',
        price: 10.00,
        desc: 'Este es un producto de demostración.',
        emoji: '📦'
      }

      const { error: prodError } = await supabase
        .from('products')
        .insert({
          store_id: newStore.id,
          name: demoProd.name,
          description: demoProd.desc,
          price: demoProd.price,
          status: 'active',
          images: [], // Sin imagen real para el demo, usamos un placeholder o emoji en el listado
        })

      if (prodError) {
        console.error('Error al insertar producto demo:', prodError)
      }

      // Redirigir al dashboard
      window.location.href = '/dashboard'

    } catch (err: any) {
      console.error('Error al completar onboarding:', err)
      setGlobalError(err.message || 'Ocurrió un error inesperado al configurar tu cuenta.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden select-none">
      
      {/* Glows y Luces de Fondo */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-600/[0.03] rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[300px] h-[300px] bg-red-600/[0.03] rounded-full blur-[80px] pointer-events-none" />

      {/* Caja contenedora principal */}
      <div className="w-full max-w-xl bg-white border border-slate-200/80 rounded-[32px] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative z-10">
        
        {/* Cabecera / Identidad */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-1.5 group mb-3.5">
            <Logo size={28} />
            <span className="font-black text-base tracking-tight flex items-center gap-1">
              <span className="text-[#EF4444]">Plataforma</span>
              <span className="text-[#3B82F6]">Ramos</span>
            </span>
          </div>

          {/* Barra de progreso de pasos */}
          <div className="flex items-center gap-2 w-full max-w-[180px] mt-2">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 flex-grow rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* PASO 1: NOMBRE Y ENLACE DE TIENDA */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-1.5 text-center">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Nombra tu Tienda</h1>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
                Escribe el nombre de tu negocio para autogenerar el subdominio único de tu catálogo digital.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5 text-xs font-bold">
                <label className="text-slate-700 font-bold flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-slate-400" />
                  <span>Nombre del Negocio</span>
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium text-slate-800 transition-all text-xs"
                  placeholder="Ej. Pastelería María"
                  maxLength={40}
                  required
                />
              </div>

              {/* Previsualización en Tiempo Real del Subdominio */}
              {storeSlug && (
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs font-semibold">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tu enlace sugerido</span>
                  
                  <div className="flex items-center justify-between gap-3 text-slate-800">
                    <span className="truncate font-mono text-blue-600 font-bold">
                      {storeSlug}.plataformaramos.app
                    </span>

                    {/* Estados de disponibilidad */}
                    {slugChecking ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400 flex-shrink-0" />
                    ) : slugAvailable === true ? (
                      <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>Disponible</span>
                      </div>
                    ) : slugAvailable === false ? (
                      <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>No disponible</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleNextStep}
              disabled={!storeSlug || !slugAvailable || slugChecking}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all h-11 flex items-center justify-center gap-2"
            >
              <span>Siguiente paso</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* PASO 2: WHATSAPP DE PEDIDOS */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-1.5 text-center">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">WhatsApp de Pedidos</h1>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
                Ingresa el número al que tus clientes enviarán las órdenes de compra.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5 text-xs font-bold">
                <label className="text-slate-700 font-bold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Número de Celular</span>
                </label>
                <div className="flex gap-2">
                  <span className="px-3.5 py-3 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-500 flex items-center justify-center text-xs">
                    +51 (PE)
                  </span>
                  <input
                    type="tel"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium text-slate-800 transition-all text-xs"
                    placeholder="987 654 321"
                    maxLength={9}
                    required
                  />
                </div>
              </div>

              {/* Ejemplo Didáctico de WhatsApp */}
              <div className="border border-slate-200/60 rounded-2xl overflow-hidden bg-[#efeae2]">
                <div className="bg-[#075E54] text-white px-3.5 py-2.5 flex items-center gap-2">
                  <div className="w-6.5 h-6.5 rounded-full bg-slate-500 text-white flex items-center justify-center font-black text-[9px] select-none">
                    MM
                  </div>
                  <div className="min-w-0 flex-grow">
                    <div className="text-[10px] font-extrabold truncate">Martín Maldonado (Cliente)</div>
                    <div className="text-[7px] text-emerald-300">En línea</div>
                  </div>
                  <MessageSquare className="w-3 h-3 text-white/80" />
                </div>
                
                <div className="p-3 text-[9px] leading-normal">
                  <div className="max-w-[90%] bg-white rounded-2xl rounded-tl-none p-2.5 shadow-sm border border-slate-200/25 space-y-1 animate-in zoom-in-95 duration-200">
                    <p className="font-semibold text-slate-800 whitespace-pre-line font-mono text-[8.5px]">
                      *Nuevo Pedido de {storeName || 'Mi Tienda'}* 📝
                      {"\n"}----------------------------------
                      {"\n"}• 1x Producto de Prueba (S/ 15.00)
                      {"\n"}
                      {"\n"}*Total:* S/ 15.00
                      {"\n"}
                      {"\n"}*Datos de Entrega:*
                      {"\n"}• Cliente: Martín Maldonado
                      {"\n"}• Dirección: Av. Arequipa 1230, Lima
                    </p>
                    <div className="flex justify-end items-center gap-0.5 text-[6.5px] text-slate-400 font-bold">
                      <span>12:00 PM</span>
                      <CheckCheck className="w-2.5 h-2.5 text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handlePrevStep}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all h-11 flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </Button>
              <Button
                onClick={handleNextStep}
                disabled={whatsappPhone.replace(/\D/g, '').length < 9}
                className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all h-11 flex items-center justify-center gap-2"
              >
                <span>Siguiente paso</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* PASO 3: CATEGORÍA DEL NEGOCIO */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-1.5 text-center">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Rubro del Negocio</h1>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
                Selecciona la categoría de tu tienda para configurar automáticamente tu primer producto de demostración personalizado.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3.5 border rounded-2xl text-left flex flex-col justify-between h-[84px] transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-500/5'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl select-none">{cat.emoji}</span>
                  <span className="text-[10px] font-bold text-slate-800 leading-tight">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>

            {globalError && (
              <div className="p-3.5 bg-red-50 border border-red-200/50 rounded-xl text-red-600 text-xs font-semibold flex gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{globalError}</span>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handlePrevStep}
                disabled={loading}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all h-11 flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!selectedCategory || loading}
                className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all h-11 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Configurando...</span>
                  </>
                ) : (
                  <>
                    <span>Completar Configuración</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
