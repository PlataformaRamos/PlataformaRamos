import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import React from 'react'
import MasterLayoutClient from './MasterLayoutClient'

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Validar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/master/login')
  }

  // 2. Validar rol de Super Admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'super_admin') {
    redirect('/master/login')
  }

  return (
    <MasterLayoutClient profile={profile}>
      {children}
    </MasterLayoutClient>
  )
}
