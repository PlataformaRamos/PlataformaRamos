import React from 'react'
import { createClient } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function MasterSettingsPage() {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('platform_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return <SettingsClient initialLogs={logs || []} />
}
