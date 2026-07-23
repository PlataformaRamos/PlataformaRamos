'use client'

import React, { useState, useEffect } from 'react'
import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatePage from '@/components/ui/AnimatePage'

interface AdminLayoutClientProps {
  profile: {
    full_name: string
    avatar_url: string | null
    role?: string
  }
  store: {
    id: string
    name: string
    slug: string
    plan_id: string
  } | null
  children: React.ReactNode
}

export default function AdminLayoutClient({ profile, store, children }: AdminLayoutClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createClient()

  // Escuchar cambios en la sesión de Supabase Auth para autorrefrescar de forma transparente los Server Components
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'TOKEN_REFRESHED') {
        router.refresh()
      } else if (event === 'SIGNED_OUT') {
        window.location.href = '/login?reason=session_expired'
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Pedidos', href: '/orders', icon: 'shopping_cart' },
    { name: 'Productos', href: '/products', icon: 'inventory_2' },
    { name: 'Catálogos', href: '/catalogs', icon: 'menu_book' },
    { name: 'Clientes', href: '/customers', icon: 'group' },
    { name: 'Ajustes', href: '/settings', icon: 'settings' },
  ]

  if (profile.role === 'super_admin') {
    navigation.push({ name: 'Panel Master', href: '/master/dashboard', icon: 'shield' })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const publicStoreUrl = store 
    ? `http://${store.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}`
    : '#'

  const isActiveLink = (href: string) => {
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between bg-slate-900 text-white py-6 px-4">
      <div className="space-y-6">
        {/* Cabecera del Panel */}
        <div className="px-3 mb-2 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-md">
              R
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider uppercase text-white">PLATAFORMA RAMOS</h1>
              <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[170px]">
                {store ? store.name : 'Panel Administrador'}
              </p>
            </div>
          </div>

          {store && (
            <a 
              href={publicStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-between px-3 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl transition-all border border-slate-700/60 shadow-xs group"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-[11px] font-bold text-white leading-tight">Visitar mi Tienda</span>
                  <span className="text-[9.5px] font-mono text-slate-400 group-hover:text-blue-300 transition-colors truncate font-semibold">
                    {store.slug}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'rutaslima.app'}
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[15px] group-hover:translate-x-0.5 transition-transform text-slate-400 flex-shrink-0">open_in_new</span>
            </a>
          )}
        </div>

        {/* Menú de Navegación */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const active = isActiveLink(item.href)
            return (
              <NextLink
                key={item.name}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active 
                    ? 'text-white bg-blue-600 shadow-md shadow-blue-600/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className={`material-symbols-outlined text-[20px] ${active ? 'text-white' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </NextLink>
            )
          })}
        </nav>
      </div>

      {/* Perfil del Vendedor y Logout */}
      <div className="border-t border-slate-800/80 pt-4 space-y-3">
        <div className="flex items-center gap-3 px-2">
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.full_name} 
              className="w-9 h-9 rounded-full object-cover border border-slate-700"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-800 text-blue-400 border border-slate-700 flex items-center justify-center font-black text-xs">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1 text-xs">
            <div className="font-bold text-white truncate">{profile.full_name}</div>
            <div className="text-[10px] text-slate-400 truncate">
              {profile.role === 'super_admin' ? 'Super Admin' : 'Vendedor Activo'}
            </div>
          </div>
        </div>

        <Button 
          onClick={handleLogout}
          variant="ghost" 
          className="w-full justify-start text-on-surface-variant hover:text-red-600 hover:bg-red-50 gap-3 px-3 h-10 text-xs font-semibold"
        >
          <span className="material-symbols-outlined text-red-500">logout</span>
          <span>Cerrar sesión</span>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-on-surface flex flex-col md:flex-row antialiased">
      {/* Menú de Cabecera Móvil 100% Fijo (Fixed Top Navbar) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800/80 px-4 flex justify-between items-center z-40 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-xs shadow-xs">
            R
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xs tracking-wider uppercase leading-none">PLATAFORMA RAMOS</span>
            <span className="text-[9.5px] text-slate-400 font-semibold truncate max-w-[170px] leading-tight mt-0.5">
              {store ? store.name : 'Panel Admin'}
            </span>
          </div>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          title="Menú de Navegación"
        >
          <span className="material-symbols-outlined text-[22px]">{mobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Sidebar de Escritorio (Fixed) */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[280px] border-r border-border-subtle dark:border-outline-variant z-40 bg-surface">
        <SidebarContent />
      </aside>

      {/* Sidebar Móvil (Drawer animado) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop oscuro */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs" 
              onClick={() => setMobileMenuOpen(false)} 
            />
            {/* Sidebar deslizante */}
            <motion.aside 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative flex flex-col w-[280px] max-w-xs h-full bg-surface border-r border-border-subtle z-10"
            >
              <SidebarContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Contenido Principal de Trabajo */}
      <div className="flex-1 flex flex-col md:ml-[280px] min-h-screen pt-14 md:pt-0">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 h-16 px-6 hidden md:flex items-center justify-between sticky top-0 z-30 shadow-subtle">
          <div className="flex items-center bg-slate-100/70 hover:bg-slate-100 rounded-xl px-3.5 py-1.5 w-72 border border-slate-200/60 transition-colors">
            <span className="material-symbols-outlined text-slate-400 mr-2 text-[18px]">search</span>
            <input className="bg-transparent border-none focus:outline-none text-xs text-slate-700 w-full p-0 font-medium" placeholder="Buscar productos, pedidos, clientes..." type="text" />
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition-colors relative" title="Notificaciones">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xs">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-800">{profile.full_name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-slate-50/60 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            <AnimatePage key={pathname}>
              {children}
            </AnimatePage>
          </div>
        </main>
      </div>
    </div>
  )
}
