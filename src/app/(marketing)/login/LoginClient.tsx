'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Logo from '@/components/marketing/Logo'
import { Sparkles, Mail, Lock, Loader2, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react'
import AuthTransitionOverlay from '@/components/auth/AuthTransitionOverlay'
import { motion } from 'framer-motion'

export default function LoginClient() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const errorParam = searchParams.get('error')
  const descParam = searchParams.get('description')
  const reasonParam = searchParams.get('reason')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isEmailTaken, setIsEmailTaken] = useState(false)
  const [isGoogleAccountExists, setIsGoogleAccountExists] = useState(false)
  const [googleEmail, setGoogleEmail] = useState('')
  const [authTransition, setAuthTransition] = useState(false)

  const supabase = createClient()

  // Sintonizar el formulario según el parámetro del query y errores de OAuth
  useEffect(() => {
    if (mode === 'signup') {
      setIsSignUp(true)
    } else {
      setIsSignUp(false)
    }
    // Limpiar alertas al cambiar de modo
    setError(null)
    setMessage(null)
    setIsEmailTaken(false)
    setIsGoogleAccountExists(false)

    if (reasonParam === 'session_expired') {
      setMessage('Tu sesión ha finalizado por inactividad. Ingresa credenciales para continuar.')
    }
  }, [mode, reasonParam])

  // Manejar errores devueltos por redirección de Google OAuth / Supabase
  useEffect(() => {
    if (errorParam) {
      setIsEmailTaken(false)
      setIsGoogleAccountExists(false)
      const descText = descParam ? decodeURIComponent(descParam).toLowerCase() : ''
      const errText = errorParam.toLowerCase()
      
      if (errText.includes('identity_already_exists') || descText.includes('already exists') || descText.includes('email_taken')) {
        setError('Ya existe una cuenta con este correo electrónico. Por favor, inicia sesión escribiendo tu contraseña.')
      } else if (errText === 'account_exists_google') {
        const emailVal = searchParams.get('email') ? decodeURIComponent(searchParams.get('email')!) : ''
        setGoogleEmail(emailVal)
        setIsGoogleAccountExists(true)
      } else if (errText === 'auth-callback-failed') {
        setError('Inconveniente al conectar con Google. Por favor, intenta nuevamente.')
      } else {
        setError(descParam ? decodeURIComponent(descParam) : 'No pudimos autenticar tu cuenta. Inténtalo de nuevo.')
      }
    }
  }, [errorParam, descParam, searchParams])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)
    setIsEmailTaken(false)
    setIsGoogleAccountExists(false)

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          },
        })
        
        if (signUpError) {
          const errMsg = signUpError.message.toLowerCase()
          if (errMsg.includes('already registered') || errMsg.includes('already exists') || errMsg.includes('email_taken')) {
            setIsEmailTaken(true)
          } else {
            setError(signUpError.message)
          }
        } else {
          const userIdentities = data?.user?.identities
          if (userIdentities && userIdentities.length === 0) {
            setIsEmailTaken(true)
          } else {
            setMessage('¡Registro completado! Revisa tu bandeja de correo para confirmar tu cuenta y continuar.')
          }
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) {
          setError(signInError.message)
        } else {
          setAuthTransition(true)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    setIsEmailTaken(false)
    setIsGoogleAccountExists(false)
    try {
      const flowParam = isSignUp ? 'signup' : 'signin'
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?flow=${flowParam}`,
        },
      })
      if (oauthError) {
        setError(oauthError.message)
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'Error al conectar con Google.')
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-50/70 min-h-[calc(100dvh-56px)] sm:min-h-[calc(100dvh-68px)] max-h-[calc(100dvh-56px)] sm:max-h-[calc(100dvh-68px)] relative overflow-hidden select-none font-sans">
      <AuthTransitionOverlay
        isVisible={authTransition}
        userEmailOrName={email}
        provider="email"
        onComplete={() => {
          window.location.href = '/dashboard'
        }}
      />

      {/* Luces y Glows Ambientales */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-gradient-to-tr from-blue-600/[0.04] via-indigo-600/[0.04] to-emerald-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Contenedor Principal Ajustado al Alto de Pantalla (No Scroll) */}
      <div className="w-full max-w-sm sm:max-w-md bg-white/95 border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-[0_20px_50px_rgba(15,23,42,0.06)] relative z-10 backdrop-blur-xl transition-all duration-300 flex flex-col gap-4">
        
        {/* Cabecera Superior: Volver al Inicio + Marca */}
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Inicio</span>
          </Link>

          <div className="flex items-center gap-1.5">
            <Logo size={24} />
            <span className="font-black text-xs tracking-tight flex items-center gap-1">
              <span className="text-[#EF4444]">Plataforma</span>
              <span className="text-[#3B82F6]">Ramos</span>
            </span>
          </div>
        </div>

        {/* Selector de Pestañas Animado (Pill Switcher) */}
        <div className="bg-slate-100/80 p-1 rounded-2xl flex items-center relative border border-slate-200/60">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false)
              setError(null)
              setMessage(null)
              setIsEmailTaken(false)
              setIsGoogleAccountExists(false)
            }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all relative z-10 text-center ${
              !isSignUp ? 'text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {!isSignUp && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white rounded-xl border border-slate-200/60 shadow-xs z-[-1]"
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              />
            )}
            <span>Iniciar Sesión</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(true)
              setError(null)
              setMessage(null)
              setIsEmailTaken(false)
              setIsGoogleAccountExists(false)
            }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all relative z-10 text-center ${
              isSignUp ? 'text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {isSignUp && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white rounded-xl border border-slate-200/60 shadow-xs z-[-1]"
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              />
            )}
            <span>Crear Cuenta</span>
          </button>
        </div>

        {/* Título y Subtítulo Dinámicos */}
        <div className="text-center space-y-0.5">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {isSignUp ? 'Empieza gratis hoy' : 'Bienvenido de nuevo'}
          </h1>
          <p className="text-[11px] text-slate-400 font-semibold truncate max-w-xs mx-auto">
            {isSignUp
              ? 'Digitaliza tu tienda e inventario en minutos'
              : 'Gestiona tus catálogos, pedidos y ventas'}
          </p>
        </div>

        {/* Formulario Compacto */}
        <form onSubmit={handleEmailAuth} className="space-y-3 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-slate-700 text-[11px] font-bold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Correo electrónico</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white font-medium text-slate-800 transition-all placeholder-slate-400 text-xs h-10"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 text-[11px] font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Contraseña</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white font-medium text-slate-800 transition-all placeholder-slate-400 text-xs h-10"
              placeholder="••••••••"
            />
          </div>

          {/* Alertas */}
          {isEmailTaken && (
            <div className="p-3 bg-blue-50 border border-blue-200/60 rounded-xl space-y-2 text-slate-700 text-[11px]">
              <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span>Esta cuenta ya existe</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">
                El correo <strong>{email}</strong> ya está registrado.
              </p>
              <Button
                type="button"
                onClick={() => {
                  setIsSignUp(false)
                  setIsEmailTaken(false)
                  setError(null)
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 rounded-lg text-[10px] h-7"
              >
                Iniciar sesión en su lugar
              </Button>
            </div>
          )}

          {isGoogleAccountExists && (
            <div className="p-3 bg-blue-50 border border-blue-200/60 rounded-xl space-y-2 text-slate-700 text-[11px]">
              <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span>Cuenta de Google registrada</span>
              </div>
              <Button
                type="button"
                onClick={() => {
                  setIsSignUp(false)
                  setIsGoogleAccountExists(false)
                  setError(null)
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 rounded-lg text-[10px] h-7"
              >
                Ir a Iniciar Sesión
              </Button>
            </div>
          )}

          {error && !isGoogleAccountExists && (
            <div className="p-2.5 bg-red-50 border border-red-200/60 rounded-xl text-red-600 flex items-center gap-2 font-medium text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="truncate">{error}</span>
            </div>
          )}

          {message && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200/60 rounded-xl text-emerald-700 flex items-center gap-2 font-medium text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Botón Submit Principal */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-blue-500/20 shadow-md shadow-blue-500/15 h-10 text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <span>{isSignUp ? 'Crear mi Tienda Gratis' : 'Ingresar a mi Panel'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </form>

        {/* Separador */}
        <div className="relative my-1 select-none">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200/70" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
            <span className="bg-white px-3 text-slate-400">O continuar con</span>
          </div>
        </div>

        {/* Botón de Google OAuth */}
        <Button
          onClick={handleGoogleLogin}
          disabled={loading}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 border-slate-200/80 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all active:scale-[0.98] bg-white h-10 text-xs"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.48 7.54l3.86 3C6.26 7.54 8.91 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.91c2.2-2.03 3.67-5.01 3.67-8.64z"
            />
            <path
              fill="#FBBC05"
              d="M5.34 14.54c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29l-3.86-3C.68 8.52 0 10.18 0 12s.68 3.48 1.48 5.04l3.86-3z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.91c-1.04.7-2.38 1.12-4.2 1.12-3.09 0-5.74-2.5-6.66-5.5l-3.86 3C3.37 20.35 7.35 23 12 23z"
            />
          </svg>
          <span>Acceder con Google</span>
        </Button>
      </div>
    </div>
  )
}
