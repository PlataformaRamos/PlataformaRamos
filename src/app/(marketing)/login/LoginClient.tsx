'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Logo from '@/components/marketing/Logo'
import { Mail, Lock, Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import AuthTransitionOverlay from '@/components/auth/AuthTransitionOverlay'
import { motion } from 'framer-motion'
import { useScrollLock } from '@/hooks/useScrollLock'

export default function LoginClient() {
  // Bloquear el scroll de la página de fondo al 100% en la pantalla de login (Sin scroll)
  useScrollLock(true)

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
    <div className="fixed inset-0 z-50 w-full h-[100dvh] bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none font-sans">
      <AuthTransitionOverlay
        isVisible={authTransition}
        userEmailOrName={email}
        provider="email"
        onComplete={() => {
          window.location.href = '/dashboard'
        }}
      />

      {/* Luces y Glows Ambientales Neón */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/15 to-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Tarjeta Central Principal Única */}
      <div className="relative z-10 max-w-sm sm:max-w-md w-full bg-slate-900/90 border border-slate-800/90 shadow-[0_0_60px_rgba(0,0,0,0.6)] rounded-3xl p-5 sm:p-7 backdrop-blur-2xl transition-all duration-300 flex flex-col gap-4">
        
        {/* Marca en la Tarjeta */}
        <div className="flex items-center justify-center gap-2 mb-0.5">
          <Logo size={26} />
          <span className="font-black text-sm tracking-tight flex items-center gap-1">
            <span className="text-[#EF4444]">Plataforma</span>
            <span className="text-[#3B82F6]">Ramos</span>
          </span>
        </div>

        {/* Selector de Pestañas Animado (Pill Switcher) */}
        <div className="bg-slate-950 p-1 rounded-2xl flex items-center relative border border-slate-800">
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
              !isSignUp ? 'text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {!isSignUp && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-slate-800 rounded-xl border border-slate-700/60 z-[-1]"
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
              isSignUp ? 'text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isSignUp && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-slate-800 rounded-xl border border-slate-700/60 z-[-1]"
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              />
            )}
            <span>Crear Cuenta</span>
          </button>
        </div>

        {/* Título y Subtítulo Dinámicos */}
        <div className="text-center space-y-0.5">
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {isSignUp ? 'Empieza gratis hoy' : 'Bienvenido de nuevo'}
          </h1>
          <p className="text-[11px] text-slate-400 font-medium truncate max-w-xs mx-auto">
            {isSignUp
              ? 'Digitaliza tu tienda e inventario en minutos'
              : 'Gestiona tus catálogos, pedidos y ventas'}
          </p>
        </div>

        {/* Formulario Compacto */}
        <form onSubmit={handleEmailAuth} className="space-y-3 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-slate-300 text-[11px] font-bold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Correo electrónico</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium text-white transition-all placeholder-slate-500 text-xs h-10.5"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 text-[11px] font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Contraseña</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-white transition-all placeholder-slate-500 text-xs h-10.5"
              placeholder="••••••••"
            />
          </div>

          {/* Alertas */}
          {isEmailTaken && (
            <div className="p-3 bg-blue-950/60 border border-blue-800/80 rounded-xl space-y-2 text-slate-200 text-[11px]">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>Esta cuenta ya existe</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-tight">
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
            <div className="p-3 bg-blue-950/60 border border-blue-800/80 rounded-xl space-y-2 text-slate-200 text-[11px]">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
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
            <div className="p-2.5 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 flex items-center gap-2 font-medium text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span className="truncate">{error}</span>
            </div>
          )}

          {message && (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 flex items-center gap-2 font-medium text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Botón Submit Principal */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 hover:opacity-95 text-white font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-blue-500/20 shadow-lg shadow-blue-600/20 h-11 text-xs"
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
        <div className="relative my-0.5 select-none">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
            <span className="bg-slate-900 px-3 text-slate-500">O continuar con</span>
          </div>
        </div>

        {/* Botón de Google OAuth */}
        <Button
          onClick={handleGoogleLogin}
          disabled={loading}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 border-slate-800 hover:bg-slate-800/80 text-white font-bold rounded-xl transition-all active:scale-[0.98] bg-slate-950 h-10.5 text-xs"
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

        {/* Link de retorno al inicio */}
        <div className="text-center pt-1">
          <Link
            href="/"
            className="text-[11px] text-slate-500 hover:text-slate-300 font-bold transition-colors"
          >
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  )
}
