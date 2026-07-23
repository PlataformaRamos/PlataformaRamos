'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Member {
  id: string
  email: string
  role: string
  status: string
}

interface SettingsClientProps {
  store: {
    id: string
    name: string
    slug: string
    custom_domain: string | null
    whatsapp_phone: string
    currency_code: string
    template_name: string
    theme_settings: any
    show_decimals: boolean
    show_canceled_orders: string
    collect_sales_tax: boolean
    sales_tax_rate: number
    custom_order_statuses: any[]
    receipt_settings: any
    payment_settings: any
    delivery_settings: any
    logo_url: string | null
  }
  members: Member[]
  isCollaborator: boolean
  collaboratorRole: string
}

export default function SettingsClient({ store, members, isCollaborator, collaboratorRole }: SettingsClientProps) {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'sales' | 'receipt' | 'payments' | 'delivery' | 'team'>('general')
  const supabase = createClient()
  const router = useRouter()

  // 1. Estados General
  const [storeName, setStoreName] = useState(store.name)
  const [storeSlug, setStoreSlug] = useState(store.slug)
  const [storePhone, setStorePhone] = useState(store.whatsapp_phone)
  const [logoUrl, setLogoUrl] = useState(store.logo_url || '')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [showDecimals, setShowDecimals] = useState(store.show_decimals)
  const [showCanceledOrders, setShowCanceledOrders] = useState(store.show_canceled_orders)
  const [primaryColor, setPrimaryColor] = useState(store.theme_settings?.primaryColor || '#3B82F6')
  const [bannerUrl, setBannerUrl] = useState(store.theme_settings?.bannerUrl || '')
  const [bannerTitle, setBannerTitle] = useState(store.theme_settings?.bannerTitle || '')
  const [bannerSubtitle, setBannerSubtitle] = useState(store.theme_settings?.bannerSubtitle || '')
  const [promoText, setPromoText] = useState(store.theme_settings?.promoText || '')
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [currencyCode, setCurrencyCode] = useState(store.currency_code || 'PEN')

  // 2. Estados Pedidos y Ventas
  const [collectSalesTax, setCollectSalesTax] = useState(store.collect_sales_tax)
  const [salesTaxRate, setSalesTaxRate] = useState(store.sales_tax_rate.toString())
  const [orderStatuses, setOrderStatuses] = useState<any[]>(store.custom_order_statuses)

  // 3. Estados Recibo
  const [receiptHeader, setReceiptHeader] = useState(store.receipt_settings?.header_text || '')
  const [receiptFooter, setReceiptFooter] = useState(store.receipt_settings?.footer_text || '')
  const [receiptNotes, setReceiptNotes] = useState(store.receipt_settings?.receipt_notes || '')
  const [showCustInfo, setShowCustInfo] = useState(store.receipt_settings?.show_customer_info || false)
  const [showProdCode, setShowProdCode] = useState(store.receipt_settings?.show_product_code || false)

  // 4. Estados Pagos
  const [allowPayLater, setAllowPayLater] = useState(store.payment_settings?.allow_pay_later ?? true)
  const [storeCreditEnabled, setStoreCreditEnabled] = useState(store.payment_settings?.store_credit_enabled ?? true)

  // 5. Estados Entrega/Recogida
  const [allowPickup, setAllowPickup] = useState(store.delivery_settings?.allow_pickup ?? true)
  const [allowDelivery, setAllowDelivery] = useState(store.delivery_settings?.allow_delivery ?? true)

  // 6. Estados Equipo
  const [teamMembers, setTeamMembers] = useState<Member[]>(members)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('editor')
  const [loadingTeam, setLoadingTeam] = useState(false)

  // Estado de guardado global
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const isUserAdmin = !isCollaborator || collaboratorRole === 'admin'

  // Subir logo de la tienda a Cloudflare R2
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('path', `stores/${store.id}/logo`)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al subir la imagen')
      }

      setLogoUrl(data.url)
      setSuccessMsg('Logo subido correctamente (recuerda guardar los ajustes para confirmar).')
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al subir el logo.')
    } finally {
      setUploadingLogo(false)
    }
  }

  // Subir Banner Promocional a Cloudflare R2
  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingBanner(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('path', `stores/${store.id}/banner`)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al subir la imagen del banner')
      }

      setBannerUrl(data.url)
      setSuccessMsg('Banner cargado correctamente (recuerda guardar los ajustes para confirmar).')
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al subir el banner.')
    } finally {
      setUploadingBanner(false)
    }
  }

  // Guardar Cambios Generales, Ventas, Recibo, Pagos y Envíos
  const handleSaveSettings = async () => {
    setSaving(true)
    setSuccessMsg(null)
    setErrorMsg(null)

    // Validar slug
    const finalSlug = storeSlug.trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    const cleanPhone = storePhone.replace(/\s+/g, '')
    if (!/^\+[1-9]\d{1,14}$/.test(cleanPhone)) {
      setErrorMsg('El WhatsApp de contacto debe tener un formato internacional válido sin espacios (Ej. +51982432561).')
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from('stores')
      .update({
        name: storeName.trim(),
        slug: finalSlug,
        whatsapp_phone: cleanPhone,
        logo_url: logoUrl || null,
        show_decimals: showDecimals,
        show_canceled_orders: showCanceledOrders,
        theme_settings: {
          primaryColor,
          bannerUrl,
          bannerTitle: bannerTitle.trim(),
          bannerSubtitle: bannerSubtitle.trim(),
          promoText: promoText.trim(),
        },
        currency_code: currencyCode,
        collect_sales_tax: collectSalesTax,
        sales_tax_rate: parseFloat(salesTaxRate) || 0,
        custom_order_statuses: orderStatuses,
        receipt_settings: {
          header_text: receiptHeader.trim(),
          footer_text: receiptFooter.trim(),
          receipt_notes: receiptNotes.trim(),
          show_customer_info: showCustInfo,
          show_product_code: showProdCode,
        },
        payment_settings: {
          allow_pay_later: allowPayLater,
          store_credit_enabled: storeCreditEnabled,
        },
        delivery_settings: {
          allow_pickup: allowPickup,
          allow_delivery: allowDelivery,
        }
      })
      .eq('id', store.id)

    if (error) {
      setErrorMsg(error.message)
    } else {
      setSuccessMsg('Ajustes guardados con éxito.')
      setStoreSlug(finalSlug)
      setStorePhone(cleanPhone)
      // Actualización transparente SPA de la interfaz y del sidebar sin recargar la ventana
      router.refresh()
    }
    setSaving(false)
  }

  // Invitar miembro al equipo
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberEmail.trim()) return

    setLoadingTeam(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const { data, error } = await supabase
      .from('store_members')
      .insert({
        store_id: store.id,
        email: newMemberEmail.trim().toLowerCase(),
        role: newMemberRole,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      setErrorMsg(error.message)
    } else if (data) {
      setTeamMembers((prev) => [...prev, data])
      setNewMemberEmail('')
      setSuccessMsg('Invitación de equipo enviada.')
    }
    setLoadingTeam(false)
  }

  // Eliminar miembro del equipo
  const handleDeleteMember = async (memberId: string) => {
    const { error } = await supabase
      .from('store_members')
      .delete()
      .eq('id', memberId)

    if (!error) {
      setTeamMembers((prev) => prev.filter((m) => m.id !== memberId))
      setSuccessMsg('Miembro revocado con éxito.')
    }
  }

  return (
    <div className="space-y-6 font-body-base text-on-surface">
      {/* Cabecera (Diseño de Stitch) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface">Ajustes del Negocio</h2>
          <p className="text-sm text-on-surface-variant mt-1">Configura los parámetros estéticos, fiscales, de facturación y equipo.</p>
        </div>

        {/* Guardado */}
        {activeSubTab !== 'team' && (
          <button
            onClick={handleSaveSettings}
            disabled={saving || !isUserAdmin}
            className="px-5 py-2.5 bg-admin-deep-blue text-on-primary rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            <span>{saving ? 'Guardando...' : 'Guardar Ajustes'}</span>
          </button>
        )}
      </div>

      {/* Alertas */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid de Pestañas y Formulario (Diseño de Stitch) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar de Ajustes */}
        <div className="bg-white border border-border-subtle rounded-xl p-3 h-fit flex flex-col space-y-1 shadow-sm">
          {[
            { id: 'general', label: 'General', icon: 'store' },
            { id: 'sales', label: 'Pedidos y Ventas', icon: 'receipt_long' },
            { id: 'receipt', label: 'Impresión de Recibo', icon: 'print' },
            { id: 'payments', label: 'Métodos de Pago', icon: 'payments' },
            { id: 'delivery', label: 'Entrega y Recogida', icon: 'local_shipping' },
            { id: 'team', label: 'Equipo y Permisos', icon: 'group' },
          ].map((tab) => {
            const active = activeSubTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as any)
                  setSuccessMsg(null)
                  setErrorMsg(null)
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? 'text-secondary bg-secondary-container/10 font-bold opacity-90'
                    : 'text-on-surface-variant hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Formulario / Configuración de la Pestaña */}
        <div className="lg:col-span-3 bg-white border border-border-subtle rounded-xl shadow-sm p-6 lg:p-8">
          
          {/* 1. AJUSTES GENERALES (Diseño: ajustes_de_tienda_refinado) */}
          {activeSubTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Identificación y Aspecto</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Datos públicos de tu comercio e identidad de marca.</p>
              </div>

              {/* Cargador de Logo */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row items-center gap-5">
                <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center relative flex-shrink-0 group">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo de la tienda" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-slate-400 uppercase">{storeName.charAt(0)}</span>
                  )}
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px] font-bold">
                      Subiendo...
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 text-center sm:text-left">
                  <h4 className="font-bold text-slate-800 text-sm">Logo del Comercio</h4>
                  <p className="text-[11px] text-slate-500 font-medium max-w-sm">Recomendado: Imagen cuadrada (PNG o JPG) de al menos 200x200px.</p>
                  <div className="flex gap-2 justify-center sm:justify-start items-center pt-1">
                    <label className={`px-4 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-700 hover:border-slate-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${!isUserAdmin || uploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className="material-symbols-outlined text-[16px]">upload</span>
                      <span>Subir Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadLogo}
                        className="hidden"
                        disabled={!isUserAdmin || uploadingLogo}
                      />
                    </label>
                    {logoUrl && (
                      <button
                        onClick={() => setLogoUrl('')}
                        type="button"
                        className="px-3 py-2 border border-red-100 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-1.5 shadow-sm"
                        disabled={!isUserAdmin}
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span>Eliminar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider">Nombre del Negocio</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-admin-deep-blue text-xs font-medium"
                    disabled={!isUserAdmin}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider">Slug de la Tienda (URL pública)</label>
                  <input
                    type="text"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-admin-deep-blue text-xs font-mono font-medium bg-slate-50"
                    disabled={!isUserAdmin}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider">WhatsApp de contacto (E.164)</label>
                  <input
                    type="text"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    placeholder="+5491122334455"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-admin-deep-blue text-xs font-medium"
                    disabled={!isUserAdmin}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider">Color Primario de Tienda</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded cursor-pointer p-0 bg-transparent"
                      disabled={!isUserAdmin}
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-admin-deep-blue text-xs font-mono font-medium"
                      disabled={!isUserAdmin}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider">Divisa de la Tienda (Moneda)</label>
                  <select
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-admin-deep-blue text-xs font-medium bg-white"
                    disabled={!isUserAdmin}
                  >
                    <option value="PEN">Soles Peruanos (S/.)</option>
                    <option value="USD">Dólares Americanos ($)</option>
                  </select>
                </div>
              </div>

              {/* Sección Personalizada: Banner Hero y Promociones */}
              <div className="pt-6 border-t border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600 text-[20px]">view_carousel</span>
                      <span>Personalización de Banner Hero y Promociones</span>
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">Diseña la portada promocional y anuncios superiores de tu tienda pública.</p>
                  </div>
                </div>

                {/* Subir Banner de Portada */}
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:w-48 h-24 rounded-xl bg-slate-900 border border-slate-700 shadow-sm overflow-hidden relative flex items-center justify-center text-white flex-shrink-0 group">
                      {bannerUrl ? (
                        <img src={bannerUrl} alt="Banner Hero" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-2">
                          <span className="material-symbols-outlined text-slate-400 text-[24px]">image</span>
                          <span className="block text-[10px] text-slate-400 font-bold">Sin Portada</span>
                        </div>
                      )}
                      {uploadingBanner && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold">
                          Subiendo...
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <h5 className="font-bold text-slate-800 text-xs">Imagen de Portada / Banner Hero</h5>
                      <p className="text-[11px] text-slate-500 font-medium">Recomendado: Imagen panorámica (1200x400px). Se mostrará en la parte superior de tu catálogo.</p>
                      <div className="flex gap-2 pt-1">
                        <label className={`px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-700 hover:border-slate-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${!isUserAdmin || uploadingBanner ? 'opacity-50 pointer-events-none' : ''}`}>
                          <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                          <span>Subir Portada</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadBanner}
                            className="hidden"
                            disabled={!isUserAdmin || uploadingBanner}
                          />
                        </label>
                        {bannerUrl && (
                          <button
                            onClick={() => setBannerUrl('')}
                            type="button"
                            className="px-3 py-1.5 border border-red-100 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-1"
                            disabled={!isUserAdmin}
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            <span>Eliminar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs font-semibold">
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-600 uppercase tracking-wider">Título Principal del Banner</label>
                      <input
                        type="text"
                        value={bannerTitle}
                        onChange={(e) => setBannerTitle(e.target.value)}
                        placeholder="Ej: 🎉 ¡Gran Venta de Temporada!"
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                        disabled={!isUserAdmin}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-600 uppercase tracking-wider">Barra de Anuncio Promocional (Top Bar)</label>
                      <input
                        type="text"
                        value={promoText}
                        onChange={(e) => setPromoText(e.target.value)}
                        placeholder="Ej: 🚀 ¡Envíos gratis por compras mayores a S/100!"
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                        disabled={!isUserAdmin}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-[10px] text-slate-600 uppercase tracking-wider">Subtítulo / Descripción del Banner</label>
                      <input
                        type="text"
                        value={bannerSubtitle}
                        onChange={(e) => setBannerSubtitle(e.target.value)}
                        placeholder="Ej: Los mejores productos directo a tu hogar. Paga contra entrega o por Yape/Plin."
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs"
                        disabled={!isUserAdmin}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border-subtle space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">smartphone</span>
                  <span>Simulador en Tiempo Real (Live Preview de tu Tienda)</span>
                </h4>
                <p className="text-xs text-slate-500 font-medium">Así es como verán tus clientes el encabezado y botón de compra de tu tienda en celulares:</p>
                
                {/* Mockup de Previsualización en Vivo */}
                <div className="bg-slate-900 p-4 rounded-2xl max-w-sm mx-auto shadow-xl border border-slate-800 text-white space-y-4 transition-all">
                  {/* Encabezado Simulado */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs overflow-hidden border border-white/20">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <span>{storeName.charAt(0) || 'T'}</span>
                        )}
                      </div>
                      <span className="font-bold text-xs truncate max-w-[150px]">{storeName || 'Nombre de tu Tienda'}</span>
                    </div>
                    <div 
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm flex items-center gap-1"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <span className="material-symbols-outlined text-[12px]">shopping_bag</span>
                      <span>Carrito</span>
                    </div>
                  </div>

                  {/* Tarjeta de Producto Simulada */}
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-2">
                    <div className="h-24 bg-slate-700/60 rounded-lg flex items-center justify-center text-slate-500 font-mono text-[10px]">
                      [Foto de tu producto]
                    </div>
                    <div className="font-bold text-xs text-white">Producto de Muestra</div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="font-bold text-xs text-slate-300">
                        {currencyCode === 'PEN' ? 'S/' : '$'} {showDecimals ? '45.00' : '45'}
                      </span>
                      <button 
                        type="button"
                        className="px-3 py-1.5 rounded text-[10px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PEDIDOS Y VENTAS (Diseño: ajustes_pedidos_y_ventas_refinado) */}
          {activeSubTab === 'sales' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Pedidos y Ventas</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Controla las reglas de impuestos y los estados del flujo de pedidos.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-surface border border-border-subtle rounded-lg space-y-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={collectSalesTax}
                      onChange={(e) => setCollectSalesTax(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-admin-deep-blue"
                      disabled={!isUserAdmin}
                    />
                    <span className="text-xs text-slate-700 font-bold">Cobrar impuestos a las ventas (IVA / Sales Tax)</span>
                  </label>

                  {collectSalesTax && (
                    <div className="space-y-1.5 max-w-xs font-semibold text-xs">
                      <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider">Tasa de impuesto (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={salesTaxRate}
                        onChange={(e) => setSalesTaxRate(e.target.value)}
                        placeholder="16"
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-admin-deep-blue text-xs font-medium"
                        disabled={!isUserAdmin}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-border-subtle">
                  <h4 className="font-bold text-slate-900 text-sm">Visualización de Historial</h4>
                  <div className="space-y-1.5 max-w-sm font-semibold text-xs">
                    <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider">Mostrar pedidos cancelados en historial</label>
                    <select
                      value={showCanceledOrders}
                      onChange={(e) => setShowCanceledOrders(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-admin-deep-blue text-xs font-medium bg-white"
                      disabled={!isUserAdmin}
                    >
                      <option value="show">Mostrar siempre en el listado</option>
                      <option value="hide">Ocultar pedidos cancelados por defecto</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. IMPRESIÓN DE RECIBO (Diseño: ajustes_recibo) */}
          {activeSubTab === 'receipt' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Estructura del Recibo</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Configura los cabezales y notas legales impresas en el ticket PDF / WhatsApp.</p>
              </div>

              <div className="space-y-5 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider">Texto de Cabecera (Header)</label>
                  <textarea
                    value={receiptHeader}
                    onChange={(e) => setReceiptHeader(e.target.value)}
                    placeholder="Ej. ¡Gracias por preferirnos! NIT: 12345-A"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-admin-deep-blue text-xs font-medium bg-white"
                    rows={2}
                    disabled={!isUserAdmin}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider">Texto del Pie (Footer)</label>
                  <textarea
                    value={receiptFooter}
                    onChange={(e) => setReceiptFooter(e.target.value)}
                    placeholder="Ej. Conserve este ticket para devoluciones."
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-admin-deep-blue text-xs font-medium bg-white"
                    rows={2}
                    disabled={!isUserAdmin}
                  />
                </div>

                <div className="space-y-3 pt-4 border-t border-border-subtle">
                  <h4 className="font-bold text-slate-900 text-sm">Información Incluida</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showCustInfo}
                        onChange={(e) => setShowCustInfo(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-admin-deep-blue"
                        disabled={!isUserAdmin}
                      />
                      <span className="text-xs text-slate-700 font-bold">Incluir datos del cliente en el recibo (WhatsApp, Nombre)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showProdCode}
                        onChange={(e) => setShowProdCode(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-admin-deep-blue"
                        disabled={!isUserAdmin}
                      />
                      <span className="text-xs text-slate-700 font-bold">Mostrar códigos SKU / IDs de productos en las filas</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. MÉTODOS DE PAGO (Diseño: ajustes_pagos) */}
          {activeSubTab === 'payments' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Métodos de Pago</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Habilita o restringe las formas de liquidación al checkout.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-surface border border-border-subtle rounded-lg space-y-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allowPayLater}
                      onChange={(e) => setAllowPayLater(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-admin-deep-blue"
                      disabled={!isUserAdmin}
                    />
                    <span className="text-xs text-slate-700 font-bold">Habilitar "Pagar al Recibir" (Efectivo / Transferencia local)</span>
                  </label>
                  <p className="text-[10px] text-on-surface-variant leading-normal pl-6">
                    Permite al cliente realizar su pedido y coordinar el pago directamente con el vendedor por WhatsApp.
                  </p>
                </div>

                <div className="p-4 bg-surface border border-border-subtle rounded-lg space-y-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={storeCreditEnabled}
                      onChange={(e) => setStoreCreditEnabled(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-admin-deep-blue"
                      disabled={!isUserAdmin}
                    />
                    <span className="text-xs text-slate-700 font-bold">Habilitar Crédito de Tienda (Cuentas Corrientes)</span>
                  </label>
                  <p className="text-[10px] text-on-surface-variant leading-normal pl-6">
                    Opción especial para que clientes VIP o corporativos puedan dejar saldos pendientes a cuenta.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5. ENTREGA Y RECOGIDA (Diseño: ajustes_recogida_y_entrega) */}
          {activeSubTab === 'delivery' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Métodos de Entrega</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Controla la logística de retiro y envío a domicilio.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-surface border border-border-subtle rounded-lg space-y-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allowPickup}
                      onChange={(e) => setAllowPickup(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-admin-deep-blue"
                      disabled={!isUserAdmin}
                    />
                    <span className="text-xs text-slate-700 font-bold">Habilitar Retiro en Tienda (Takeaway)</span>
                  </label>
                  <p className="text-[10px] text-on-surface-variant leading-normal pl-6">
                    El cliente podrá pasar a recoger sus productos al local físico sin cargos adicionales de envío.
                  </p>
                </div>

                <div className="p-4 bg-surface border border-border-subtle rounded-lg space-y-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allowDelivery}
                      onChange={(e) => setAllowDelivery(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-admin-deep-blue"
                      disabled={!isUserAdmin}
                    />
                    <span className="text-xs text-slate-700 font-bold">Habilitar Envío a Domicilio (Delivery)</span>
                  </label>
                  <p className="text-[10px] text-on-surface-variant leading-normal pl-6">
                    Se solicitará la dirección de entrega al comprador y se calcularán los precios según las reglas de envío.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 6. EQUIPO Y COLABORADORES */}
          {activeSubTab === 'team' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Equipo de Colaboradores</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Añade o remueve administradores y editores de la tienda.</p>
              </div>

              {/* Formulario de invitación */}
              {isUserAdmin && (
                <form onSubmit={handleInviteMember} className="bg-slate-50 border border-border-subtle p-4 rounded-lg flex flex-col md:flex-row items-end gap-4 text-xs font-semibold">
                  <div className="flex-1 space-y-1.5 w-full">
                    <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider">Correo Electrónico</label>
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="colaborador@correo.com"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-admin-deep-blue text-xs bg-white font-medium"
                      required
                    />
                  </div>

                  <div className="w-full md:w-48 space-y-1.5">
                    <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider">Rol asignado</label>
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-admin-deep-blue text-xs bg-white font-medium"
                    >
                      <option value="editor">Editor (Sólo Catálogo)</option>
                      <option value="admin">Administrador (Completo)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingTeam}
                    className="w-full md:w-auto px-5 py-2.5 bg-admin-deep-blue text-on-primary rounded font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    <span>{loadingTeam ? 'Invitando...' : 'Invitar'}</span>
                  </button>
                </form>
              )}

              {/* Listado de colaboradores */}
              <div className="border border-border-subtle rounded-xl overflow-hidden shadow-sm">
                <div className="bg-surface border-b border-border-subtle px-4 py-3">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Miembros Activos</span>
                </div>
                <div className="divide-y divide-border-subtle text-xs">
                  {teamMembers.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">Sólo tú tienes acceso a esta tienda.</div>
                  ) : (
                    teamMembers.map((member) => (
                      <div key={member.id} className="p-4 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{member.email}</p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">
                            Rol: <span className="font-semibold text-slate-700">{member.role === 'admin' ? 'Administrador' : 'Editor'}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            member.status === 'pending'
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}>
                            {member.status === 'pending' ? 'Pendiente' : 'Aceptado'}
                          </span>

                          {isUserAdmin && (
                            <button
                              onClick={() => {
                                if (confirm('¿Deseas revocar el acceso a este colaborador?')) {
                                  handleDeleteMember(member.id)
                                }
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Remover Miembro"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
