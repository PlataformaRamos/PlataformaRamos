'use client'

import React from 'react'
import { Link } from 'next-view-transitions'
import { ShoppingBag } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/40 bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500 font-semibold">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-4.5 h-4.5" />
          </div>
          <span className="font-extrabold text-slate-300">Plataforma Ramos</span>
        </div>

        <div>
          &copy; {new Date().getFullYear()} Plataforma Ramos. Todos los derechos reservados.
        </div>

        <div className="flex items-center gap-6">
          <Link href="/caracteristicas" className="hover:text-slate-300 transition-colors">Características</Link>
          <Link href="/como-funciona" className="hover:text-slate-300 transition-colors">Cómo Funciona</Link>
          <Link href="/precios" className="hover:text-slate-300 transition-colors">Precios</Link>
          <Link href="/faq" className="hover:text-slate-300 transition-colors">Preguntas</Link>
          <Link href="/nosotros" className="hover:text-slate-300 transition-colors">Nosotros</Link>
        </div>
      </div>
    </footer>
  )
}
