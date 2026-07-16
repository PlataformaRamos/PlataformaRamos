import React, { Suspense } from 'react'
import LoginClient from './LoginClient'

export const metadata = {
  title: 'Acceder - Plataforma Ramos',
  description: 'Inicia sesión o crea una cuenta para administrar tus catálogos interactivos de venta en WhatsApp.',
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center bg-white min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <LoginClient />
    </Suspense>
  )
}
