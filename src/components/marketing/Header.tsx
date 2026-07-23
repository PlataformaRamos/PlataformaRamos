'use client'

import React, { useState, useEffect } from 'react'
import { Link } from 'next-view-transitions'
import { usePathname } from 'next/navigation'
import Logo from '@/components/marketing/Logo'
import { Menu, X, ChevronRight, User, ShoppingBag } from 'lucide-react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Cerrar el menú automáticamente al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Bloquear el scroll de la página cuando el menú móvil está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  if (pathname === '/login') return null

  const navLinks = [
    { href: '/caracteristicas', label: 'Características' },
    { href: '/como-funciona', label: 'Cómo Funciona' },
    { href: '/precios', label: 'Precios' },
    { href: '/faq', label: 'Preguntas' },
    { href: '/nosotros', label: 'Nosotros' },
  ]

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between relative z-50">
        
        {/* Logo responsivo con ambos SVGs (normal y espejo) tanto en móvil como en desktop */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-3 group z-50" onClick={() => setMobileMenuOpen(false)}>
          <Logo size={26} className="sm:hidden block group-hover:scale-105 transition-transform" />
          <Logo size={42} className="hidden sm:block group-hover:scale-105 transition-transform" />
          
          <span className="font-black text-sm sm:text-xl md:text-2xl tracking-tight flex items-center gap-1 sm:gap-1.5 select-none">
            <span className="text-[#EF4444]">Plataforma</span>
            <span className="text-[#3B82F6]">Ramos</span>
          </span>
          
          <Logo size={26} mirror className="sm:hidden block group-hover:scale-105 transition-transform" />
          <Logo size={42} mirror className="hidden sm:block group-hover:scale-105 transition-transform" />
        </Link>

        {/* Navigation para pantallas grandes */}
        <nav className="hidden lg:flex items-center gap-7 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="hover:text-blue-600 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 hover:after:w-full after:transition-all"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTAs para pantallas grandes */}
        <div className="hidden lg:flex items-center gap-4">
          <Link 
            href="/login?mode=signin" 
            className="text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-blue-600 transition-colors py-2 px-3 rounded-lg hover:bg-slate-50"
          >
            Ingresar
          </Link>
          <Link 
            href="/login?mode=signup" 
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-extrabold uppercase tracking-wider rounded-xl text-white shadow-lg shadow-blue-600/10 transition-all hover:scale-105 active:scale-95 border border-blue-500/20"
          >
            Crear Tienda
          </Link>
        </div>

        {/* Botón de Menú Hamburguesa para Móviles */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors z-50"
          aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menú Desplegable Móvil que se posiciona desde la parte inferior de la cabecera */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 h-[calc(100dvh-64px)] sm:h-[calc(100dvh-80px)] bg-white z-50 flex flex-col justify-between overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 border-t border-slate-200/80">
          <div className="px-5 py-6 space-y-4 overflow-y-auto flex-1 min-h-0 bg-white">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block px-1">
              Menú de Navegación
            </span>
            
            <nav className="flex flex-col gap-1 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-3.5 px-3 rounded-xl hover:bg-blue-50/60 active:bg-blue-50 hover:text-blue-600 transition-colors border-b border-slate-100/80"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Acciones de Iniciar Sesión y Registro en el Menú Inferior Móvil */}
          <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200/80 space-y-3 shrink-0 shadow-inner">
            <Link
              href="/login?mode=signin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 px-4 border border-slate-300 hover:bg-white text-center font-bold text-slate-700 rounded-xl flex items-center justify-center gap-2 bg-white text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-sm min-h-[44px]"
            >
              <User className="w-4 h-4 text-blue-600" />
              <span>Ingresar a mi Cuenta</span>
            </Link>
            
            <Link
              href="/login?mode=signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-center font-extrabold text-white rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] border border-blue-500/20 min-h-[44px]"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>Crear mi Tienda Gratis</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
