'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Sparkles, Mail, Lock, Loader2, ArrowRight, ShieldAlert, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function MasterLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleMasterLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Iniciar sesión con contraseña
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw new Error(signInError.message)
      if (!authData.user) throw new Error('No se pudo autenticar el usuario.')

      // 2. Verificar rol de Super Admin en el perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (profileError || !profile) {
        await supabase.auth.signOut()
        throw new Error('No se encontró el perfil de usuario.')
      }

      if (profile.role !== 'super_admin') {
        await supabase.auth.signOut()
        throw new Error('Acceso denegado. Esta sección es exclusiva para Super Administradores.')
      }

      // Redirigir a Master Dashboard
      window.location.href = '/master/dashboard'

    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión.')
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-slate-950 min-h-screen relative overflow-hidden text-slate-100 font-sans">
      {/* Luces y Glows de Fondo */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/[0.05] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[350px] h-[350px] bg-blue-600/[0.05] rounded-full blur-[90px] pointer-events-none" />

      {/* Tarjeta de Autenticación Premium */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-10">
        
        {/* Botón Volver a Home */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-indigo-400 transition-all mb-6 group select-none"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver al inicio</span>
        </Link>

        {/* Cabecera */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-black text-white tracking-tight">
              Master Administrador
            </h1>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
              Ingresa tus credenciales exclusivas para administrar la plataforma en modo Super Admin.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleMasterLogin} className="space-y-4 text-xs font-semibold">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>Correo electrónico</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-950 font-medium text-white transition-all placeholder-slate-600"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Contraseña</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-950 font-medium text-white transition-all placeholder-slate-600"
              placeholder="••••••••"
            />
          </div>

          {/* Errores */}
          {error && (
            <div className="p-3.5 bg-red-950/40 border border-red-900/50 rounded-xl text-red-400 text-[11px] font-semibold flex items-start gap-2 animate-in fade-in duration-150">
              <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Botón de envío */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 group shadow-md shadow-indigo-600/10 text-xs h-11"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Validando credenciales...</span>
              </>
            ) : (
              <>
                <span>Iniciar sesión maestra</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 pt-6 border-t border-slate-800/60 text-[10px] text-slate-500 font-semibold select-none flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Acceso seguro encriptado SSL</span>
        </div>
      </div>
    </div>
  )
}
