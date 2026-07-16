'use client'

import React, { useState } from 'react'
import { Link } from 'next-view-transitions'
import { usePathname } from 'next/navigation'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createClient()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Pedidos', href: '/orders', icon: 'shopping_cart' },
    { name: 'Productos', href: '/products', icon: 'inventory_2' },
    { name: 'Clientes', href: '/customers', icon: 'group' },
    { name: 'Ajustes', href: '/settings', icon: 'settings' },
  ]

  if (profile.role === 'super_admin') {
    navigation.push({ name: 'Panel Master', href: '/master', icon: 'shield' })
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
    <div className="h-full flex flex-col justify-between bg-surface dark:bg-inverse-surface py-6 px-4">
      <div className="space-y-6">
        {/* Cabecera del Panel */}
        <div className="px-3 mb-2 flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight text-primary dark:text-primary-fixed">Admin Panel</h1>
          <p className="text-xs text-on-surface-variant font-semibold">
            {store ? store.name : 'Plataforma Ramos'}
          </p>
          {store && (
            <a 
              href={publicStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary-container/10 hover:bg-secondary-container/20 text-secondary text-[10px] font-bold rounded transition-colors w-fit border border-secondary/15"
            >
              <span className="material-symbols-outlined text-[13px]">open_in_new</span>
              <span>Visitar mi Tienda</span>
            </a>
          )}
        </div>

        {/* Menú de Navegación */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const active = isActiveLink(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-all ${
                  active 
                    ? 'text-secondary dark:text-secondary-fixed-dim bg-secondary-container/10 font-bold opacity-90' 
                    : 'text-on-surface-variant dark:text-surface-variant hover:bg-surface-container dark:hover:bg-surface-container-highest'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Perfil del Vendedor y Logout */}
      <div className="border-t border-border-subtle dark:border-outline-variant pt-4 space-y-4">
        <div className="flex items-center gap-3 px-3">
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.full_name} 
              className="w-10 h-10 rounded-full object-cover border border-border-subtle"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-secondary-container/10 text-secondary flex items-center justify-center font-bold text-sm">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1 text-xs">
            <div className="font-bold text-slate-900 truncate">{profile.full_name}</div>
            <div className="text-on-surface-variant truncate">
              {profile.role === 'super_admin' ? 'Super Admin' : 'Vendedor'}
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
      {/* Menú de Cabecera Móvil */}
      <div className="md:hidden bg-surface dark:bg-inverse-surface text-on-surface border-b border-border-subtle px-4 py-3 flex justify-between items-center z-40 sticky top-0">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-tight text-primary">RAMOS PANEL</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 rounded-md text-on-surface-variant hover:bg-slate-100"
        >
          <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
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
              className="fixed inset-0 bg-black/60" 
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
      <div className="flex-1 flex flex-col md:ml-[280px] min-h-screen">
        <header className="bg-surface border-b border-border-subtle h-16 px-6 hidden md:flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center bg-surface-container-low rounded px-3 py-1.5 w-64 border border-border-subtle">
            <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[18px]">search</span>
            <input className="bg-transparent border-none focus:outline-none text-xs w-full p-0" placeholder="Buscar..." type="text" />
          </div>
          <div className="flex items-center gap-4 text-on-surface-variant">
            <button className="hover:opacity-80">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <button className="hover:opacity-80">
              <span className="material-symbols-outlined text-[20px]">account_circle</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 bg-surface-container-low overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full">
            <AnimatePage key={pathname}>
              {children}
            </AnimatePage>
          </div>
        </main>
      </div>
    </div>
  )
}
