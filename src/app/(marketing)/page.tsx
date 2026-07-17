import React from 'react'
import Link from 'next/link'
import { ShoppingBag, MessageSquare, Sparkles, ArrowRight, Phone, Video, MoreVertical, Smile, Paperclip, Camera, Send, CheckCheck } from 'lucide-react'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Plataforma Ramos - Tu Catálogo Digital en WhatsApp',
  description: 'La forma más rápida de digitalizar tu inventario, recibir pedidos en tu WhatsApp y administrar tu negocio sin comisiones intermedias.',
}

interface HomePageProps {
  searchParams: Promise<{ code?: string; error?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams
  
  // Redirección de emergencia para OAuth de Supabase
  if (resolvedParams.code) {
    redirect(`/api/auth/callback?code=${resolvedParams.code}`)
  }

  return (
    <main className="flex-1 flex flex-col justify-center items-center bg-white text-slate-900 overflow-x-hidden w-full">
      
      {/* HERO SECTION con efectos de luz Azul, Rojo y Blanco */}
      <section className="relative w-full max-w-7xl mx-auto px-6 py-12 sm:py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        
        {/* Glows y Luces de Fondo (Azul y Rojo) */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-500/5 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-red-500/5 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" />

        {/* Textos del Hero */}
        <div className="flex-grow flex-shrink-0 space-y-6 lg:max-w-2xl text-center lg:text-left z-10 w-full lg:w-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-50/80 border border-blue-100 rounded-full text-blue-600 text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-blue-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Plataforma SaaS Lista en 30 Segundos</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-[62px] font-black tracking-tight leading-[1.1] sm:leading-[1.05] text-slate-900">
            Crea tu catálogo digital y recibe pedidos por{' '}
            <span className="text-[#25D366] block sm:inline">
              WhatsApp
            </span>
          </h1>

          <p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
            La forma más rápida y estética de digitalizar tu inventario. Sube tus productos, define tus variantes y permite que tus clientes te envíen la orden de compra directamente a tu chat de WhatsApp en un clic, sin pagar comisiones por venta.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
            <Link 
              href="/login?mode=signup" 
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wider uppercase shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.03] active:scale-95 group"
            >
              <span className="text-white font-black">Empezar Gratis Ahora</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/como-funciona" 
              className="px-8 py-4 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center transition-all hover:scale-[1.03]"
            >
              ¿Cómo funciona?
            </Link>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200 max-w-sm sm:max-w-md mx-auto lg:mx-0 text-center lg:text-left">
            <div>
              <div className="text-xl sm:text-3xl font-black text-slate-900">0%</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Comisiones</div>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-slate-900">+50,000</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Pedidos Enviados</div>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-slate-900">2 Min</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Configuración</div>
            </div>
          </div>
        </div>
 
        {/* Mockup del Teléfono con Simulación de WhatsApp de Alta Definición */}
        <div className="flex-grow flex-shrink-0 w-full max-w-sm relative flex justify-center z-10">
          {/* Círculo luminoso detrás del móvil */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px]" />
          
          <div className="relative w-full max-w-[310px] sm:max-w-[325px] aspect-[9/18.5] rounded-[44px] border-[9px] border-slate-900 bg-[#E5DDD5] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col group transition-all duration-500 hover:scale-[1.02] hover:rotate-1">
            
            {/* Isla superior del teléfono */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-800 ml-auto mr-4" />
            </div>

            {/* HEADER DE WHATSAPP */}
            <div className="pt-7 pb-2.5 px-3.5 bg-[#075E54] text-white flex items-center gap-2 shadow-md relative z-10 flex-shrink-0">
              <div className="w-1.5 h-3 border-l-2 border-b-2 border-white transform -rotate-45 cursor-pointer opacity-80 hover:opacity-100" />
              
              {/* Foto de perfil del comercio */}
              <div className="w-8 h-8 rounded-full bg-[#128C7E] text-white flex items-center justify-center font-black text-xs border border-white/20 shadow-inner flex-shrink-0 select-none">
                TR
              </div>
              
              {/* Información del negocio */}
              <div className="flex-grow min-w-0">
                <div className="text-[11px] font-extrabold truncate flex items-center gap-1.5">
                  <span>Tienda Ramos 🛒</span>
                </div>
                <div className="text-[8px] text-emerald-300 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>En línea</span>
                </div>
              </div>

              {/* Iconos superiores */}
              <div className="flex items-center gap-3 text-white/90">
                <Video className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
                <Phone className="w-3 h-3 cursor-pointer hover:text-white" />
                <MoreVertical className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
              </div>
            </div>

            {/* PATRÓN O CUERPO DEL CHAT DE WHATSAPP */}
            <div className="flex-grow p-3 space-y-4 overflow-y-auto no-scrollbar bg-[#efeae2] relative text-[10px] leading-relaxed">
              
              {/* Globo 1: Enviado por la Tienda (Izquierda - Blanco) */}
              <div className="max-w-[85%] bg-white rounded-2xl rounded-tl-none p-3 shadow-[0_1px_0.5px_rgba(0,0,0,0.1)] space-y-2 relative border border-slate-200/20 animate-in fade-in duration-300">
                <p className="font-semibold text-slate-800 text-[10px]">
                  ¡Hola! 🍕 Te compartimos el enlace de nuestro catálogo digital para que armes tu pedido en 1 clic y sin comisiones:
                </p>
                
                {/* Rich Link Preview del catálogo */}
                <div className="bg-slate-100/70 border border-slate-200/50 rounded-xl overflow-hidden flex flex-col cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="p-2 flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-sm flex-shrink-0">🍕</div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 text-[9px] truncate">Tienda Ramos | Catálogo</div>
                      <div className="text-[8px] text-slate-500 truncate">rutaslima.app/tienda-ramos</div>
                    </div>
                  </div>
                </div>
                
                <span className="text-[7px] text-slate-400 font-bold block text-right">12:00 PM</span>
              </div>

              {/* Globo 2: Orden de Compra del Cliente (Derecha - Verde Claro #d9fdd3) */}
              <div className="max-w-[90%] bg-[#d9fdd3] rounded-2xl rounded-tr-none p-3 shadow-[0_1px_0.5px_rgba(0,0,0,0.1)] ml-auto space-y-2 relative border border-emerald-200/10 animate-in slide-in-from-bottom-3 duration-500">
                <p className="font-medium text-slate-800 text-[9px] leading-relaxed whitespace-pre-line font-mono">
                  *Nuevo Pedido de Tienda Ramos* 📝
                  {"\n"}----------------------------------
                  {"\n"}• 1x Pizza Familiar Pepperoni (S/ 39.90)
                  {"\n"}• 2x Gaseosa Personal (S/ 8.00)
                  {"\n"}
                  {"\n"}*Total:* S/ 47.90
                  {"\n"}
                  {"\n"}*Datos de Entrega:*
                  {"\n"}• Cliente: Martin Maldonado
                  {"\n"}• Dirección: Av. Arequipa 1230, Lima
                  {"\n"}• Pago: Yape
                </p>
                
                <div className="flex items-center justify-end gap-1 text-[7px] text-slate-500 font-bold">
                  <span>12:02 PM</span>
                  <CheckCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                </div>
              </div>

            </div>

            {/* INPUT DE WHATSAPP INFERIOR */}
            <div className="p-2 bg-[#f0f2f5] flex items-center gap-1.5 border-t border-slate-200/30 flex-shrink-0 relative z-10">
              <div className="flex-grow bg-white rounded-full px-3 py-2 flex items-center gap-2 border border-slate-200/50 shadow-sm">
                <Smile className="w-4 h-4 text-slate-400 cursor-pointer" />
                <span className="text-slate-400 text-[10px] font-medium flex-grow truncate select-none">Mensaje</span>
                <Paperclip className="w-3.5 h-3.5 text-slate-400 cursor-pointer transform -rotate-45" />
                <Camera className="w-4 h-4 text-slate-400 cursor-pointer" />
              </div>
              
              {/* Botón flotante verde de WhatsApp */}
              <div className="w-9 h-9 rounded-full bg-[#128C7E] text-white flex items-center justify-center shadow cursor-pointer hover:bg-[#075E54] active:scale-95 transition-all flex-shrink-0">
                <Send className="w-3.5 h-3.5 text-white ml-0.5" />
              </div>
            </div>
            
          </div>
 
          {/* Alertas flotantes decorativas */}
          <div className="absolute top-12 -right-6 bg-white border border-slate-100 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur max-w-[210px] hover:scale-105 transition-transform duration-300">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold text-slate-900">Pedido Recibido</div>
              <div className="text-[9px] text-slate-500 truncate">Redirigido a WhatsApp</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
