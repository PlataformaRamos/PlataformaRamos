'use client'

import React from 'react'
import { Link } from 'next-view-transitions'
import Logo from '@/components/marketing/Logo'

export default function Header() {
  return (
    <header className="w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Logo size={52} className="group-hover:scale-105 transition-transform" />
          <span className="font-black text-2xl tracking-tight flex items-center gap-1.5 select-none">
            <span className="text-[#EF4444]">Plataforma</span>
            <span className="text-[#3B82F6]">Ramos</span>
          </span>
          <Logo size={52} mirror className="group-hover:scale-105 transition-transform" />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-600">
          <Link href="/caracteristicas" className="hover:text-blue-600 transition-colors">
            Características
          </Link>
          <Link href="/como-funciona" className="hover:text-blue-600 transition-colors">
            Cómo Funciona
          </Link>
          <Link href="/precios" className="hover:text-blue-600 transition-colors">
            Precios
          </Link>
          <Link href="/faq" className="hover:text-blue-600 transition-colors">
            Preguntas
          </Link>
          <Link href="/nosotros" className="hover:text-blue-600 transition-colors">
            Nosotros
          </Link>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-4">
          <Link 
            href="/login?mode=signin" 
            className="text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-blue-600 transition-colors"
          >
            Ingresar
          </Link>
          <Link 
            href="/login?mode=signup" 
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-extrabold uppercase tracking-wider rounded-xl text-white shadow-lg shadow-blue-600/10 transition-all hover:scale-105 active:scale-95 border border-blue-500/20"
          >
            Crear Tienda
          </Link>
        </div>
      </div>
    </header>
  )
}
