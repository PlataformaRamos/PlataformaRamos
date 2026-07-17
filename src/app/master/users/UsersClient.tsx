'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldAlert,
  UserCircle,
  Store as StoreIcon,
  AlertTriangle,
  X,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProfileType {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: string
  created_at: string
}

interface StoreRef {
  id: string
  name: string
  slug: string
  owner_id: string
}

interface UsersClientProps {
  initialProfiles: ProfileType[]
  initialStores: StoreRef[]
}

export default function UsersClient({ initialProfiles, initialStores }: UsersClientProps) {
  const supabase = createClient()

  const [profiles, setProfiles] = useState<ProfileType[]>(initialProfiles)
  const [stores] = useState<StoreRef[]>(initialStores)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'vendor' | 'super_admin'>('all')

  // Modal de cambio de rol
  const [roleModal, setRoleModal] = useState<{
    open: boolean
    userId: string
    userName: string
    currentRole: string
  } | null>(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [updating, setUpdating] = useState(false)

  const getStoreForUser = (userId: string) => {
    return stores.find(s => s.owner_id === userId)
  }

  const handleChangeRole = (profile: ProfileType) => {
    setReason('')
    setReasonError('')
    setRoleModal({
      open: true,
      userId: profile.id,
      userName: profile.full_name || 'Sin nombre',
      currentRole: profile.role,
    })
  }

  const confirmRoleChange = async () => {
    if (!roleModal) return
    if (reason.trim().length < 5) {
      setReasonError('El motivo debe tener al menos 5 caracteres.')
      return
    }

    setUpdating(true)
    setReasonError('')

    try {
      const newRole = roleModal.currentRole === 'super_admin' ? 'vendor' : 'super_admin'
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', roleModal.userId)

      if (error) throw error

      setProfiles(prev => prev.map(p => p.id === roleModal.userId ? { ...p, role: newRole } : p))

      // Registrar en bitácora
      await supabase.from('platform_audit_logs').insert({
        action: 'update_role',
        target_id: roleModal.userId,
        target_name: roleModal.userName,
        reason: reason.trim(),
      })

      setRoleModal(null)
      setReason('')
    } catch (err: any) {
      setReasonError(err.message || 'Error al cambiar el rol.')
    } finally {
      setUpdating(false)
    }
  }

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = (p.full_name && p.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || p.role === roleFilter
    return matchesSearch && matchesRole
  })

  const superAdminCount = profiles.filter(p => p.role === 'super_admin').length

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
          <Users className="w-6 h-6 text-indigo-400" />
          <span>Gestión de Usuarios</span>
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Supervisa los perfiles de usuario y gestiona los roles de acceso de la plataforma.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Total Usuarios</div>
          <div className="text-2xl font-black text-white mt-1">{profiles.length}</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Vendedores</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{profiles.length - superAdminCount}</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Super Admins</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">{superAdminCount}</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 mr-2" />
          <input
            type="text"
            placeholder="Buscar por nombre o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-xs w-full text-white placeholder-slate-600 font-medium"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-[11px] text-slate-300 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">Todos los roles</option>
          <option value="vendor">Vendedores</option>
          <option value="super_admin">Super Admins</option>
        </select>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px] font-bold">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[9px]">
                <th className="py-3.5 px-5 font-black">Usuario</th>
                <th className="py-3.5 px-5 font-black">Rol</th>
                <th className="py-3.5 px-5 font-black">Tienda Asociada</th>
                <th className="py-3.5 px-5 font-black">Registro</th>
                <th className="py-3.5 px-5 font-black text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 text-xs font-medium">
                    No se encontraron usuarios con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((profile) => {
                  const userStore = getStoreForUser(profile.id)
                  return (
                    <tr key={profile.id} className="hover:bg-slate-800/20 transition-all">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-black">
                              {(profile.full_name || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-extrabold text-white">{profile.full_name || 'Sin nombre'}</div>
                            <div className="text-[9px] text-slate-500 font-mono">{profile.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-black ${
                          profile.role === 'super_admin'
                            ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {profile.role === 'super_admin' ? <ShieldCheck className="w-3 h-3" /> : <UserCircle className="w-3 h-3" />}
                          {profile.role === 'super_admin' ? 'Super Admin' : 'Vendedor'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        {userStore ? (
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <StoreIcon className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px] font-bold">{userStore.name}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-600 font-medium">Sin tienda</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 font-medium text-[10px]">
                        {new Date(profile.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleChangeRole(profile)}
                            className="p-2 rounded-lg bg-indigo-950/30 text-indigo-400 hover:bg-indigo-950/50 border border-indigo-900/30 transition-all"
                            title="Cambiar rol"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de cambio de rol */}
      {roleModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-black text-white">Cambiar Rol de Usuario</h3>
              </div>
              <button onClick={() => setRoleModal(null)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Cambiarás el rol de <span className="font-black text-white">&quot;{roleModal.userName}&quot;</span> de{' '}
              <span className="font-bold">{roleModal.currentRole === 'super_admin' ? 'Super Admin' : 'Vendedor'}</span>{' '}
              a{' '}
              <span className="font-bold text-indigo-400">{roleModal.currentRole === 'super_admin' ? 'Vendedor' : 'Super Admin'}</span>.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-300 font-bold">
                Motivo del cambio <span className="text-red-400">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => { setReason(e.target.value); setReasonError('') }}
                placeholder="Ej: Asignación temporal de privilegios por auditoría..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                rows={3}
              />
              {reasonError && <p className="text-[10px] text-red-400 font-bold">{reasonError}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                onClick={() => setRoleModal(null)}
                variant="ghost"
                className="text-slate-400 hover:text-white text-xs font-bold h-9 px-4"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmRoleChange}
                disabled={updating}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold h-9 px-5 rounded-xl"
              >
                {updating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Confirmar Cambio'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
