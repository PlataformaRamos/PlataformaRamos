'use client'

import React from 'react'
import { Link } from 'next-view-transitions'
import { ShoppingBag } from 'lucide-react'

export default function Header() {
  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/40 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5.5 h-5.5" />
          </div>
          <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-blue-100 to-red-100 bg-clip-text text-transparent">
            Plataforma Ramos
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Link href="/caracteristicas" className="hover:text-white transition-colors">
            Características
          </Link>
          <Link href="/como-funciona" className="hover:text-white transition-colors">
            Cómo Funciona
          </Link>
          <Link href="/precios" className="hover:text-white transition-colors">
            Precios
          </Link>
          <Link href="/faq" className="hover:text-white transition-colors">
            Preguntas
          </Link>
          <Link href="/nosotros" className="hover:text-white transition-colors">
            Nosotros
          </Link>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
          >
            Ingresar
          </Link>
          <Link 
            href="/login" 
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-extrabold uppercase tracking-wider rounded-xl text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 border border-white/10"
          >
            Crear Tienda
          </Link>
        </div>
      </div>
    </header>
  )
}
