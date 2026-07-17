/**
 * Script de Seed para Usuario Admin de Desarrollo
 * 
 * Este script crea o actualiza el usuario super_admin para desarrollo.
 * 
 * USO:
 * npx tsx scripts/seed-dev-admin.ts
 * 
 * CREDENCIALES:
 * Email: admin@dev.app
 * Contraseña: 123-123-123
 * Rol: super_admin
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos')
  console.error('   Asegúrate de tener estas variables en tu archivo .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const ADMIN_EMAIL = 'admin@dev.app'
const ADMIN_PASSWORD = '123-123-123'
const ADMIN_USER_ID = '09e817f1-687b-4e75-b036-e788c735944a'

async function seedDevAdmin() {
  console.log('🌱 Iniciando seed de usuario admin de desarrollo...\n')

  try {
    // 1. Verificar si el usuario ya existe en auth.users
    const { data: existingUser, error: userError } = await supabase.auth.admin.getUserById(ADMIN_USER_ID)

    if (userError && !userError.message.includes('User not found')) {
      throw new Error(`Error verificando usuario: ${userError.message}`)
    }

    if (!existingUser?.user) {
      console.log('📝 Usuario no encontrado. Creando nuevo usuario en auth.users...')
      
      // Crear usuario en auth.users
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: 'Master Administrador'
        }
      })

      if (createError) {
        throw new Error(`Error creando usuario: ${createError.message}`)
      }

      console.log(`✅ Usuario creado exitosamente: ${newUser.user.email}`)
      console.log(`   ID: ${newUser.user.id}`)
    } else {
      console.log(`✅ Usuario existente encontrado: ${existingUser.user.email}`)
      console.log(`   ID: ${existingUser.user.id}`)

      // Actualizar contraseña si es necesario
      console.log('🔄 Actualizando contraseña...')
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        ADMIN_USER_ID,
        { password: ADMIN_PASSWORD }
      )

      if (updateError) {
        throw new Error(`Error actualizando contraseña: ${updateError.message}`)
      }

      console.log('✅ Contraseña actualizada exitosamente')
    }

    // 2. Crear o actualizar perfil en public.profiles
    console.log('\n📝 Verificando perfil en public.profiles...')
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: ADMIN_USER_ID,
        full_name: 'Master Administrador',
        role: 'super_admin',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (profileError) {
      throw new Error(`Error actualizando perfil: ${profileError.message}`)
    }

    console.log('✅ Perfil actualizado exitosamente')
    console.log(`   Rol: ${profile.role}`)
    console.log(`   Nombre: ${profile.full_name}`)

    // 3. Verificar estado final
    console.log('\n🎉 Seed completado exitosamente!\n')
    console.log('═══════════════════════════════════════════════════')
    console.log('CREDENCIALES DE DESARROLLO:')
    console.log('═══════════════════════════════════════════════════')
    console.log(`📧 Email:    ${ADMIN_EMAIL}`)
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`)
    console.log(`👤 Rol:      super_admin`)
    console.log(`🌐 URL:      http://localhost:3000/master/login`)
    console.log('═══════════════════════════════════════════════════\n')

  } catch (error) {
    console.error('\n❌ Error durante el seed:', error)
    process.exit(1)
  }
}

seedDevAdmin()
