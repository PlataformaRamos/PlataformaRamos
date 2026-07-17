'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  Store, 
  Users, 
  CreditCard, 
  ShieldAlert, 
  Menu, 
  X, 
  LogOut, 
  ArrowLeftRight,
  ShieldCheck
} from 'lucide-react'

interface MasterLayoutClientProps {
  profile: {
    full_name: string | null
    avatar_url: string | null
    role: string
  }
  children: React.ReactNode
}

export default function MasterLayoutClient({ profile, children }: MasterLayoutClientProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createClient()

  const navigation = [
    { name: 'Métricas', href: '/master/dashboard', icon: TrendingUp },
    { name: 'Tiendas', href: '/master/stores', icon: Store },
    { name: 'Usuarios', href: '/master/users', icon: Users },
    { name: 'Pagos y Suscripciones', href: '/master/payments', icon: CreditCard },
    { name: 'Auditoría y Ajustes', href: '/master/settings', icon: ShieldCheck },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/master/login'
  }

  const isActiveLink = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between bg-slate-900 border-r border-slate-800/80 py-6 px-4 text-slate-200">
      <div className="space-y-6">
        {/* Cabecera del Panel */}
        <div className="px-3 mb-2 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-indigo-400 font-black">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-sm uppercase tracking-wider">Master Panel</span>
          </div>
          <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">
            Plataforma Ramos
          </p>
        </div>

        {/* Menú de Navegación */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const active = isActiveLink(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  active 
                    ? 'text-white bg-indigo-600 shadow shadow-indigo-600/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Perfil del Super Admin y Logout */}
      <div className="border-t border-slate-800 pt-4 space-y-4">
        <div className="flex items-center gap-3 px-3">
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.full_name || 'Admin'} 
              className="w-9 h-9 rounded-full object-cover border border-slate-700"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
              {(profile.full_name || 'A').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1 text-[11px]">
            <div className="font-extrabold text-white truncate">{profile.full_name || 'Administrador'}</div>
            <div className="text-indigo-400 font-bold uppercase text-[9px] tracking-wider">
              Super Administrador
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg text-[11px] font-bold transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Volver a vista Vendedor</span>
          </Link>
          <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-950/20 gap-2 px-3 h-8 text-[11px] font-bold"
          >
            <LogOut className="w-3.5 h-3.5 text-red-500" />
            <span>Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased font-sans">
      {/* Menú de Cabecera Móvil */}
      <div className="md:hidden bg-slate-900 text-slate-200 border-b border-slate-800/60 px-4 py-3 flex justify-between items-center z-40 sticky top-0">
        <div className="flex items-center gap-2 text-indigo-400 font-black">
          <ShieldAlert className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider">Ramos Master</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar de Escritorio (Fixed) */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[260px] z-40">
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
              className="fixed inset-0 bg-black/70" 
              onClick={() => setMobileMenuOpen(false)} 
            />
            {/* Sidebar deslizante */}
            <motion.aside 
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative flex flex-col w-[260px] h-full bg-slate-900 border-r border-slate-800 z-10"
            >
              <SidebarContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Contenido Principal de Trabajo */}
      <div className="flex-1 flex flex-col md:ml-[260px] min-h-screen">
        <main className="flex-1 p-6 md:p-10 bg-slate-950 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
