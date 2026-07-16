'use client'

import React from 'react'
import { Link } from 'next-view-transitions'
import Logo from '@/components/marketing/Logo'

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/60 bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500 font-semibold">
        <div className="flex items-center gap-3">
          <Logo size={32} />
          <span className="font-extrabold text-slate-800">Plataforma Ramos</span>
        </div>

        <div className="text-slate-400">
          &copy; {new Date().getFullYear()} Plataforma Ramos. Todos los derechos reservados.
        </div>

        <div className="flex items-center gap-6 text-slate-600">
          <Link href="/caracteristicas" className="hover:text-blue-600 transition-colors">Características</Link>
          <Link href="/como-funciona" className="hover:text-blue-600 transition-colors">Cómo Funciona</Link>
          <Link href="/precios" className="hover:text-blue-600 transition-colors">Precios</Link>
          <Link href="/faq" className="hover:text-blue-600 transition-colors">Preguntas</Link>
          <Link href="/nosotros" className="hover:text-blue-600 transition-colors">Nosotros</Link>
        </div>
      </div>
    </footer>
  )
}
