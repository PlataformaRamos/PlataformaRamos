'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Logo from '@/components/marketing/Logo'
import { Sparkles, Mail, Lock, Loader2, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'

export default function LoginClient() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const errorParam = searchParams.get('error')
  const descParam = searchParams.get('description')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isEmailTaken, setIsEmailTaken] = useState(false)
  const [isGoogleAccountExists, setIsGoogleAccountExists] = useState(false)
  const [googleEmail, setGoogleEmail] = useState('')

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
  }, [mode])

  // Manejar errores devueltos por redirección de Google OAuth / Supabase
  useEffect(() => {
    if (errorParam) {
      setIsEmailTaken(false)
      setIsGoogleAccountExists(false)
      const descText = descParam ? decodeURIComponent(descParam).toLowerCase() : ''
      const errText = errorParam.toLowerCase()
      
      if (errText.includes('identity_already_exists') || descText.includes('already exists') || descText.includes('email_taken')) {
        setError('Ya existe una cuenta con este correo electrónico (posiblemente creada con contraseña). Por favor, inicia sesión escribiendo tu correo y contraseña, o restablece tu clave si no la recuerdas.')
      } else if (errText === 'account_exists_google') {
        const emailVal = searchParams.get('email') ? decodeURIComponent(searchParams.get('email')!) : ''
        setGoogleEmail(emailVal)
        setIsGoogleAccountExists(true)
      } else if (errText === 'auth-callback-failed') {
        setError('Tuvimos un inconveniente al conectar con tu cuenta de Google por un problema temporal de red. Por favor, intenta de nuevo presionando "Acceder con Google".')
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
          window.location.href = '/dashboard'
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
    <div className="flex-1 flex items-center justify-center p-6 bg-white min-h-screen relative overflow-hidden">
      {/* Luces y Glows de Fondo */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/[0.03] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[350px] h-[350px] bg-red-600/[0.03] rounded-full blur-[90px] pointer-events-none" />

      {/* Tarjeta de Autenticación Premium */}
      <div className="w-full max-w-md bg-slate-50 border border-slate-200/80 rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative z-10 transition-all duration-300">
        
        {/* Botón Volver a Home */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-blue-600 transition-all mb-4 group select-none"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver al inicio</span>
        </Link>

        {/* Cabecera / Identidad de Marca */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-2 group mb-4">
            <Logo size={36} />
            <span className="font-black text-xl tracking-tight flex items-center gap-1 select-none">
              <span className="text-[#EF4444]">Plataforma</span>
              <span className="text-[#3B82F6]">Ramos</span>
            </span>
            <Logo size={36} mirror />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight transition-all duration-300">
              {isSignUp ? 'Crear una cuenta' : 'Iniciar sesión'}
            </h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
              {isSignUp
                ? 'Regístrate hoy para empezar a digitalizar tu inventario gratis.'
                : 'Accede a tu panel administrativo para gestionar pedidos y catálogos.'}
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleEmailAuth} className="space-y-4 text-xs font-semibold">
          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Correo electrónico</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium text-slate-800 transition-all placeholder-slate-400"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Contraseña</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium text-slate-800 transition-all placeholder-slate-400"
              placeholder="••••••••"
            />
          </div>

          {/* Alerta de Email Ya Existente (Sign Up -> Sign In) */}
          {isEmailTaken && (
            <div className="p-4 bg-blue-50 border border-blue-200/60 rounded-2xl space-y-2.5 text-slate-700 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 text-blue-700 font-black">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Esta cuenta ya existe</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                El correo <strong>{email}</strong> ya está registrado en Plataforma Ramos. Puedes iniciar sesión de inmediato escribiendo tu contraseña.
              </p>
              <Button
                type="button"
                onClick={() => {
                  setIsSignUp(false)
                  setIsEmailTaken(false)
                  setError(null)
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-[10px] h-9 transition-all active:scale-[0.98]"
              >
                Iniciar sesión en su lugar
              </Button>
            </div>
          )}

          {/* Alerta de Cuenta de Google Ya Existente durante Registro */}
          {isGoogleAccountExists && (
            <div className="p-4 bg-blue-50 border border-blue-200/60 rounded-2xl space-y-2.5 text-slate-700 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 text-blue-700 font-black">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Cuenta de Google ya registrada</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                La cuenta de Google ({googleEmail}) ya tiene un registro previo en la plataforma. Por favor, ve a la sección de inicio de sesión para ingresar a tu tienda.
              </p>
              <Button
                type="button"
                onClick={() => {
                  setIsSignUp(false)
                  setIsGoogleAccountExists(false)
                  setError(null)
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-[10px] h-9 transition-all active:scale-[0.98]"
              >
                Ir a Iniciar Sesión
              </Button>
            </div>
          )}

          {/* Mensajes de Error con animación de escala */}
          {error && !isGoogleAccountExists && (
            <div className="p-3 bg-red-50 border border-red-200/60 rounded-xl text-red-600 flex items-start gap-2.5 font-medium animate-in zoom-in-95 duration-200 leading-normal">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Mensaje de Éxito */}
          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200/60 rounded-xl text-emerald-700 flex items-start gap-2.5 font-medium animate-in zoom-in-95 duration-200 leading-normal">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 border border-blue-500/20 shadow-lg shadow-blue-600/10 h-11"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <span>{isSignUp ? 'Crear mi Tienda' : 'Ingresar al Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Separador */}
        <div className="relative my-6 select-none">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
            <span className="bg-slate-50 px-3.5 text-slate-400">O continuar con</span>
          </div>
        </div>

        {/* Botón de Google OAuth */}
        <Button
          onClick={handleGoogleLogin}
          disabled={loading}
          variant="outline"
          className="w-full flex items-center justify-center gap-2.5 border-slate-200 hover:bg-slate-100 text-slate-700 font-bold py-3 rounded-xl transition-all active:scale-95 bg-white h-11 text-xs"
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

        {/* Toggle de Registro / Login */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
              setMessage(null)
              setIsEmailTaken(false)
              setIsGoogleAccountExists(false)
            }}
            className="text-xs text-slate-500 hover:text-blue-600 transition-colors font-bold"
          >
            {isSignUp
              ? '¿Ya tienes una cuenta? Inicia sesión aquí'
              : '¿No tienes una cuenta? Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  )
}
