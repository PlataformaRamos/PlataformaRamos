import React from 'react'
import Link from 'next/link'
import { 
  ShoppingBag, 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  Phone, 
  Video, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Camera, 
  Send, 
  CheckCheck,
  Zap,
  Percent,
  Globe,
  Smartphone,
  LineChart,
  CheckCircle2,
  Users,
  ShieldCheck,
  Store
} from 'lucide-react'
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

  const features = [
    {
      icon: <Zap className="w-5 h-5 text-blue-600" />,
      title: 'Digitalización en 30s',
      desc: 'Crea tu catálogo en segundos desde tu celular o computadora. Sube fotos, precios y especificaciones de forma veloz.'
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-emerald-600" />,
      title: 'Pedidos a tu WhatsApp',
      desc: 'Tus clientes arman el carrito de compras y te envían el pedido ya estructurado con un clic directamente a tu chat.'
    },
    {
      icon: <Percent className="w-5 h-5 text-red-600" />,
      title: 'Cero Comisiones',
      desc: 'No cobramos ningún porcentaje por tus ventas. Todo el dinero va directo a tu Yape, Plin, cuenta bancaria o efectivo.'
    },
    {
      icon: <Globe className="w-5 h-5 text-indigo-600" />,
      title: 'Dominio Propio',
      desc: 'Posiciona tu marca en Internet conectando tu dominio propio (ej. mi-tienda.com) en nuestro plan profesional.'
    },
    {
      icon: <Smartphone className="w-5 h-5 text-purple-600" />,
      title: '100% Móvil Responsivo',
      desc: 'El catálogo y tu panel se ven espectaculares y cargan al instante en cualquier teléfono celular, tablet o computadora.'
    },
    {
      icon: <LineChart className="w-5 h-5 text-amber-600" />,
      title: 'Gestión Administrativa',
      desc: 'Lleva el registro organizado de tus clientes, el historial de pedidos y las estadísticas de venta desde tu panel.'
    }
  ]

  const steps = [
    {
      num: '01',
      title: 'Crea tu Tienda',
      desc: 'Regístrate gratis con tu correo o Google en 10 segundos. Define el nombre de tu marca y catálogo.'
    },
    {
      num: '02',
      title: 'Sube tus Productos',
      desc: 'Registra tus artículos con imágenes, descripciones, precios y variantes (como talla, color o sabores).'
    },
    {
      num: '03',
      title: 'Comparte y Vende',
      desc: 'Coloca el link en tu biografía de Instagram, TikTok o envíalo directamente. ¡Y empieza a recibir pedidos!'
    }
  ]

  return (
    <main className="flex-grow bg-white text-slate-900 overflow-x-hidden w-full">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full max-w-7xl mx-auto px-6 py-12 sm:py-20 lg:py-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        
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
 
        {/* Mockup del Teléfono con Simulación de WhatsApp */}
        <div className="flex-grow flex-shrink-0 w-full max-w-sm relative flex justify-center z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px]" />
          
          <div className="relative w-full max-w-[310px] sm:max-w-[325px] aspect-[9/18.5] rounded-[44px] border-[9px] border-slate-900 bg-[#E5DDD5] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col group transition-all duration-500 hover:scale-[1.02] hover:rotate-1">
            
            {/* Isla superior */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-800 ml-auto mr-4" />
            </div>

            {/* HEADER DE WHATSAPP */}
            <div className="pt-7 pb-2.5 px-3.5 bg-[#075E54] text-white flex items-center gap-2 shadow-md relative z-10 flex-shrink-0">
              <div className="w-1.5 h-3 border-l-2 border-b-2 border-white transform -rotate-45 cursor-pointer opacity-80 hover:opacity-100" />
              
              <div className="w-8 h-8 rounded-full bg-slate-500 text-white flex items-center justify-center font-black text-xs border border-white/20 shadow-inner flex-shrink-0 select-none">
                MM
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="text-[11px] font-extrabold truncate">
                  Martín Maldonado (Cliente)
                </div>
                <div className="text-[8px] text-emerald-300 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>En línea</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-white/90">
                <Video className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
                <Phone className="w-3 h-3 cursor-pointer hover:text-white" />
                <MoreVertical className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
              </div>
            </div>

            {/* CUERPO DEL CHAT */}
            <div className="flex-grow p-3 space-y-4 overflow-y-auto no-scrollbar bg-[#efeae2] relative text-[10px] leading-relaxed">
              
              {/* Globo 1: Catálogo (Derecha - Verde) */}
              <div className="max-w-[85%] bg-[#d9fdd3] rounded-2xl rounded-tr-none p-3 shadow-[0_1px_0.5px_rgba(0,0,0,0.1)] ml-auto space-y-2 relative border border-emerald-200/10">
                <p className="font-semibold text-slate-800 text-[10px]">
                  ¡Hola Martín! Te comparto nuestro catálogo actualizado para que elijas tus productos directamente:
                </p>
                
                <div className="bg-white/80 border border-slate-200/40 rounded-xl overflow-hidden flex flex-col cursor-pointer hover:bg-white transition-colors">
                  <div className="p-2 flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-sm flex-shrink-0">🍕</div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 text-[9px] truncate">Tienda Ramos | Catálogo</div>
                      <div className="text-[8px] text-slate-500 truncate">tienda-ramos.rutaslima.app</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-1 text-[7px] text-slate-500 font-bold">
                  <span>12:00 PM</span>
                  <CheckCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                </div>
              </div>

              {/* Globo 2: Pedido (Izquierda - Blanco) */}
              <div className="max-w-[90%] bg-white rounded-2xl rounded-tl-none p-3 shadow-[0_1px_0.5px_rgba(0,0,0,0.1)] space-y-2 relative border border-slate-200/20">
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
                
                <span className="text-[7px] text-slate-400 font-bold block text-right">12:02 PM</span>
              </div>

            </div>

            {/* INPUT DE WHATSAPP INFERIOR */}
            <div className="p-2 bg-[#f0f2f5] flex items-center gap-1.5 border-t border-slate-200/30 flex-shrink-0 relative z-10">
              <div className="flex-grow bg-white rounded-full px-3 py-2 flex items-center gap-2 border border-slate-200/50 shadow-sm min-w-0">
                <Smile className="w-4 h-4 text-slate-400 cursor-pointer flex-shrink-0" />
                <span className="text-slate-400 text-[10px] font-medium flex-grow truncate select-none">
                  Escribe a Martín Maldonado...
                </span>
                <Paperclip className="w-3.5 h-3.5 text-slate-400 cursor-pointer transform -rotate-45 flex-shrink-0" />
                <Camera className="w-4 h-4 text-slate-400 cursor-pointer flex-shrink-0" />
              </div>
              
              <div className="w-9 h-9 rounded-full bg-[#128C7E] text-white flex items-center justify-center shadow cursor-pointer hover:bg-[#075E54] active:scale-95 transition-all flex-shrink-0">
                <Send className="w-3.5 h-3.5 text-white ml-0.5" />
              </div>
            </div>
            
          </div>
 
          {/* Alertas flotantes decorativas (Superpuestas por delante con z-20, bajadas y más a la derecha para no tapar la cabecera) */}
          <div className="absolute top-28 -right-12 bg-white border border-slate-100 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur max-w-[210px] hover:scale-105 transition-transform duration-300 z-20">
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

      {/* 2. CARACTERÍSTICAS Grid Section */}
      <section className="w-full bg-slate-50/55 border-t border-b border-slate-100 py-20 sm:py-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3.5">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
              Todo lo que necesitas
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Diseñado exclusivamente para hacer despegar tu negocio
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Olvídate de las integraciones complejas de e-commerce. Plataforma Ramos unifica la simpleza de WhatsApp con el poder de un catálogo digital estructurado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200/50 p-6.5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:border-slate-200 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-950 mb-2 group-hover:text-blue-600 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CÓMO FUNCIONA Section */}
      <section className="w-full py-20 sm:py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3.5">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
              Proceso Simple
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              ¿Cómo funciona Plataforma Ramos?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Configura tu tienda virtual en tres sencillos pasos sin necesidad de saber programar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            
            {/* Conectores decorativos de escritorio */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-500/30 via-emerald-500/30 to-blue-500/30 -z-10" />

            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-50 border-2 border-slate-200/60 shadow flex items-center justify-center font-black text-2xl text-blue-600 relative select-none">
                  {step.num}
                  <span className="absolute -bottom-1 w-6 h-1 bg-blue-500 rounded-full" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 pt-2">{step.title}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BENTO GRID DE IMPACTO Y ESTADÍSTICAS */}
      <section className="w-full bg-slate-50/55 border-t border-slate-100 py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3.5">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100">
              Máximo Rendimiento
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Creado para maximizar las ganancias de tu tienda
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Unimos la flexibilidad de los cobros digitales locales con una interfaz pensada para el cliente peruano.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            {/* Tarjeta 1 (Grande, ocupa 2 columnas) */}
            <div className="md:col-span-2 p-8 bg-blue-950 text-white rounded-[32px] flex flex-col justify-between relative overflow-hidden shadow-xl min-h-[260px] group transition-all duration-300 hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Percent className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                  S/ 0.00 de cobro de comisiones intermedias
                </h3>
                <p className="text-xs text-slate-300 font-medium max-w-lg leading-relaxed">
                  Las plataformas tradicionales descuentan entre el 3% y el 7% de cada venta que realizas. Con Plataforma Ramos, el 100% del dinero ingresa directamente a tu Yape, Plin o cuenta bancaria. Ahorra cientos de Soles cada mes.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-white/10 text-xs font-bold text-blue-300 select-none">
                <span>✓ Cobro directo</span>
                <span>• Sin pasarelas lentas</span>
                <span>• Liquidez al instante</span>
              </div>
            </div>

            {/* Tarjeta 2 */}
            <div className="p-8 bg-white border border-slate-200/80 rounded-[32px] flex flex-col justify-between shadow-sm min-h-[260px] hover:shadow-md transition-shadow duration-300">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Soporte 100% en Perú
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  ¿Tienes dudas con tu dominio o configuración? Nuestro equipo te atiende directamente por WhatsApp de forma veloz para que nunca detengas tus ventas.
                </p>
              </div>

              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4">
                Atención Humana 24/7
              </div>
            </div>

            {/* Tarjeta 3 */}
            <div className="p-8 bg-white border border-slate-200/80 rounded-[32px] flex flex-col justify-between shadow-sm min-h-[260px] hover:shadow-md transition-shadow duration-300 group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Globe className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Tu Marca, Tu Enlace Propio
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Cada producto que subas tiene su propia URL exclusiva en tu subdominio (ej: <code>tienda.rutaslima.app/product/pizza</code>). Cópialo y compártelo directo en tus historias de Instagram, TikTok o chats.
                </p>
                
                {/* Mini Mockup de Enlace Compartido */}
                <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-3.5 space-y-2.5 shadow-inner">
                  <div className="flex gap-2.5 items-center">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-sm flex-shrink-0 select-none">🍕</div>
                    <div className="min-w-0 flex-grow">
                      <div className="font-extrabold text-slate-800 text-[9px] truncate">Pizza Pepperoni Familiar</div>
                      <div className="text-[8px] text-indigo-600 font-mono font-bold truncate">tienda-ramos.rutaslima.app/product/pizza</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-white border border-slate-100/50 rounded-xl px-2.5 py-1.5 text-[8.5px] font-extrabold text-slate-500">
                    <span>S/ 39.90</span>
                    <span className="text-emerald-600 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      Pedir por WhatsApp
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4">
                URLs de Producto Compartibles
              </div>
            </div>

            {/* Tarjeta 4 (Ocupa 2 columnas) */}
            <div className="md:col-span-2 p-8 bg-[#fdfaf7] border border-orange-200/40 rounded-[32px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="space-y-3 max-w-md">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <Store className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-950">
                  Ideal para restaurantes, tiendas de ropa y emprendedores
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Ya sea que vendas hamburguesas, calzado o accesorios, nuestra maquetación de catálogo está diseñada para optimizar la toma de decisiones del comprador.
                </p>
              </div>

              <Link 
                href="/login?mode=signup" 
                className="px-6 py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors flex-shrink-0"
              >
                Crear Catálogo
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 5. SECCIÓN DE LLAMADA A LA ACCIÓN FINAL (CTA) */}
      <section className="w-full bg-blue-600 py-16 sm:py-24 relative overflow-hidden text-white text-center">
        
        {/* Glows decorativos del CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-red-500/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6 sm:space-y-8">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Comienza a vender de forma inteligente hoy mismo
          </h2>
          
          <p className="text-xs sm:text-base text-blue-100 font-medium max-w-xl mx-auto leading-relaxed">
            Únete a cientos de emprendedores peruanos que ya digitalizaron sus catálogos y multiplicaron sus ventas por WhatsApp. Sin contratos, sin tarjetas de crédito y gratis para siempre.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link 
              href="/login?mode=signup" 
              className="px-8 py-4 bg-white hover:bg-slate-50 text-blue-600 rounded-xl text-xs font-black tracking-wider uppercase shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Crear mi catálogo gratis
            </Link>
            <Link 
              href="/precios" 
              className="px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold tracking-wider uppercase border border-blue-500/50 hover:scale-105 active:scale-95 transition-all"
            >
              Ver Planes de Precios
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
