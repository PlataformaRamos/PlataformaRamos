import React from 'react'
import { ChevronDown } from 'lucide-react'

export const metadata = {
  title: 'Preguntas Frecuentes - Plataforma Ramos',
  description: 'Encuentra respuestas rápidas sobre cómo crear tu catálogo, comisiones, dominios propios y el funcionamiento del sistema.',
}

export default function FAQPage() {
  return (
    <main className="flex-1 bg-white py-24 relative overflow-hidden">
      {/* Glows de fondo */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[400px] h-[400px] bg-red-600/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-3xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block font-bold">Resuelve tus dudas</span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Preguntas frecuentes</h1>
          <p className="text-sm text-slate-505 max-w-xs mx-auto">¿Tienes dudas? Aquí te las respondemos al instante.</p>
        </div>

        <div className="space-y-4 text-xs font-semibold">
          {[
            {
              q: '¿Cómo llega el pedido a mi WhatsApp?',
              a: 'Cuando tu cliente completa el proceso de checkout en tu catálogo digital, nuestro sistema procesa la orden y genera un mensaje pre-formateado con todos los detalles de los productos, cantidades, subtotales, datos del cliente (nombre, teléfono) y opción de envío. El cliente solo tiene que dar un clic para enviártelo a tu número de WhatsApp y tú coordinas el pago (Yape, Plin, transferencia, efectivo).'
            },
            {
              q: '¿Puedo usar mi propio dominio personalizado?',
              a: '¡Por supuesto! En el Plan Premium tienes la opción de vincular tu propio dominio de marca (ej. `www.mitienda.com`) para ofrecer una experiencia 100% personalizada y profesional, libre del subdominio por defecto de rutaslima.app.'
            },
            {
              q: '¿Cobran comisiones por cada venta realizada?',
              a: 'Absolutamente no. Nosotros no cobramos ningún tipo de comisión sobre las ventas o transacciones que realices a través de tu catálogo. El dinero y los acuerdos de pago van directos del cliente a tu cuenta bancaria o billetera móvil.'
            },
            {
              q: '¿Necesito programar o saber de servidores?',
              a: 'Para nada. La plataforma está optimizada para que subas productos en segundos usando tu teléfono o computadora de forma muy intuitiva. Nosotros nos encargamos de la optimización de imágenes, seguridad, SSL, CDN y la velocidad de carga de tu sitio.'
            },
            {
              q: '¿Cuáles son las formas de pago que puedo aceptar?',
              a: 'Puedes aceptar cualquier medio de pago que coordines directamente con el cliente: transferencias bancarias, Yape, Plin, efectivo contra entrega o links de pago de pasarelas locales (como Niubiz, MercadoPago, etc.).'
            }
          ].map((item, index) => (
            <div key={index} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex justify-between items-center">
                <span>{item.q}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </h3>
              <p className="text-slate-650 font-medium leading-relaxed mt-2">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
